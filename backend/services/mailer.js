const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

let transport;

const isMailConfigured = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const getTransport = () => {
  if (!isMailConfigured()) return null;

  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transport;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildVariantTheme = (variant = 'default') => {
  const themes = {
    welcome: { eyebrow: 'Welcome to NagarSeva', accentA: '#0ea5e9', accentB: '#10b981' },
    level_up: { eyebrow: 'Citizen tier unlocked', accentA: '#a855f7', accentB: '#f97316' },
    streak_reminder: { eyebrow: 'Streak reminder', accentA: '#f59e0b', accentB: '#ef4444' },
    issue_created: { eyebrow: 'Issue submitted', accentA: '#0ea5e9', accentB: '#10b981' },
    issue_status: { eyebrow: 'Issue status updated', accentA: '#14b8a6', accentB: '#22c55e' },
    issue_resolved: { eyebrow: 'Issue resolved', accentA: '#22c55e', accentB: '#0ea5e9' },
    issue_fixing: { eyebrow: 'Municipality is working on it', accentA: '#f59e0b', accentB: '#10b981' },
    authenticity: { eyebrow: 'Municipal review update', accentA: '#6366f1', accentB: '#10b981' },
    default: { eyebrow: 'Notification update', accentA: '#0ea5e9', accentB: '#10b981' },
  };
  return themes[variant] || themes.default;
};

const resolveLogoPath = () => {
  const configured = process.env.EMAIL_LOGO_PATH;
  const candidates = [
    configured,
    path.resolve(__dirname, '../assets/nagar-logo.png'),
    path.resolve(__dirname, '../../frontend/public/nagar-logo.png'),
    path.resolve(__dirname, '../../nagar-logo.png'),
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
};

const buildNotificationEmailHtml = ({
  recipientName = 'Citizen',
  title,
  message,
  issueTitle = '',
  issueLocation = '',
  ctaUrl = '',
  ctaLabel = 'Open NagarSeva',
  variant = 'default',
}) => {
  const theme = buildVariantTheme(variant);
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeRecipientName = escapeHtml(recipientName);
  const safeIssueTitle = escapeHtml(issueTitle);
  const safeIssueLocation = escapeHtml(issueLocation);
  const safeCtaUrl = escapeHtml(ctaUrl);
  const safeCtaLabel = escapeHtml(ctaLabel);

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${safeTitle}</title>
    </head>
    <body style="margin:0;padding:0;background:#071224;font-family:Inter,Arial,sans-serif;color:#e5eefc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#071224;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:linear-gradient(180deg,#0c1730 0%,#0a1327 100%);border:1px solid rgba(69,211,183,.18);border-radius:28px;overflow:hidden;">
              <tr>
                <td style="padding:24px 32px 18px;background:linear-gradient(135deg,${theme.accentA} 0%,${theme.accentB} 100%);">
                  <div style="display:flex;align-items:center;gap:14px;">
                    <img src="cid:nagarseva-logo" alt="NagarSeva" style="width:52px;height:52px;object-fit:contain;border-radius:14px;background:rgba(255,255,255,.10);padding:6px;" />
                    <div>
                      <div style="font-size:32px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;">NagarSeva</div>
                      <div style="margin-top:6px;font-size:14px;color:rgba(255,255,255,.88);">${escapeHtml(theme.eyebrow)}</div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px;">
                  <div style="font-size:14px;color:#7dd3fc;text-transform:uppercase;letter-spacing:.14em;font-weight:700;">${escapeHtml(theme.eyebrow)}</div>
                  <h1 style="margin:12px 0 12px;font-size:30px;line-height:1.15;letter-spacing:-0.03em;color:#ffffff;">${safeTitle}</h1>
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#d2ddf4;">Hello ${safeRecipientName},</p>
                  <p style="margin:0 0 24px;font-size:16px;line-height:1.75;color:#d2ddf4;">${safeMessage}</p>
                  ${safeIssueTitle ? `
                  <div style="margin:0 0 24px;padding:18px 20px;border-radius:20px;background:#101b35;border:1px solid rgba(125,211,252,.14);">
                    <div style="font-size:12px;color:#7dd3fc;text-transform:uppercase;letter-spacing:.14em;font-weight:700;">Issue context</div>
                    <div style="margin-top:10px;font-size:20px;font-weight:700;color:#ffffff;">${safeIssueTitle}</div>
                    ${safeIssueLocation ? `<div style="margin-top:8px;font-size:14px;color:#93c5fd;">${safeIssueLocation}</div>` : ''}
                  </div>` : ''}
                  ${safeCtaUrl ? `
                  <a href="${safeCtaUrl}" style="display:inline-block;padding:14px 22px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9 0%,#10b981 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">
                    ${safeCtaLabel}
                  </a>` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 28px;color:#7f8fb0;font-size:13px;line-height:1.6;">
                  You are receiving this because your NagarSeva account has in-app or email civic alerts enabled.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

const sendNotificationEmail = async ({
  to,
  recipientName,
  subject,
  title,
  message,
  issueTitle,
  issueLocation,
  ctaUrl,
  ctaLabel,
  variant = 'default',
}) => {
  const transporter = getTransport();

  if (!transporter || !to) {
    return { skipped: true };
  }

  const fromName = process.env.SMTP_FROM_NAME || 'NagarSeva';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const html = buildNotificationEmailHtml({
    recipientName,
    title,
    message,
    issueTitle,
    issueLocation,
    ctaUrl,
    ctaLabel,
    variant,
  });

  const attachments = [];
  const logoPath = resolveLogoPath();
  if (logoPath) {
    attachments.push({
      filename: 'nagar-logo.png',
      path: logoPath,
      cid: 'nagarseva-logo',
    });
  }

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
    attachments,
  });

  return { skipped: false };
};

module.exports = {
  isMailConfigured,
  sendNotificationEmail,
  buildNotificationEmailHtml,
};
