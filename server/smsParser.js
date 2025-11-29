/**
 * Parse CBE SMS messages to extract transaction data
 */

// Credit message pattern
// Example: "Dear Bethe your Account 1*****4624 has been Credited with ETB 1,000.00 from Fitsum Gmariam, on 27/11/2025 at 13:22:05 with Ref No FT25331KMH5G Your Current Balance is ETB 28,633.18"
const parseCreditMessage = (sms) => {
    const patterns = {
        amount: /credited with ETB ([\d,]+\.?\d*)/i,
        from: /from ([^,]+),/i,
        date: /on (\d{2}\/\d{2}\/\d{4})/i,
        time: /at (\d{2}:\d{2}:\d{2})/i,
        refNo: /Ref No ([A-Z0-9]+)/i,
        balance: /Current Balance is ETB ([\d,]+\.?\d*)/i,
    };

    const result = {
        type: 'income',
        amount: null,
        from_person: null,
        transaction_date: null,
        transaction_time: null,
        ref_no: null,
        balance: null,
        description: '',
        sms_content: sms
    };

    // Extract amount
    const amountMatch = sms.match(patterns.amount);
    if (amountMatch) {
        result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extract sender
    const fromMatch = sms.match(patterns.from);
    if (fromMatch) {
        result.from_person = fromMatch[1].trim();
        result.description = `Income from ${result.from_person}`;
    }

    // Extract date
    const dateMatch = sms.match(patterns.date);
    if (dateMatch) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = dateMatch[1].split('/');
        result.transaction_date = `${year}-${month}-${day}`;
    }

    // Extract time
    const timeMatch = sms.match(patterns.time);
    if (timeMatch) {
        result.transaction_time = timeMatch[1];
    }

    // Extract reference number
    const refMatch = sms.match(patterns.refNo);
    if (refMatch) {
        result.ref_no = refMatch[1];
    }

    // Extract balance
    const balanceMatch = sms.match(patterns.balance);
    if (balanceMatch) {
        result.balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
    }

    return result;
};

// Debit message pattern
// Example: "Dear Bethe your Account 1****4624 has been debited with ETB 100.57. Your Current Balance is ETB 28532.61"
const parseDebitMessage = (sms) => {
    const patterns = {
        amount: /debited with ETB ([\d,]+\.?\d*)/i,
        balance: /Current Balance is ETB ([\d,]+\.?\d*)/i,
    };

    const result = {
        type: 'expense',
        amount: null,
        from_person: null,
        transaction_date: null,
        transaction_time: null,
        ref_no: null,
        balance: null,
        description: 'Expense',
        sms_content: sms
    };

    // Extract amount
    const amountMatch = sms.match(patterns.amount);
    if (amountMatch) {
        result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extract balance
    const balanceMatch = sms.match(patterns.balance);
    if (balanceMatch) {
        result.balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
    }

    // Use current date/time if not in message
    const now = new Date();
    result.transaction_date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    result.transaction_time = now.toTimeString().split(' ')[0];

    return result;
};

/**
 * Main parser function - detects message type and parses accordingly
 */
const parseSMS = (smsText) => {
    // Check if it's a CBE message
    if (!smsText.toLowerCase().includes('cbe') && !smsText.toLowerCase().includes('account')) {
        return null;
    }

    // Determine if credit or debit
    if (smsText.toLowerCase().includes('credited')) {
        return parseCreditMessage(smsText);
    } else if (smsText.toLowerCase().includes('debited')) {
        return parseDebitMessage(smsText);
    }

    return null;
};

/**
 * Parse multiple SMS messages
 */
const parseMultipleSMS = (smsArray) => {
    return smsArray
        .map(sms => parseSMS(sms))
        .filter(parsed => parsed !== null && parsed.amount !== null);
};

/**
 * Parse bulk SMS text (multiple messages separated by newlines)
 */
const parseBulkSMS = (bulkText) => {
    // Split by double newlines or "Dear" to separate messages
    const messages = bulkText
        .split(/\n\n+|(?=Dear)/g)
        .map(msg => msg.trim())
        .filter(msg => msg.length > 0);

    return parseMultipleSMS(messages);
};

module.exports = {
    parseSMS,
    parseMultipleSMS,
    parseBulkSMS,
    parseCreditMessage,
    parseDebitMessage
};
