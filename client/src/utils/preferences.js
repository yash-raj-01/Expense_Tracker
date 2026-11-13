const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

export function getCurrencyPreference() {
  const savedCurrency = localStorage.getItem('ledger_currency') || 'INR';
  return CURRENCIES.includes(savedCurrency) ? savedCurrency : 'INR';
}

export function getCurrencySymbol() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: getCurrencyPreference(),
  }).formatToParts(0).find((part) => part.type === 'currency')?.value || getCurrencyPreference();
}

export function formatMinorAmount(amount) {
  return formatCurrencyAmount((Number(amount) || 0) / 100);
}

export function formatCurrencyAmount(amount) {
  const currency = getCurrencyPreference();
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export function formatDatePreference(value) {
  if (!value) return '—';

  let year;
  let month;
  let day;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    [year, month, day] = value.slice(0, 10).split('-');
  } else {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    year = String(date.getFullYear());
    month = String(date.getMonth() + 1).padStart(2, '0');
    day = String(date.getDate()).padStart(2, '0');
  }

  const format = localStorage.getItem('ledger_date_format') || 'DD/MM/YYYY';
  if (!DATE_FORMATS.includes(format)) return `${day}/${month}/${year}`;
  if (format === 'MM/DD/YYYY') return `${month}/${day}/${year}`;
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
  return `${day}/${month}/${year}`;
}

export function getDefaultTransactionType() {
  const savedType = localStorage.getItem('ledger_default_transaction_type') || 'EXPENSE';
  return savedType === 'INCOME' ? 'INCOME' : 'EXPENSE';
}
