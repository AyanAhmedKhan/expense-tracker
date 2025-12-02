import React, { useEffect, useState } from 'react';
import { getExpenses, createReimbursement, Expense } from '../api/endpoints';
import { format } from 'date-fns';
import clsx from 'clsx';

const ExpenseList: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    // Filters
    const [q, setQ] = useState('');
    const [status, setStatus] = useState<'PENDING' | 'PARTIAL' | 'REIMBURSED' | ''>('');
    const [source, setSource] = useState('');
    const [minAmount, setMinAmount] = useState<string>('');
    const [maxAmount, setMaxAmount] = useState<string>('');
    const [fromDate, setFromDate] = useState<string>(''); // YYYY-MM-DD
    const [toDate, setToDate] = useState<string>('');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'created_at' | 'description'>('date');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');

    const [reimbursing, setReimbursing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const fetchExpenses = () => {
        setLoading(true);
        getExpenses({
            q: q || undefined,
            status: (status as any) || undefined,
            source: source || undefined,
            min_amount: minAmount ? Number(minAmount) : undefined,
            max_amount: maxAmount ? Number(maxAmount) : undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
            sort_by: sortBy,
            order,
        })
            .then(setExpenses)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const toggleSelection = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleReimburse = async () => {
        if (selectedIds.length === 0) return;
        setReimbursing(true);
        try {
            // Only send debit IDs
            const debitIds = expenses.filter(e => e.amount > 0 && selectedIds.includes(e.id)).map(e => e.id);
            if (debitIds.length === 0) {
                alert('Please select debit expenses (credits cannot be reimbursed).');
                return;
            }
            await createReimbursement(debitIds);
            setSelectedIds([]);
            fetchExpenses(); // Refresh list
        } catch (error) {
            console.error('Failed to reimburse', error);
            // Try to show server error if present
            const anyErr = (error as any);
            let detail = anyErr?.response?.data?.detail;
            if (detail && typeof detail !== 'string') {
                try { detail = JSON.stringify(detail); } catch { /* ignore */ }
            }
            const msg = detail || anyErr?.message || 'Failed to process reimbursement';
            alert(msg);
        } finally {
            setReimbursing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'REIMBURSED': return 'bg-green-100 text-green-800';
            case 'PARTIAL': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getFlowLabel = (amount: number) => (amount < 0 ? 'Credit' : 'Debit');
    const getAmountClass = (amount: number) => (amount < 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expenses</h2>
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleReimburse}
                        disabled={reimbursing}
                        className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {reimbursing ? 'Processing...' : `Reimburse (${selectedIds.length})`}
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter & Search
                    </h3>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden text-blue-600 dark:text-blue-400 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Search</label>
                        <input
                            type="text"
                            placeholder="Search by description..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PARTIAL">Partial</option>
                            <option value="REIMBURSED">Reimbursed</option>
                        </select>
                    </div>

                    {/* Source */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Source</label>
                        <input
                            type="text"
                            placeholder="e.g., ICICI CSV"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        />
                    </div>

                    {/* Amount Range */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Amount Range</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min ₹"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                            />
                            <span className="flex items-center text-gray-400 dark:text-gray-500">—</span>
                            <input
                                type="number"
                                placeholder="Max ₹"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Date Range</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                            />
                            <span className="flex items-center text-gray-400 dark:text-gray-500">to</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        >
                            <option value="date">Date</option>
                            <option value="amount">Amount</option>
                            <option value="created_at">Created</option>
                            <option value="description">Description</option>
                        </select>
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Order</label>
                        <select
                            value={order}
                            onChange={(e) => setOrder(e.target.value as any)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex flex-col sm:flex-row gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
                    <button
                        onClick={fetchExpenses}
                        className="flex-1 md:flex-initial bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Apply Filters
                    </button>
                    <button
                        onClick={() => {
                            setQ('');
                            setStatus('');
                            setSource('');
                            setMinAmount('');
                            setMaxAmount('');
                            setFromDate('');
                            setToDate('');
                            setSortBy('date');
                            setOrder('desc');
                            fetchExpenses();
                        }}
                        className="flex-1 md:flex-initial px-6 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                    </button>
                </div>
            </div>

            {
                loading ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading expenses...</div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {/* Desktop Table - Hidden on Mobile/Tablet, visible on Large screens */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <tr>
                                        <th className="p-4 w-10"></th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Description</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Type</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="p-4">
                                                {expense.status !== 'REIMBURSED' && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(expense.id)}
                                                        onChange={() => toggleSelection(expense.id)}
                                                        disabled={expense.amount < 0}
                                                        title={expense.amount < 0 ? 'Credits cannot be reimbursed' : 'Select expense'}
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 disabled:opacity-40"
                                                    />
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                {format(new Date(expense.date), 'dd MMM yyyy')}
                                            </td>
                                            <td className="p-4 text-sm text-gray-900 dark:text-white font-medium">
                                                {expense.description}
                                            </td>
                                            <td className={"p-4 text-sm font-semibold " + getAmountClass(expense.amount)}>
                                                ₹{Math.abs(expense.amount).toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-4">
                                                <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getFlowLabel(expense.amount) === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                                    {getFlowLabel(expense.amount)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(expense.status))}>
                                                    {expense.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile/Tablet Cards - Visible on Mobile/Tablet, hidden on Large screens */}
                        <div className="lg:hidden space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-3">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', getFlowLabel(expense.amount) === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                                    {getFlowLabel(expense.amount)}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(expense.date), 'dd MMM yyyy')}</span>
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-base leading-tight break-words">
                                                {expense.description}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={"text-lg font-bold " + getAmountClass(expense.amount)}>
                                                ₹{Math.abs(expense.amount).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx('px-2.5 py-1 rounded-md text-xs font-medium border',
                                                expense.status === 'REIMBURSED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    expense.status === 'PARTIAL' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                            )}>
                                                {expense.status}
                                            </span>
                                        </div>

                                        {expense.status !== 'REIMBURSED' && (
                                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(expense.id)}
                                                    onChange={() => toggleSelection(expense.id)}
                                                    disabled={expense.amount < 0}
                                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 disabled:opacity-40"
                                                />
                                                <span>Select</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {expenses.length === 0 && (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">No expenses found. Upload a statement to get started.</div>
                        )}
                    </div>
                )
            }
        </div >
    );
};

export default ExpenseList;
