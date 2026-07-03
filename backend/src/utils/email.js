const nodemailer = require('nodemailer');

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendInviteEmail = async ({ toEmail, toName, loginLink, isNewUser }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email service not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to .env');
  }

  const transporter = createTransport();
  const fromName = process.env.FROM_NAME || 'HouseTrack';
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

  const subject = isNewUser
    ? `You've been invited to HouseTrack`
    : `Your HouseTrack login link`;

  const greeting = toName ? `Hi ${toName},` : 'Hi,';
  const bodyText = isNewUser
    ? `Your landlord has added you to HouseTrack. Click the button below to set up your account and access your tenant portal — pay rent, view receipts, and submit complaints.`
    : `Here is a fresh login link for your HouseTrack tenant portal. The link expires in 24 hours.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#C97D2F;padding:28px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">HouseTrack</p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Rental management, simplified</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;font-size:16px;color:#111827;font-weight:600;">${greeting}</p>
              <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.6;">${bodyText}</p>
              <a href="${loginLink}"
                 style="display:inline-block;background:#C97D2F;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                ${isNewUser ? 'Set Up My Account' : 'Log In to HouseTrack'}
              </a>
              <p style="margin:24px 0 0;font-size:12px;color:#9CA3AF;">
                This link expires in 24 hours. If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #F3F4F6;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                Sent by HouseTrack &mdash; Rental Property Management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject,
    html,
  });
};

module.exports = { sendInviteEmail };
