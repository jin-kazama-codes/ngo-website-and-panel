import { User } from '../types';

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

export function downloadRegistrationPaymentSlip(user: User): void {
  if (user.status !== 'approved' || !user.paymentUtr) {
    throw new Error('An approved member with a recorded payment UTR is required.');
  }

  const receiptNumber = `MFCT-REG-${user.membershipId || user.id}`;
  const paymentDate = user.joinDate || 'N/A';
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
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join('');

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
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #17211c; font: 15px Arial, sans-serif; }
    .slip { max-width: 760px; margin: 30px auto; border: 2px dashed #0f3322; padding: 42px; }
    header { text-align: center; color: #0f3322; border-bottom: 1px solid #d6e2da; padding-bottom: 20px; }
    h1 { margin: 0; font-size: 24px; }
    header p { margin: 7px 0 0; color: #59675e; }
    .receipt { margin: 20px 0; text-align: right; color: #59675e; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 13px 10px; border-bottom: 1px solid #e4e9e5; text-align: left; vertical-align: top; }
    th { width: 42%; color: #24382c; }
    td { overflow-wrap: anywhere; }
    .amount { color: #087443; font-size: 20px; font-weight: 800; }
    footer { margin-top: 28px; text-align: center; color: #0f3322; font-weight: 700; }
    @media print { .slip { margin: 0 auto; } }
  </style>
</head>
<body>
  <main class="slip">
    <header>
      <h1>MOHAMMAD FAEEM CHARITABLE TRUST</h1>
      <p>Membership Registration Payment Slip</p>
    </header>
    <div class="receipt">Receipt No: ${escapeHtml(receiptNumber)}</div>
    <table>${rows}</table>
    <footer>Thank you for becoming a member of MFCT.</footer>
  </main>
  <script>window.onload = () => window.print();</script>
</body>
</html>`);
  printWindow.document.close();
}
