document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

const menu = document.querySelector('.menu');
const links = document.querySelector('.links');
if (menu) {
  menu.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
}

const form = document.querySelector('#contact-form');
if (form) {
  const notice = form.querySelector('.notice');
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
    notice.textContent = '';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'Unable to send inquiry.');

      notice.textContent = result.message;
      form.reset();
    } catch (error) {
      notice.textContent = error.message || 'We could not send your inquiry. Please email us directly.';
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}
