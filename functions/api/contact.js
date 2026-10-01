const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function clean(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: 'Invalid request.' }, 400);
  }

  // Honeypot: real visitors never fill this hidden field.
  if (clean(body.website, 200)) {
    return json({ ok: true, message: 'Thank you. Your inquiry has been received.' });
  }

  const firstName = clean(body.firstName, 80);
  const lastName = clean(body.lastName, 80);
  const email = clean(body.email, 254);
  const phone = clean(body.phone, 40);
  const message = clean(body.message, 5000);

  if (!firstName || !lastName || !email) {
    return json({ ok: false, message: 'Please complete all required fields.' }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, message: 'Please enter a valid email address.' }, 400);
  }

  const to = env.CONTACT_TO || 'dlanier@brightpathstudentservices.com';
  const from = env.CONTACT_FROM || 'website@brightpathstudentservices.com';
  const fullName = `${firstName} ${lastName}`;
  const subject = `New BrightPath website inquiry — ${fullName}`;
  const text = [
    'New inquiry from brightpathstudentservices.com',
    '',
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    '',
    'Message:',
    message || 'No message provided',
  ].join('\n');

  const html = `
    <h2>New BrightPath website inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message || 'No message provided').replace(/\n/g, '<br>')}</p>
  `;

  try {
    await env.EMAIL.send({
      to,
      from: { email: from, name: 'BrightPath Website' },
      replyTo: { email, name: fullName },
      subject,
      text,
      html,
    });
    return json({ ok: true, message: 'Thank you. Your inquiry has been sent.' });
  } catch (error) {
    console.error('Contact email failed:', error?.code || error?.message || error);
    return json({ ok: false, message: 'We could not send your inquiry right now. Please email us directly.' }, 500);
  }
}

export function onRequest() {
  return json({ ok: false, message: 'Method not allowed.' }, 405);
}
