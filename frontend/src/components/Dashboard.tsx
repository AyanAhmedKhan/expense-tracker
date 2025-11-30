import React, { useEffect, useState } from 'react';
import { getSummary, Summary } from '../api/endpoints';
import { TrendingUp, CheckCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState<Summary | null>(null);

    useEffect(() => {
        getSummary().then(setSummary).catch(console.error);
    }, []);

    if (!summary) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading dashboard...</div>;

    const cards = [
        { label: 'Total Spent', value: summary.total_spent, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900' },
        { label: 'Reimbursed', value: summary.total_reimbursed, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900' },
        { label: 'Pending', value: summary.total_pending, icon: Clock, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${card.bg}`}>
                            <card.icon className={card.color} size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{card.value.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Last Reimbursement</h3>
                {summary.last_reimbursement_date ? (
                    <p className="text-gray-600 dark:text-gray-300">
                        Last payment received on {new Date(summary.last_reimbursement_date).toLocaleDateString()}
                    </p>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No reimbursements yet.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
