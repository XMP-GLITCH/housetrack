export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '0 XAF';
  return num.toLocaleString('en-US') + ' XAF';
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
