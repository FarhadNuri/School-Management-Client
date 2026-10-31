import { formatDate } from './studentAdapter';

const formatCurrency = (amount = 0, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'USD').toUpperCase()
    }).format(amount);
  } catch {
    return `${currency || 'USD'} ${amount}`;
  }
};

export const adaptPayment = (raw) => {
  if (!raw) return null;

  const id = String(raw.id || raw._id || '');
  const title = raw.title || 'Tuition & Fees';
  const amount = Number(raw.amount) || 0;
  const amountPaid = Number(raw.amountPaid) || 0;
  const currency = (raw.currency || 'USD').toUpperCase();
  const status = (raw.status || 'pending').toLowerCase();
  const balance = Math.max(0, amount - amountPaid);

  const dueDate = formatDate(raw.dueDate);
  const isOverdue = raw.dueDate ? new Date(raw.dueDate) < new Date() && status !== 'paid' : false;

  // Paid date - check raw.paidDate, raw.paidAt, and fallback to raw.updatedAt if paid
  const rawPaid = raw.paidDate || raw.paidAt || (status === 'paid' ? raw.updatedAt : null);
  const formattedPaid = formatDate(rawPaid);
  const paidDate = formattedPaid && formattedPaid !== '—' ? formattedPaid : (status === 'paid' ? formatDate(new Date()) : '');

  // Issued date (createdAt)
  const issuedDate = raw.createdAt ? formatDate(raw.createdAt) : formatDate(new Date());

  // Checkout/payment URL: stripeHostedInvoiceUrl or stripe checkout session URL (only if unpaid)
  const payUrl =
    status !== 'paid' && status !== 'cancelled'
      ? raw.stripeHostedInvoiceUrl || raw.checkoutUrl || raw.payUrl || null
      : null;

  // Invoice PDF link (shows amount due and itemization)
  const invoicePdf =
    raw.invoicePdf ||
    raw.stripeInvoicePdf ||
    raw.stripeHostedInvoiceUrl ||
    raw.hostedInvoiceUrl ||
    null;

  // Official Stripe payment receipt URL (with payment history, receipt number, card details)
  const receiptUrl =
    raw.receiptUrl ||
    (status === 'paid' ? (raw.stripeHostedInvoiceUrl || raw.hostedInvoiceUrl || raw.stripeInvoicePdf || null) : null);

  const invoiceNumber = id.slice(-8);

  const studentName =
    raw.student?.name ||
    (raw.student?.firstName
      ? `${raw.student.firstName} ${raw.student.lastName || ''}`.trim()
      : '') || 'Student';

  const guardianName =
    raw.guardian?.name ||
    (raw.guardian?.firstName
      ? `${raw.guardian.firstName} ${raw.guardian.lastName || ''}`.trim()
      : '') || 'Guardian';

  const guardianEmail =
    raw.guardian?.email ||
    raw.guardian?.user?.email ||
    '';

  const classGrade =
    raw.class?.className ||
    raw.student?.classGrade ||
    '';

  const purpose = raw.purpose || 'tuition';
  const feeType = raw.feeType || (purpose.charAt(0).toUpperCase() + purpose.slice(1));

  return {
    id,
    _id: id,
    title,
    purpose,
    feeType,
    amountFormatted: formatCurrency(amount, currency),
    balanceFormatted: formatCurrency(balance, currency),
    amountPaidFormatted: formatCurrency(amountPaid, currency),
    amount,
    rawAmount: amount,
    amountPaid,
    balance,
    currency,
    status,
    isOverdue,
    dueDate,
    paidDate,
    issuedDate,
    payUrl,
    receiptUrl,
    invoicePdf,
    stripeHostedInvoiceUrl: raw.stripeHostedInvoiceUrl || raw.hostedInvoiceUrl || null,
    invoiceNumber,
    studentName,
    guardianName,
    guardianEmail,
    classGrade,
    description: raw.description || '',
    notes: raw.notes || ''
  };
};

export const adaptPaymentsList = (data) => {
  const list = Array.isArray(data) ? data : data?.payments || [];
  const payments = list.map(adaptPayment).filter(Boolean);

  let outstandingSum = 0;
  let paidSum = 0;
  let openCount = 0;
  let overdueCount = 0;

  payments.forEach((p) => {
    if (p.status === 'paid') {
      paidSum += p.amount;
    } else {
      outstandingSum += p.balance;
      openCount++;
      if (p.isOverdue) overdueCount++;
    }
  });

  return {
    count: payments.length,
    payments,
    stats: {
      outstanding: formatCurrency(outstandingSum),
      paid: formatCurrency(paidSum),
      openInvoices: openCount,
      overdue: overdueCount
    }
  };
};
