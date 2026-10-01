# BrightPath contact form — Cloudflare setup

The frontend now POSTs contact submissions to `/api/contact`. The handler is in `functions/api/contact.js` and sends the inquiry through a Cloudflare Email Service binding named `EMAIL`.

## 1. Onboard the domain for Email Sending

In Cloudflare Dashboard, open **Compute > Email Service > Email Sending**, choose **Onboard Domain**, and select `brightpathstudentservices.com`. Allow Cloudflare to create the required SPF/DKIM/bounce DNS records.

## 2. Add the Email binding to the Pages project

Add a **Send Email / Email Service binding** named exactly:

`EMAIL`

For least privilege, restrict the destination to:

`dlanier@brightpathstudentservices.com`

If Cloudflare asks for allowed sender addresses, allow:

`website@brightpathstudentservices.com`

## 3. Optional environment variables

The handler already defaults to these values, but they can be configured in the Pages project:

- `CONTACT_TO=dlanier@brightpathstudentservices.com`
- `CONTACT_FROM=website@brightpathstudentservices.com`

These are configuration values, not secrets.

## 4. Deploy

Deploy the project with the `functions/` directory included. Cloudflare Pages will expose `functions/api/contact.js` as `/api/contact`.

## 5. Test

Open the live Contact page, submit a test inquiry, and confirm it arrives at `dlanier@brightpathstudentservices.com`. The email's Reply-To is set to the visitor's email, so replying from the inbox goes directly to the person who submitted the form.

## Recommended next hardening step

Add Cloudflare Turnstile to the form and validate its token in the Function before sending email. The current implementation includes field validation, length limits, output escaping, and a honeypot, but Turnstile provides stronger automated-bot protection.
