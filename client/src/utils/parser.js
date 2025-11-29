import Papa from 'papaparse';

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                console.log('CSV Parse Results:', results);
                console.log('First row:', results.data[0]);

                const transactions = results.data.map((row, index) => {
                    const content = row.Content || '';
                    const dateStr = row.Date;
                    const timeStr = row.Time;

                    let type = 'Unknown';
                    let amount = 0;

                    // Regex for Income - handle both formats
                    const incomeMatch = content.match(/credited with ETB ([\d,]+\.?\d*)/i);
                    if (incomeMatch) {
                        type = 'Income';
                        amount = parseFloat(incomeMatch[1].replace(/,/g, ''));
                    }

                    // Regex for Expense - handle both formats
                    const expenseMatch = content.match(/debited with ETB ([\d,]+\.?\d*)/i);
                    if (expenseMatch) {
                        type = 'Expense';
                        amount = parseFloat(expenseMatch[1].replace(/,/g, ''));
                    }

                    // Parse Date - handle M/D/YYYY format
                    let dateObj = new Date();
                    if (dateStr && timeStr) {
                        // Parse date parts
                        const dateParts = dateStr.split('/');
                        if (dateParts.length === 3) {
                            const month = parseInt(dateParts[0]) - 1; // JS months are 0-indexed
                            const day = parseInt(dateParts[1]);
                            const year = parseInt(dateParts[2]);
                            dateObj = new Date(year, month, day);
                        }
                    }

                    return {
                        id: index,
                        date: dateObj,
                        dateStr: dateStr,
                        description: content,
                        type,
                        amount,
                        raw: row
                    };
                }).filter(t => t.type !== 'Unknown' && !isNaN(t.amount));

                console.log('Parsed transactions:', transactions.length);
                console.log('Sample transaction:', transactions[0]);
                resolve(transactions);
            },
            error: (error) => {
                console.error('CSV Parse Error:', error);
                reject(error);
            }
        });
    });
};

export const aggregateData = (transactions) => {
    const totalIncome = transactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // Monthly Data
    const monthlyData = {};
    transactions.forEach(t => {
        const monthYear = t.date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { name: monthYear, Income: 0, Expense: 0 };
        }
        monthlyData[monthYear][t.type] += t.amount;
    });

    const chartData = Object.values(monthlyData).sort((a, b) => {
        return new Date(a.name) - new Date(b.name);
    });

    return {
        totalIncome,
        totalExpense,
        balance,
        chartData,
        transactions
    };
};
