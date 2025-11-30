/**
 * Parse SMS messages to extract transaction data
 * Supports various transaction formats from different banks and message types
 */

/**
 * Helper function to extract balance from SMS
 */
const extractBalance = (text) => {
    const balanceMatch = text.match(/Current Balance is ETB ([\d,]+\.?\d*)/i) ||
                        text.match(/Balance is ETB ([\d,]+\.?\d*)/i) ||
                        text.match(/Balance: ETB ([\d,]+\.?\d*)/i);
    if (balanceMatch) {
        return parseFloat(balanceMatch[1].replace(/,/g, ''));
    }
    return null;
};

/**
 * Helper function to extract date from SMS
 * Handles various date formats: DD/MM/YYYY, M/D/YYYY, etc.
 */
const extractDate = (text) => {
    // Try DD/MM/YYYY format (e.g., 27/11/2025)
    const ddmmyyyyMatch = text.match(/on (\d{2}\/\d{2}\/\d{4})/i) || 
                          text.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (ddmmyyyyMatch) {
        const [day, month, year] = ddmmyyyyMatch[1].split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try M/D/YYYY format (e.g., 6/27/2024)
    const mdyyyyMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (mdyyyyMatch) {
        const month = parseInt(mdyyyyMatch[1]);
        const day = parseInt(mdyyyyMatch[2]);
        const year = parseInt(mdyyyyMatch[3]);
        const dateObj = new Date(year, month - 1, day);
        if (!isNaN(dateObj.getTime())) {
            return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
        }
    }

    // If no date found, use current date
    return new Date().toISOString().split('T')[0];
};

/**
 * Helper function to extract time from SMS
 */
const extractTime = (text) => {
    const timeMatch = text.match(/at (\d{2}:\d{2}:\d{2})/i) ||
                     text.match(/(\d{2}:\d{2}:\d{2})/);
    if (timeMatch) {
        return timeMatch[1];
    }

    // If no time found, use current time
    return new Date().toTimeString().split(' ')[0];
};

/**
 * Helper function to extract reference number from SMS
 */
const extractRefNo = (text) => {
    const refMatch = text.match(/Ref No ([A-Z0-9]+)/i) ||
                    text.match(/Reference No[.:] ([A-Z0-9]+)/i) ||
                    text.match(/Ref[.:] ([A-Z0-9]+)/i) ||
                    text.match(/id=([A-Z0-9]+)/i) ||
                    text.match(/ID[.:] ([A-Z0-9]+)/i);
    if (refMatch) {
        return refMatch[1];
    }
    return null;
};

/**
 * Parse income/credit messages with comprehensive pattern matching
 */
const parseCreditMessage = (sms) => {
    // INCOME PATTERNS - Try all possible patterns
    const incomePatterns = [
        { pattern: /credited with ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /Credited with ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /credited by ([^,]+) with ETB ([\d,]+\.?\d*)/i, amountGroup: 2, fromGroup: 1 },
        { pattern: /Credited by ([^,]+) with ETB ([\d,]+\.?\d*)/i, amountGroup: 2, fromGroup: 1 },
        { pattern: /Credited with ETB ([\d,]+\.?\d*) from/i, amountGroup: 1 },
        { pattern: /received ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /deposit of ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /Deposit of ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
    ];

    let amount = null;
    let from_person = null;

    // Try each income pattern
    for (const { pattern, amountGroup, fromGroup } of incomePatterns) {
        const match = sms.match(pattern);
        if (match) {
            amount = parseFloat(match[amountGroup].replace(/,/g, ''));
            if (fromGroup && match[fromGroup]) {
                from_person = match[fromGroup].trim();
            }
            break;
        }
    }

    // If no amount found, return null
    if (amount === null) {
        return null;
    }

    // Extract sender (if not already extracted)
    if (!from_person) {
        const fromMatch = sms.match(/from ([^,]+),/i) || 
                         sms.match(/from ([^,]+) on/i) ||
                         sms.match(/from ([^,]+) at/i) ||
                         sms.match(/from ([^,.]+)/i);
        if (fromMatch) {
            from_person = fromMatch[1].trim();
        }
    }

    const result = {
        type: 'income',
        amount,
        from_person,
        transaction_date: extractDate(sms),
        transaction_time: extractTime(sms),
        ref_no: extractRefNo(sms),
        balance: extractBalance(sms),
        description: from_person ? `Income from ${from_person}` : 'Income',
        sms_content: sms
    };

    return result;
};

/**
 * Parse expense/debit messages with comprehensive pattern matching
 */
const parseDebitMessage = (sms) => {
    // EXPENSE PATTERNS - Try all possible patterns (more specific patterns first)
    const expensePatterns = [
        { pattern: /debited with ETB ([\d,]+\.?\d*) including/i, amountGroup: 1 },
        { pattern: /debited with ETB([\d,]+\.?\d*) including/i, amountGroup: 1 },
        { pattern: /You have transfered ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /you have transfered ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /have transfered ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /transferred ETB ([\d,]+\.?\d*) to/i, amountGroup: 1 },
        { pattern: /transfered ETB ([\d,]+\.?\d*) to/i, amountGroup: 1 },
        { pattern: /debited with ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /withdrawn ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /withdrawal of ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /paid ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
        { pattern: /payment of ETB ([\d,]+\.?\d*)/i, amountGroup: 1 },
    ];

    let amount = null;
    let to_person = null;

    // Try each expense pattern
    for (const { pattern, amountGroup } of expensePatterns) {
        const match = sms.match(pattern);
        if (match) {
            amount = parseFloat(match[amountGroup].replace(/,/g, ''));
            break;
        }
    }

    // If no amount found, return null
    if (amount === null) {
        return null;
    }

    // Extract recipient for transfers
    const toMatch = sms.match(/to ([^,]+) on/i) || 
                   sms.match(/to ([^,]+),/i) ||
                   sms.match(/to ([^,.]+)/i);
    if (toMatch) {
        to_person = toMatch[1].trim();
    }

    const result = {
        type: 'expense',
        amount,
        from_person: to_person || null,
        transaction_date: extractDate(sms),
        transaction_time: extractTime(sms),
        ref_no: extractRefNo(sms),
        balance: extractBalance(sms),
        description: to_person ? `Transfer to ${to_person}` : 'Expense',
        sms_content: sms
    };

    return result;
};

/**
 * Main parser function - detects message type and parses accordingly
 */
const parseSMS = (smsText) => {
    if (!smsText || typeof smsText !== 'string') {
        return null;
    }

    // Try parsing as income (credited, received, deposit)
    const creditKeywords = ['credited', 'received', 'deposit'];
    for (const keyword of creditKeywords) {
        if (smsText.toLowerCase().includes(keyword)) {
            const result = parseCreditMessage(smsText);
            if (result && result.amount !== null) {
                return result;
            }
        }
    }

    // Try parsing as expense (debited, transfered, withdrawn, paid, payment)
    const debitKeywords = ['debited', 'transfered', 'transferred', 'withdrawn', 'paid', 'payment'];
    for (const keyword of debitKeywords) {
        if (smsText.toLowerCase().includes(keyword)) {
            const result = parseDebitMessage(smsText);
            if (result && result.amount !== null) {
                return result;
            }
        }
    }

    // If neither credit nor debit patterns match, return null
    return null;
};

/**
 * Parse multiple SMS messages from an array
 * @param {Array<string>} smsArray - Array of SMS message strings
 * @returns {Array<Object>} - Array of parsed transaction objects
 */
const parseMultipleSMS = (smsArray) => {
    if (!Array.isArray(smsArray)) {
        console.error('parseMultipleSMS expects an array');
        return [];
    }

    return smsArray
        .map(sms => parseSMS(sms))
        .filter(parsed => parsed !== null && parsed.amount !== null);
};

/**
 * Parse bulk SMS text (multiple messages separated by newlines)
 * Handles various message separators and formats
 * @param {string} bulkText - Bulk text containing multiple SMS messages
 * @returns {Array<Object>} - Array of parsed transaction objects
 */
const parseBulkSMS = (bulkText) => {
    if (!bulkText || typeof bulkText !== 'string') {
        console.error('parseBulkSMS expects a string');
        return [];
    }

    // Split by various possible separators:
    // - Double newlines (\n\n+)
    // - "Dear" (common SMS greeting)
    // - "Your Account" (another common pattern)
    const messages = bulkText
        .split(/\n\n+|(?=Dear)|(?=Your Account)/gi)
        .map(msg => msg.trim())
        .filter(msg => msg.length > 10); // Filter out very short strings

    const parsed = parseMultipleSMS(messages);
    console.log(`Parsed ${parsed.length} transactions from ${messages.length} SMS messages`);
    return parsed;
};

module.exports = {
    parseSMS,
    parseMultipleSMS,
    parseBulkSMS,
    parseCreditMessage,
    parseDebitMessage,
    extractBalance,
    extractDate,
    extractTime,
    extractRefNo
};
