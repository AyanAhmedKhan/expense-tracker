import React, { useEffect, useState } from 'react';
import { getReimbursements, getReimbursementItems, Reimbursement, ReimbursedItem } from '../api/endpoints';
import { format } from 'date-fns';

const ReimbursementHistory: React.FC = () => {
    const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [items, setItems] = useState<ReimbursedItem[]>([]);

    useEffect(() => {
        setLoading(true);
        getReimbursements()
            .then(setReimbursements)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Reimbursement History</h2>

            {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading history...</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {reimbursements.map((item) => (
                                    <React.Fragment key={item.id}>
                                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={async () => {
                                            if (expandedId === item.id) { setExpandedId(null); setItems([]); return; }
                                            setExpandedId(item.id);
                                            const data = await getReimbursementItems(item.id);
                                            setItems(data);
                                        }}>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                {format(new Date(item.date), 'dd MMM yyyy HH:mm')}
                                            </td>
                                            <td className="p-4 text-sm font-bold text-green-600 dark:text-green-400">
                                                ₹{item.amount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                {item.note || '-'}
                                            </td>
                                        </tr>
                                        {expandedId === item.id && (
                                            <tr>
                                                <td colSpan={3} className="p-0">
                                                    <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                                        <div className="p-4">
                                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Items reimbursed</h4>
                                                            {items.length === 0 ? (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">No items found.</div>
                                                            ) : (
                                                                <div className="overflow-x-auto">
                                                                    <table className="w-full text-left text-sm">
                                                                        <thead>
                                                                            <tr>
                                                                                <th className="p-2 text-gray-600 dark:text-gray-300">Date</th>
                                                                                <th className="p-2 text-gray-600 dark:text-gray-300">Description</th>
                                                                                <th className="p-2 text-gray-600 dark:text-gray-300">Amount</th>
                                                                                <th className="p-2 text-gray-600 dark:text-gray-300">Applied</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                                                            {items.map(it => (
                                                                                <tr key={it.id}>
                                                                                    <td className="p-2 text-gray-600 dark:text-gray-300">{format(new Date(it.date), 'dd MMM yyyy')}</td>
                                                                                    <td className="p-2 text-gray-900 dark:text-white">{it.description}</td>
                                                                                    <td className="p-2 text-gray-900 dark:text-white">₹{Math.abs(it.amount).toLocaleString('en-IN')}</td>
                                                                                    <td className="p-2 text-gray-900 dark:text-white">₹{Math.abs(it.applied).toLocaleString('en-IN')}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                        {reimbursements.map((item) => (
                            <div key={item.id} className="p-4">
                                <div
                                    className="flex justify-between items-start cursor-pointer"
                                    onClick={async () => {
                                        if (expandedId === item.id) { setExpandedId(null); setItems([]); return; }
                                        setExpandedId(item.id);
                                        const data = await getReimbursementItems(item.id);
                                        setItems(data);
                                    }}
                                >
                                    <div>
                                        <p className="font-bold text-green-600 dark:text-green-400">
                                            ₹{item.amount.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {format(new Date(item.date), 'dd MMM yyyy HH:mm')}
                                        </p>
                                        {item.note && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                {item.note}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-gray-400">
                                        {expandedId === item.id ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {expandedId === item.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Items Reimbursed</h4>
                                        {items.length === 0 ? (
                                            <p className="text-sm text-gray-500">Loading items...</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {items.map(it => (
                                                    <div key={it.id} className="text-sm">
                                                        <div className="flex justify-between text-gray-900 dark:text-white">
                                                            <span>{it.description}</span>
                                                            <span>₹{Math.abs(it.applied).toLocaleString('en-IN')}</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                                            <span>{format(new Date(it.date), 'dd MMM')}</span>
                                                            <span>of ₹{Math.abs(it.amount).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {reimbursements.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No reimbursement history.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReimbursementHistory;
