const pad2 = (value) => String(value).padStart(2, '0');

export const toDateInputValue = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export const todayDateInputValue = () => toDateInputValue(new Date());

export const parseDateInputValue = (value) => {
  if (!value || typeof value !== 'string') return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const daysBetweenDateInputs = (start, end) => {
  const startDate = parseDateInputValue(start);
  const endDate = parseDateInputValue(end);
  if (!startDate || !endDate) return 0;
  return Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
};

export const formatDisplayDate = (value, options = {}) => {
  if (!value) return 'N/A';

  const dateInput = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? parseDateInputValue(value)
    : new Date(value);

  if (!dateInput || Number.isNaN(dateInput.getTime())) return 'N/A';

  return dateInput.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

export const formatDisplayDateTime = (value) => {
  if (!value) return 'N/A';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
