interface SendEmailResult {
  sent: boolean;
  error?: string;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<SendEmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const configuredSender = process.env.EMAIL_FROM || 'MFCT Portal <info@mfcttrust.com>';
  const senderMatch = configuredSender.match(/^(.*)<([^>]+)>$/);
  const senderName = senderMatch?.[1].trim() || 'MFCT Portal';
  const senderAddress = senderMatch?.[2].trim() || configuredSender.trim();
  const errors: string[] = [];

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: configuredSender,
          to,
          subject,
          html,
        }),
      });
      if (response.ok) return { sent: true };

      const responseBody = await response.json().catch(() => ({}));
      errors.push(`Resend: ${responseBody?.message || `HTTP ${response.status}`}`);
    } catch (error) {
      errors.push(`Resend: ${error instanceof Error ? error.message : 'request failed'}`);
    }
  }

  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderAddress },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });
      if (response.ok) return { sent: true };

      const responseBody = await response.json().catch(() => ({}));
      errors.push(`Brevo: ${responseBody?.message || `HTTP ${response.status}`}`);
    } catch (error) {
      errors.push(`Brevo: ${error instanceof Error ? error.message : 'request failed'}`);
    }
  }

  if (errors.length === 0) {
    return { sent: false, error: 'No email provider is configured. Set RESEND_API_KEY or BREVO_API_KEY.' };
  }
  return { sent: false, error: errors.join('; ') };
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}
