import { User } from '../types';
import { MFCT_LOGO_BASE64 } from './mfctLogoBase64';

function escapeHtml(value: string): string {
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

function formatSlipDate(rawDate?: string | Date | null): string {
  if (!rawDate) {
    return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  if (rawDate instanceof Date) {
    if (!isNaN(rawDate.getTime())) {
      const d = String(rawDate.getDate()).padStart(2, '0');
      const m = String(rawDate.getMonth() + 1).padStart(2, '0');
      const y = rawDate.getFullYear();
      return `${d}/${m}/${y}`;
    }
    return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const str = String(rawDate).trim();
  if (!str) return 'N/A';

  // 1) Match DD/MM/YYYY or DD-MM-YYYY (e.g. 21/10/2026 or 21-10-2026)
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3].length === 2 ? `20${dmyMatch[3]}` : dmyMatch[3];
    return `${d}/${m}/${y}`;
  }

  // 2) Match YYYY-MM-DD or YYYY/MM/DD (e.g. 2026-10-21)
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${d}/${m}/${y}`;
  }

  // 3) Try standard Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = parsed.getFullYear();
    return `${d}/${m}/${y}`;
  }

  // 4) Clean any ISO or timestamp suffix
  const cleaned = str.split(/[T\s,]/)[0];
  if (cleaned && cleaned.length >= 8 && !cleaned.toLowerCase().includes('invalid')) {
    return cleaned;
  }

  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function downloadRegistrationPaymentSlip(user: User): void {
  if (user.status !== 'approved' || !user.paymentUtr) {
    throw new Error('An approved member with a recorded payment UTR is required.');
  }

  const receiptNumber = `MFCT-REG-${user.membershipId || user.id}`;
  const paymentDate = formatSlipDate(user.joinDate);
  const details: [string, string][] = [
    ['Member Name', user.name],
    ['Member ID', user.membershipId || user.id],
    ['Email', user.email || 'N/A'],
    ['Registration Payment', `₹${(user.membershipFee ?? 100).toFixed(2)}`],
    ['Payment Date', paymentDate],
    ['Transaction / UTR ID', user.paymentUtr],
    ['Payment Method', user.paymentMethod || 'N/A'],
    ['Purpose', 'Membership Registration Fee'],
  ];
  const rows = details
    .map(
      ([label, value]) =>
        `<tr><th>${escapeHtml(label)}</th><td class="${label === 'Registration Payment' ? 'amount' : ''}">${escapeHtml(value)}</td></tr>`
    )
    .join('');

  const logoUrl = MFCT_LOGO_BASE64;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Allow pop-ups to download the registration payment slip.');
  }
  printWindow.opener = null;

  printWindow.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Registration Payment Slip - ${escapeHtml(receiptNumber)}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 14mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #17211c; font-family: Arial, sans-serif; font-size: 12px; }

    .slip {
      position: relative;
      max-width: 680px;
      margin: 10px auto;
      border: 2.5px dashed #c0392b;
      padding: 24px 34px;
      background: #fff;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* MFCT Logo watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 250px;
      height: 250px;
      opacity: 0.10;
      pointer-events: none;
      object-fit: contain;
      z-index: 0;
    }

    .content { position: relative; z-index: 1; }

    header {
      text-align: center;
      color: #c0392b;
      padding-bottom: 12px;
      border-bottom: 1.5px solid #f5cac5;
      margin-bottom: 10px;
    }
    h1 {
      margin: 0 0 3px;
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    header .subtitle {
      margin: 3px 0 0;
      color: #555;
      font-size: 11.5px;
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 11px;
      color: #666;
    }
    .receipt-row .badge {
      background: #f0fff4;
      border: 1px solid #6ee7b7;
      color: #065f46;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 10px;
    }

    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; }
    th, td {
      padding: 8px 8px;
      border-bottom: 1px solid #e8eee9;
      text-align: left;
      vertical-align: middle;
    }
    th {
      width: 42%;
      color: #1a3328;
      font-weight: 700;
      font-size: 11.5px;
    }
    td {
      overflow-wrap: anywhere;
      color: #2d2d2d;
      font-size: 11.5px;
    }
    .amount { color: #087443; font-size: 16px; font-weight: 900; }

    footer {
      margin-top: 10px;
      text-align: center;
      color: #c0392b;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.3px;
      padding-top: 10px;
      border-top: 1.5px solid #f5cac5;
    }
    .footer-note {
      margin-top: 3px;
      font-size: 9.5px;
      font-weight: 400;
      color: #777;
    }

    @media print {
      html, body {
        width: 100%;
        height: auto;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .slip {
        margin: 0 auto !important;
        border: 2.5px dashed #c0392b !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  <main class="slip">
    <img class="watermark" src="${logoUrl}" alt="MFCT Logo" />
    <div class="content">
      <header>
        <h1>Mohammad Faeem Charitable Trust</h1>
        <p class="subtitle">Membership Registration Payment Slip</p>
      </header>

      <div class="receipt-row">
        <span>Receipt No: <strong>${escapeHtml(receiptNumber)}</strong></span>
        <span class="badge">✓ Payment Recorded</span>
      </div>

      <table>${rows}</table>

      <footer>
        Thank You For Becoming a Member of MFCT
        <p class="footer-note">This is a computer-generated payment slip. For support: contact@mfct.org</p>
      </footer>
    </div>
  </main>
  <script>window.onload = () => window.print();</script>
</body>
</html>`);
  printWindow.document.close();
}

