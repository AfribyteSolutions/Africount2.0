/**
 * Format date with locale-specific formatting
 */
export function formatDate(
  date: Date | string | number,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Format date with time
 */
export function formatDateTime(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format date as short format (e.g., "Jan 1, 2026")
 */
export function formatDateShort(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date as long format (e.g., "January 1, 2026")
 */
export function formatDateLong(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time only
 */
export function formatTime(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  return formatDate(date, locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSecs) < 60) {
    return rtf.format(-diffSecs, 'second');
  } else if (Math.abs(diffMins) < 60) {
    return rtf.format(-diffMins, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(-diffHours, 'hour');
  } else {
    return rtf.format(-diffDays, 'day');
  }
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get date range for common periods
 */
export function getDateRange(period: 'today' | 'week' | 'month' | 'quarter' | 'year'): {
  start: Date;
  end: Date;
} {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(end.getDate() - end.getDay());
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'quarter':
      const quarter = Math.floor(end.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}
