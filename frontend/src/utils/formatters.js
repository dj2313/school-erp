import { format, formatDistance, parseISO } from 'date-fns';

/**
 * Format a date value to a readable string
 * @param {string|Date} date
 * @param {string} formatStr - date-fns format string
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
    if (!date) return '-';
    try {
        const d = typeof date === 'string' ? parseISO(date) : date;
        return format(d, formatStr);
    } catch {
        return '-';
    }
};

/**
 * Format a number as Indian currency (₹)
 */
export const formatCurrency = (amount) => {
    if (amount == null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format a relative time (e.g. "3 days ago")
 */
export const formatRelativeTime = (date) => {
    if (!date) return '-';
    try {
        const d = typeof date === 'string' ? parseISO(date) : date;
        return formatDistance(d, new Date(), { addSuffix: true });
    } catch {
        return '-';
    }
};

/**
 * Format a phone number for display
 */
export const formatPhone = (phone) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

/**
 * Format percentage
 */
export const formatPercent = (value, total) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
};
