/**
 * Indian Rupee / Numeric Formatter
 */
export const formatCurrency = (val, showPlus = false) => {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const num = Number(val);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  if (showPlus && num > 0) {
    return `+${formatted}`;
  }
  return formatted;
};

export const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '-';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(Number(val));
};

/**
 * Format date in Indian locale (DD/MM/YYYY)
 */
export const formatDateIST = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

/**
 * Format DateTime in IST
 */
export const formatDateTimeIST = (isoStr) => {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return isoStr;
  }
};
