import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const TransactionTable = ({ transactions, darkMode }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    // Ensure transactions have required properties
    const normalizedTransactions = transactions.map(t => ({
        ...t,
        date: t.date || new Date(t.transaction_date || t.created_at),
        type: t.type || 'expense',
        description: t.description || 'No description',
        amount: t.amount || 0
    }));

    // Filter transactions based on search term
    const filteredTransactions = normalizedTransactions.filter(t => 
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.amount || 0).toString().includes(searchTerm)
    );

    // Sort transactions
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (sortConfig.key === 'date') {
            const dateA = a.date instanceof Date ? a.date : new Date(a.transaction_date || a.created_at);
            const dateB = b.date instanceof Date ? b.date : new Date(b.transaction_date || b.created_at);
            return sortConfig.direction === 'asc'
                ? dateA - dateB
                : dateB - dateA;
        }
        if (sortConfig.key === 'amount') {
            return sortConfig.direction === 'asc'
                ? (a.amount || 0) - (b.amount || 0)
                : (b.amount || 0) - (a.amount || 0);
        }
        return 0;
    });

    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <div className="w-4 h-4" />;
        return sortConfig.direction === 'asc' ?
            <ChevronUp className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-black'}`} /> :
            <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-black'}`} />;
    };

    return (
        <div className={`border ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
            {/* Header Controls */}
            <div className={`p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${darkMode ? 'border-gray-800' : 'border-gray-300'}`}>
                <div>
                     <h3 className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                        Transaction History
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {filteredTransactions.length} transactions found
                    </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className={`relative flex items-center border px-3 sm:px-4 py-2 sm:py-2.5 flex-1 sm:flex-none ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                        <Search className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2 flex-shrink-0`} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`bg-transparent border-none focus:outline-none text-xs sm:text-sm w-full ${darkMode ? 'text-white placeholder-gray-500' : 'text-black placeholder-gray-400'}`}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                    <thead className={`${darkMode ? 'bg-black border-b border-gray-800 text-white' : 'bg-white border-b border-gray-300 text-black'} font-medium uppercase text-xs tracking-wider`}>
                        <tr>
                            <th
                                className="px-3 sm:px-6 py-3 sm:py-4 cursor-pointer hover:opacity-70 transition-opacity select-none"
                                onClick={() => handleSort('date')}
                            >
                                <div className="flex items-center gap-1 sm:gap-2">
                                    Date
                                    <SortIcon columnKey="date" />
                                </div>
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4">Description</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center">Type</th>
                            <th
                                className="px-3 sm:px-6 py-3 sm:py-4 text-right cursor-pointer hover:opacity-70 transition-opacity select-none"
                                onClick={() => handleSort('amount')}
                            >
                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                    Amount
                                    <SortIcon columnKey="amount" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                        {paginatedTransactions.length > 0 ? (
                            paginatedTransactions.map((t) => (
                                <tr
                                    key={t.id}
                                    className={`transition-colors ${darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-50'}`}
                                >
                                    <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <div className="flex flex-col">
                                            {(() => {
                                                const date = t.date instanceof Date ? t.date : new Date(t.transaction_date || t.created_at);
                                                return (
                                                    <>
                                                        <span className="text-xs sm:text-sm">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        <span className={`text-xs font-normal ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className={`max-w-xs truncate font-medium text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} title={t.description || 'No description'}>
                                            {t.description || 'No description'}
                                        </div>
                                        {t.ref_no && (
                                            <div className={`text-xs mt-0.5 font-mono ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Ref: {t.ref_no}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 text-xs font-semibold border ${
                                            (t.type || '').toLowerCase() === 'income'
                                                ? darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                                                : darkMode ? 'bg-black text-white border-gray-800' : 'bg-white text-black border-gray-300'
                                        }`}>
                                            {(t.type || 'expense').charAt(0).toUpperCase() + (t.type || 'expense').slice(1)}
                                        </span>
                                    </td>
                                    <td className={`px-3 sm:px-6 py-3 sm:py-4 text-right font-bold tabular-nums text-xs sm:text-sm ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {(t.type || '').toLowerCase() === 'income' ? '+' : '-'} ETB {(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className={`px-3 sm:px-6 py-8 sm:py-12 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <p className="text-xs sm:text-sm">No transactions found matching your search.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${darkMode ? 'border-gray-800' : 'border-gray-300'}`}>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border ${
                                currentPage === 1
                                    ? darkMode ? 'bg-black border-gray-800 text-gray-600 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                                    : darkMode ? 'bg-black border-gray-800 text-white hover:bg-gray-900' : 'bg-white border-gray-300 text-black hover:bg-gray-50'
                            }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                             className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border ${
                                currentPage === totalPages
                                    ? darkMode ? 'bg-black border-gray-800 text-gray-600 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                                    : darkMode ? 'bg-black border-gray-800 text-white hover:bg-gray-900' : 'bg-white border-gray-300 text-black hover:bg-gray-50'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionTable;
