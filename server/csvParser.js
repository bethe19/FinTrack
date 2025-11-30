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

    // Find the header row (the first row that contains "date" column)
    let headerRowIndex = -1;
    let headers = [];
    
    for (let i = 0; i < lines.length; i++) {
        const normalizedLine = lines[i].map(h => h.toLowerCase().trim().replace(/['"]/g, ''));
        
        // Check if this row contains "date" column (empty or not doesn't matter)
        if (normalizedLine.includes('date')) {
            headerRowIndex = i;
            headers = normalizedLine;
            break;
        }
    }

    if (headerRowIndex === -1) {
        console.error('Date column not found in CSV');
        return [];
    }

    // Find column indices
    const dateIndex = headers.findIndex(h => h === 'date');
    const timeIndex = headers.findIndex(h => h === 'time');
    const contentIndex = headers.findIndex(h => h === 'content');

    if (contentIndex === -1) {
        console.error('Content column not found in CSV');
        return [];
    }

    const transactions = [];

    // Parse data rows starting from the line after the header
    for (let i = headerRowIndex + 1; i < lines.length; i++) {
        const values = lines[i];
        
        // Skip empty rows
        const isEmptyRow = values.length === 0 || values.every(cell => !cell || cell.trim() === '');
        if (isEmptyRow) continue;
        
        if (values.length < headers.length) continue;

        const content = values[contentIndex] || '';
        let dateStr = dateIndex >= 0 ? values[dateIndex] : '';
        const timeStr = timeIndex >= 0 ? values[timeIndex] : '';

        // Parse date from M/D/YYYY format (e.g., "6/27/2024")
        if (dateStr) {
            // Try parsing M/D/YYYY format first
            const dateParts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (dateParts) {
                const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
                const day = parseInt(dateParts[2]);
                const year = parseInt(dateParts[3]);
                const dateObj = new Date(year, month, day);
                if (!isNaN(dateObj.getTime())) {
                    dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
                }
            } else {
                // Fallback to standard Date parsing
                const dateObj = new Date(dateStr);
                if (!isNaN(dateObj.getTime())) {
                    dateStr = dateObj.toISOString().split('T')[0];
                } else {
                    dateStr = null; // Invalid date
                }
            }
        }

        if (!content || !dateStr) continue;

        // Helper function to extract amount from various patterns
        const extractAmount = (text, patterns) => {
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    return parseFloat(match[1].replace(/,/g, ''));
                }
            }
            return null;
        };

        // Helper function to extract balance
        const extractBalance = (text) => {
            const balanceMatch = text.match(/Current Balance is ETB ([\d,]+\.?\d*)/i);
            if (balanceMatch) {
                return parseFloat(balanceMatch[1].replace(/,/g, ''));
            }
            return null;
        };

        // INCOME PATTERNS - Try all possible patterns
        const incomePatterns = [
            /credited with ETB ([\d,]+\.?\d*)/i,                    // "credited with ETB 907.32"
            /Credited with ETB ([\d,]+\.?\d*)/i,                    // "Credited with ETB 100.00"
            /credited by ([^,]+) with ETB ([\d,]+\.?\d*)/i,          // "credited by NATIONAL BANK OF ETHIOPIA with ETB 1533.11"
            /Credited with ETB ([\d,]+\.?\d*) from/i,                // "Credited with ETB X from Person"
        ];

        let amount = null;
        let transactionType = null;
        let from_person = null;
        let description = '';
        let ref_no = null;

        // Try income patterns
        for (let i = 0; i < incomePatterns.length; i++) {
            const pattern = incomePatterns[i];
            const match = content.match(pattern);
            if (match) {
                // Handle special case for "credited by X with ETB Y" (pattern index 2)
                if (i === 2) {
                    from_person = match[1].trim();
                    amount = parseFloat(match[2].replace(/,/g, ''));
                } else {
                    amount = parseFloat(match[1].replace(/,/g, ''));
                }
                transactionType = 'income';
                break;
            }
        }

        // If income found, extract additional info
        if (transactionType === 'income' && amount !== null) {
            // Extract sender (if not already extracted)
            if (!from_person) {
                const fromMatch = content.match(/from ([^,]+),/i) || content.match(/from ([^,]+) on/i);
                if (fromMatch) {
                    from_person = fromMatch[1].trim();
                }
            }

            // Extract reference number
            const refMatch = content.match(/Ref No ([A-Z0-9]+)/i) || content.match(/id=([A-Z0-9]+)/i);
            if (refMatch) {
                ref_no = refMatch[1];
            }

            // Extract balance
            const balance = extractBalance(content);

            description = from_person ? `Income from ${from_person}` : 'Income';

            transactions.push({
                type: 'income',
                amount,
                balance,
                from_person,
                description,
                transaction_date: dateStr,
                transaction_time: timeStr,
                ref_no,
                sms_content: content
            });
            continue;
        }

        // EXPENSE PATTERNS - Try all possible patterns (more specific patterns first)
        const expensePatterns = [
            /debited with ETB ([\d,]+\.?\d*) including/i,            // "debited with ETB 200.81 including Service charge" (more specific)
            /debited with ETB([\d,]+\.?\d*) including/i,            // "debited with ETB 200.81 including Service charge" (more specific)
            /You have transfered ETB ([\d,]+\.?\d*)/i,               // "You have transfered ETB 130.00" (more specific)
            /have transfered ETB ([\d,]+\.?\d*)/i,                   // "have transfered ETB 130.00"
            /transfered ETB ([\d,]+\.?\d*) to/i,                     // "transfered ETB X to Person"
            /debited with ETB ([\d,]+\.?\d*)/i,                      // "debited with ETB 600" (most general, last)
        ];

        // Try expense patterns
        for (const pattern of expensePatterns) {
            const match = content.match(pattern);
            if (match) {
                amount = parseFloat(match[1].replace(/,/g, ''));
                transactionType = 'expense';
                break;
            }
        }

        // If expense found, extract additional info
        if (transactionType === 'expense' && amount !== null) {
            // Extract recipient for transfers
            const toMatch = content.match(/to ([^,]+) on/i) || content.match(/to ([^,]+),/i);
            if (toMatch) {
                from_person = toMatch[1].trim();
                description = `Transfer to ${from_person}`;
            } else {
                description = 'Expense';
            }

            // Extract reference number
            const refMatch = content.match(/Ref No ([A-Z0-9]+)/i) || content.match(/id=([A-Z0-9]+)/i);
            if (refMatch) {
                ref_no = refMatch[1];
            }

            // Extract balance
            const balance = extractBalance(content);

            transactions.push({
                type: 'expense',
                amount,
                balance,
                from_person: from_person || null,
                description,
                transaction_date: dateStr,
                transaction_time: timeStr,
                ref_no,
                sms_content: content
            });
        }
        
        // Skip if no valid transaction type or amount found (e.g., holiday messages, PIN messages, etc.)
    }

    console.log(`Parsed ${transactions.length} transactions from CSV`);
    return transactions;
};

module.exports = {
    parseCSVContent
};
