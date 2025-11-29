/**
 * Financial Insights Analysis Utility
 * Detects interesting patterns and insights from transaction data
 */

/**
 * Analyze transactions and extract financial insights
 */
export const analyzeFinancialInsights = (transactions) => {
    if (!transactions || transactions.length === 0) {
        return {
            overspentMonths: [],
            bestMonths: [],
            spendingStreaks: [],
            incomeTrends: [],
            savingsRate: 0,
            insights: []
        };
    }

    // Group transactions by month
    const monthlyData = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.transaction_date || transaction.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                month: monthKey,
                monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                income: 0,
                expenses: 0,
                transactions: []
            };
        }
        
        if (transaction.type === 'income') {
            monthlyData[monthKey].income += transaction.amount;
        } else if (transaction.type === 'expense') {
            monthlyData[monthKey].expenses += transaction.amount;
        }
        
        monthlyData[monthKey].transactions.push(transaction);
    });

    // Calculate metrics for each month
    const months = Object.values(monthlyData).map(month => ({
        ...month,
        balance: month.income - month.expenses,
        savingsRate: month.income > 0 ? ((month.income - month.expenses) / month.income) * 100 : 0,
        isOverspent: month.expenses > month.income
    }));

    // Sort months by date
    months.sort((a, b) => a.month.localeCompare(b.month));

    // Find overspent months
    const overspentMonths = months
        .filter(m => m.isOverspent)
        .sort((a, b) => (b.expenses - b.income) - (a.expenses - a.income))
        .slice(0, 5);

    // Find best months (highest savings/balance)
    const bestMonths = months
        .filter(m => !m.isOverspent && m.balance > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);

    // Calculate overall savings rate
    const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Detect spending streaks (consecutive months with increasing expenses)
    const spendingStreaks = [];
    if (months.length >= 3) {
        for (let i = 2; i < months.length; i++) {
            const prev2 = months[i - 2];
            const prev1 = months[i - 1];
            const current = months[i];
            
            if (current.expenses > prev1.expenses && prev1.expenses > prev2.expenses) {
                spendingStreaks.push({
                    startMonth: prev2.monthName,
                    endMonth: current.monthName,
                    increase: ((current.expenses - prev2.expenses) / prev2.expenses) * 100,
                    months: [prev2, prev1, current]
                });
            }
        }
    }

    // Detect income trends
    const incomeTrends = [];
    if (months.length >= 3) {
        const recentMonths = months.slice(-3);
        const avgRecentIncome = recentMonths.reduce((sum, m) => sum + m.income, 0) / recentMonths.length;
        const avgEarlierIncome = months.length > 6 
            ? months.slice(-6, -3).reduce((sum, m) => sum + m.income, 0) / 3
            : months.slice(0, Math.max(0, months.length - 3)).reduce((sum, m) => sum + m.income, 0) / Math.max(1, months.length - 3);
        
        if (avgEarlierIncome > 0) {
            const change = ((avgRecentIncome - avgEarlierIncome) / avgEarlierIncome) * 100;
            if (Math.abs(change) > 10) {
                incomeTrends.push({
                    direction: change > 0 ? 'increasing' : 'decreasing',
                    change: Math.abs(change),
                    recent: avgRecentIncome,
                    earlier: avgEarlierIncome
                });
            }
        }
    }

    // Generate text insights
    const insights = generateTextInsights({
        overspentMonths,
        bestMonths,
        spendingStreaks,
        incomeTrends,
        savingsRate,
        totalMonths: months.length,
        totalIncome,
        totalExpenses
    });

    return {
        overspentMonths,
        bestMonths,
        spendingStreaks,
        incomeTrends,
        savingsRate,
        insights,
        monthlyData: months
    };
};

/**
 * Generate human-readable text insights
 */
const generateTextInsights = (data) => {
    const insights = [];

    // Overspent months insight
    if (data.overspentMonths.length > 0) {
        const worst = data.overspentMonths[0];
        insights.push({
            type: 'warning',
            title: 'Overspent Alert',
            message: `You overspent by ETB ${Math.abs(worst.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })} in ${worst.monthName}`,
            icon: 'AlertTriangle',
            value: worst.balance
        });
    }

    // Best month insight
    if (data.bestMonths.length > 0) {
        const best = data.bestMonths[0];
        insights.push({
            type: 'success',
            title: 'Best Month',
            message: `${best.monthName} was your best month with ETB ${best.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} saved`,
            icon: 'TrendingUp',
            value: best.balance
        });
    }

    // Savings rate insight
    if (data.savingsRate > 20) {
        insights.push({
            type: 'success',
            title: 'Great Savings',
            message: `You're saving ${data.savingsRate.toFixed(1)}% of your income! Keep it up!`,
            icon: 'Wallet',
            value: data.savingsRate
        });
    } else if (data.savingsRate < 0) {
        insights.push({
            type: 'warning',
            title: 'Negative Savings',
            message: `Your expenses exceed income by ${Math.abs(data.savingsRate).toFixed(1)}%. Consider reviewing your spending.`,
            icon: 'TrendingDown',
            value: data.savingsRate
        });
    }

    // Spending streak insight
    if (data.spendingStreaks.length > 0) {
        const streak = data.spendingStreaks[0];
        insights.push({
            type: 'warning',
            title: 'Spending Streak',
            message: `Your spending increased by ${streak.increase.toFixed(1)}% over the last 3 months`,
            icon: 'Activity',
            value: streak.increase
        });
    }

    // Income trend insight
    if (data.incomeTrends.length > 0) {
        const trend = data.incomeTrends[0];
        if (trend.direction === 'increasing') {
            insights.push({
                type: 'success',
                title: 'Income Growth',
                message: `Your income has increased by ${trend.change.toFixed(1)}% recently!`,
                icon: 'TrendingUp',
                value: trend.change
            });
        } else {
            insights.push({
                type: 'info',
                title: 'Income Decrease',
                message: `Your income decreased by ${trend.change.toFixed(1)}% in recent months`,
                icon: 'TrendingDown',
                value: trend.change
            });
        }
    }

    // No transactions insight
    if (data.totalMonths === 0) {
        insights.push({
            type: 'info',
            title: 'Getting Started',
            message: 'Add transactions to see insights about your financial patterns',
            icon: 'Activity',
            value: 0
        });
    }

    return insights;
};

/**
 * Format month name for display
 */
export const formatMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

