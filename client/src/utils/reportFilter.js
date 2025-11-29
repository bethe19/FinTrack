/**
 * Utility functions for managing report type preferences and filtering data
 */

const REPORT_TYPE_KEY = 'finance_report_type';

export const REPORT_TYPES = {
    ALL_TIME: 'all_time',
    PER_YEAR: 'per_year',
    PER_MONTH: 'per_month'
};

/**
 * Get the current report type preference from localStorage
 */
export const getReportType = () => {
    const stored = localStorage.getItem(REPORT_TYPE_KEY);
    return stored || REPORT_TYPES.ALL_TIME;
};

/**
 * Set the report type preference
 */
export const setReportType = (type) => {
    localStorage.setItem(REPORT_TYPE_KEY, type);
};

/**
 * Get date range based on report type
 */
export const getDateRange = (reportType) => {
    const now = new Date();
    const startDate = new Date();

    switch (reportType) {
        case REPORT_TYPES.PER_MONTH:
            startDate.setMonth(now.getMonth());
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            break;

        case REPORT_TYPES.PER_YEAR:
            startDate.setMonth(0);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            break;

        case REPORT_TYPES.ALL_TIME:
        default:
            return null; // No filtering for all time
    }

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
};

/**
 * Filter transactions based on report type
 */
export const filterTransactionsByReportType = (transactions, reportType) => {
    if (!transactions || transactions.length === 0) return transactions;
    
    if (reportType === REPORT_TYPES.ALL_TIME) {
        return transactions;
    }

    const dateRange = getDateRange(reportType);
    if (!dateRange) return transactions;

    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transaction_date || transaction.created_at);
        return transactionDate >= dateRange.startDate && transactionDate <= dateRange.endDate;
    });
};

/**
 * Get display label for report type
 */
export const getReportTypeLabel = (reportType) => {
    switch (reportType) {
        case REPORT_TYPES.ALL_TIME:
            return 'All Time';
        case REPORT_TYPES.PER_YEAR:
            return 'This Year';
        case REPORT_TYPES.PER_MONTH:
            return 'This Month';
        default:
            return 'All Time';
    }
};

