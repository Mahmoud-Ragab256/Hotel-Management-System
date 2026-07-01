export const toDateInputValue = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const isoDate = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (isoDate) return isoDate;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDate = (value, fallback = 'N/A') => {
  const inputValue = toDateInputValue(value);
  if (!inputValue) return fallback;

  const [year, month, day] = inputValue.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (value, fallback = 'N/A') => {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const getTodayInputValue = () => toDateInputValue(new Date());

export const getTomorrowInputValue = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
};

export const calculateNights = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return 0;

  const start = new Date(`${toDateInputValue(checkInDate)}T00:00:00`);
  const end = new Date(`${toDateInputValue(checkOutDate)}T00:00:00`);
  const diff = end.getTime() - start.getTime();

  if (!Number.isFinite(diff) || diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
