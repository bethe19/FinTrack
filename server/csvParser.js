/**
 * Parse CSV file using a more robust approach
 * Based on the frontend parser logic
 */

const parseCSVContent = (csvText) => {
    // Robust CSV parsing handling quoted fields and newlines
    const lines = [];
    let currentLine = [];
    let currentField = '';
    let inQuotes = false;
    
    // Iterate character by character
    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Field separator
            currentLine.push(currentField.trim());
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            // Line separator
            if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
            
            currentLine.push(currentField.trim());
            if (currentLine.length > 0 && (currentLine.length > 1 || currentLine[0] !== '')) {
                lines.push(currentLine);
            }
            currentLine = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    
    // Push last field/line if exists
    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim());
        lines.push(currentLine);
    }

    if (lines.length < 2) {
        return [];
    }

    // Header is the first line
    const headers = lines[0].map(h => h.toLowerCase().replace(/['"]/g, ''));

    // Find column indices
    const dateIndex = headers.findIndex(h => h === 'date');
    const timeIndex = headers.findIndex(h => h === 'time');
    const contentIndex = headers.findIndex(h => h === 'content');

    if (contentIndex === -1) {
        console.error('Content column not found in CSV');
        return [];
    }

    const transactions = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i];
        
        if (values.length < headers.length) continue;

        const content = values[contentIndex] || '';
        let dateStr = dateIndex >= 0 ? values[dateIndex] : '';
        const timeStr = timeIndex >= 0 ? values[timeIndex] : '';

        // Normalize date to YYYY-MM-DD
        if (dateStr) {
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
                dateStr = dateObj.toISOString().split('T')[0];
            }
        }

        if (!content) continue;

        // Check for income (credited)
        const incomeMatch = content.match(/credited with ETB ([\d,]+\.?\d*)/i);
        if (incomeMatch) {
            const amount = parseFloat(incomeMatch[1].replace(/,/g, ''));

            // Extract sender
            let from_person = null;
            const fromMatch = content.match(/from ([^,]+),/i);
            if (fromMatch) {
                from_person = fromMatch[1].trim();
            }

            // Extract reference number
            let ref_no = null;
            const refMatch = content.match(/Ref No ([A-Z0-9]+)/i);
            if (refMatch) {
                ref_no = refMatch[1];
            }

            // Extract balance
            let balance = null;
            const balanceMatch = content.match(/Current Balance is ETB ([\d,]+\.?\d*)/i);
            if (balanceMatch) {
                balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
            }

            transactions.push({
                type: 'income',
                amount,
                balance,
                from_person,
                description: `Income${from_person ? ' from ' + from_person : ''}`,
                transaction_date: dateStr,
                transaction_time: timeStr,
                ref_no,
                sms_content: content
            });
            continue;
        }

        // Check for expense (debited)
        const expenseMatch = content.match(/debited with ETB ([\d,]+\.?\d*)/i) || content.match(/have transfered ETB ([\d,]+\.?\d*)/i);
        if (expenseMatch) {
            const amount = parseFloat(expenseMatch[1].replace(/,/g, ''));

            // Extract balance
            let balance = null;
            const balanceMatch = content.match(/Current Balance is ETB ([\d,]+\.?\d*)/i);
            if (balanceMatch) {
                balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
            }

            transactions.push({
                type: 'expense',
                amount,
                balance,
                from_person: null,
                description: 'Expense',
                transaction_date: dateStr,
                transaction_time: timeStr,
                ref_no: null,
                sms_content: content
            });
        }
    }

    console.log(`Parsed ${transactions.length} transactions from CSV`);
    return transactions;
};

module.exports = {
    parseCSVContent
};
