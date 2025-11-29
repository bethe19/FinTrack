const { getAllTransactions, getTransactionStats } = require('../database');

/**
 * Get analytics data (income, expenses, monthly breakdown)
 */
const getAnalyticsHandler = (req, res) => {
    const userId = req.userId; // From auth middleware
    
    getAllTransactions(userId, (err, transactions) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch analytics' });
        }

        // Calculate analytics
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');

        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

        // Monthly breakdown
        const monthlyData = {};
        transactions.forEach(t => {
            const date = new Date(t.transaction_date || t.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, income: 0, expense: 0 };
            }

            if (t.type === 'income') {
                monthlyData[monthKey].income += t.amount;
            } else {
                monthlyData[monthKey].expense += t.amount;
            }
        });

        res.json({
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            transactionCount: transactions.length,
            avgIncome: income.length > 0 ? totalIncome / income.length : 0,
            avgExpense: expenses.length > 0 ? totalExpense / expenses.length : 0,
            monthlyData: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
        });
    });
};

/**
 * Get transaction statistics
 */
const getStatsHandler = (req, res) => {
    const userId = req.userId; // From auth middleware
    
    getTransactionStats(userId, (err, stats) => {
        if (err) {
            console.error('Error fetching stats:', err);
            return res.status(500).json({ error: 'Failed to fetch statistics' });
        }

        const formatted = {
            income: { count: 0, total: 0, average: 0 },
            expense: { count: 0, total: 0, average: 0 }
        };

        stats.forEach(stat => {
            if (stat.type === 'income') {
                formatted.income = {
                    count: stat.count,
                    total: stat.total || 0,
                    average: stat.average || 0
                };
            } else if (stat.type === 'expense') {
                formatted.expense = {
                    count: stat.count,
                    total: stat.total || 0,
                    average: stat.average || 0
                };
            }
        });

        formatted.balance = formatted.income.total - formatted.expense.total;
        formatted.totalTransactions = formatted.income.count + formatted.expense.count;

        res.json(formatted);
    });
};

module.exports = {
    getAnalyticsHandler,
    getStatsHandler
};

