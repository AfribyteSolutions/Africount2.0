/**
 * Format amount with currency symbol and locale-specific formatting
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if currency code is invalid
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Format amount without currency symbol (just the number)
 */
export function formatNumber(
  amount: number,
  locale: string = 'en-US',
  minimumFractionDigits: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  }).format(amount);
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string, locale: string = 'en-US'): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  });
  const parts = formatter.formatToParts(1);
  const symbolPart = parts.find((part) => part.type === 'currency');
  return symbolPart?.value || currencyCode;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  // Remove all non-numeric characters except decimal point and minus sign
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
