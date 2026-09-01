const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getDashboardUrl = (emailId) => {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (!configuredUrl || !emailId) return null;

  try {
    const url = new URL(configuredUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.pathname = `/dashboard/inbox/${encodeURIComponent(emailId)}`;
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
};

const formatAttachmentList = (attachments = []) => attachments.length > 0
  ? attachments.map((attachment) => {
      const size = Number.isFinite(attachment.size)
        ? ` (${Math.max(0, Math.round(attachment.size / 1024))} KB)`
        : '';
      return `- ${attachment.filename || 'Unnamed attachment'}${attachment.contentType ? ` [${attachment.contentType}]` : ''}${size}`;
    }).join('\n')
  : 'None';

export function buildQuarantineReviewNotification({
  emailId,
  aliasEmail,
  sender,
  subject,
  bodyPlain,
  spamReason,
  receivedAt,
  attachments = [],
}) {
  const dashboardUrl = getDashboardUrl(emailId);
  const receivedLabel = receivedAt ? new Date(receivedAt).toISOString() : 'Unknown';
  const originalBody = bodyPlain || '[The sender did not provide a plain-text body.]';
  const attachmentList = formatAttachmentList(attachments);

  const text = [
    'INVISIMAIL QUARANTINE REVIEW',
    'This message was quarantined because it may be spam. Do not click links or open attachments unless you verify the sender.',
    '',
    `Alias: ${aliasEmail || 'Unknown'}`,
    `From: ${sender || 'Unknown'}`,
    `Subject: ${subject || '(No Subject)'}`,
    `Received: ${receivedLabel}`,
    `Reason: ${spamReason || 'Spam indicators detected'}`,
    '',
    'Original message (plain text):',
    '---------------------------------',
    originalBody,
    '',
    'Attachments (not included in this notification):',
    attachmentList,
    '',
    dashboardUrl
      ? `Open this message safely in the InvisiMail dashboard: ${dashboardUrl}`
      : 'Open the Spam folder in the InvisiMail dashboard to review the original message.',
  ].join('\n');

  const htmlBody = escapeHtml(originalBody);
  const attachmentHtml = attachments.length > 0
    ? `<ul>${attachments.map((attachment) => `<li>${escapeHtml(attachment.filename || 'Unnamed attachment')}${attachment.contentType ? ` <span>(${escapeHtml(attachment.contentType)})</span>` : ''}${Number.isFinite(attachment.size) ? ` <span>(${Math.max(0, Math.round(attachment.size / 1024))} KB)</span>` : ''}</li>`).join('')}</ul>`
    : '<p>None</p>';
  const dashboardHtml = dashboardUrl
    ? `<p><a href="${escapeHtml(dashboardUrl)}" target="_blank" rel="noopener noreferrer">Open this message in the InvisiMail dashboard</a></p>`
    : '<p>Open the Spam folder in the InvisiMail dashboard to review the original message.</p>';

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <h2 style="color: #991b1b; margin: 0 0 8px;">InvisiMail quarantine review</h2>
        <p style="color: #7f1d1d; margin: 0;">This message may be spam. Do not click links or open attachments unless you verify the sender.</p>
      </div>
      <table style="border-collapse: collapse; margin-bottom: 16px;">
        <tr><td style="padding: 3px 16px 3px 0;"><strong>Alias</strong></td><td>${escapeHtml(aliasEmail || 'Unknown')}</td></tr>
        <tr><td style="padding: 3px 16px 3px 0;"><strong>From</strong></td><td>${escapeHtml(sender || 'Unknown')}</td></tr>
        <tr><td style="padding: 3px 16px 3px 0;"><strong>Subject</strong></td><td>${escapeHtml(subject || '(No Subject)')}</td></tr>
        <tr><td style="padding: 3px 16px 3px 0;"><strong>Received</strong></td><td>${escapeHtml(receivedLabel)}</td></tr>
        <tr><td style="padding: 3px 16px 3px 0;"><strong>Reason</strong></td><td>${escapeHtml(spamReason || 'Spam indicators detected')}</td></tr>
      </table>
      <h3 style="margin-bottom: 8px;">Original message (plain text)</h3>
      <pre style="white-space: pre-wrap; overflow-wrap: anywhere; background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px;">${htmlBody}</pre>
      <h3 style="margin-bottom: 8px;">Attachments (not included)</h3>
      ${attachmentHtml}
      ${dashboardHtml}
    </div>
  `;

  return { text, html };
}

export { escapeHtml };
