import React, { useEffect, useState } from 'react';
import { getSummary, getExpenses, Summary, Expense } from '../api/endpoints';
import { TrendingUp, CheckCircle, Clock, Calendar, PieChart, BarChart3, ArrowUpRight } from 'lucide-react';
import { format, parseISO, subMonths, isSameMonth } from 'date-fns';

const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryData, expensesData] = await Promise.all([
                    getSummary(),
                    getExpenses({ limit: 1000, sort_by: 'date', order: 'desc' }) // Fetch recent 1000 expenses for analytics
                ]);
                setSummary(summaryData);
                setExpenses(expensesData);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !summary) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading dashboard...</div>;

    // --- Analytics Calculations ---

    // 1. Last Uploaded (Proxy: Max created_at or date)
    const lastUploaded = expenses.length > 0
        ? expenses.reduce((max, e) => {
            const date = e.created_at ? new Date(e.created_at) : new Date(e.date);
            return date > max ? date : max;
        }, new Date(0))
        : null;

    // 2. Category Breakdown
    const categories: Record<string, number> = {};
    expenses.forEach(e => {
        if (e.amount < 0) return; // Skip credits
        const desc = e.description.toLowerCase();
        let category = 'Other';

        if (desc.includes('jiomart') || desc.includes('blinkit') || desc.includes('zepto') || desc.includes('bigbasket')) category = 'Groceries';
        else if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('eats')) category = 'Food';
        else if (desc.includes('uber') || desc.includes('ola') || desc.includes('rapido') || desc.includes('fuel') || desc.includes('petrol')) category = 'Transport';
        else if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra')) category = 'Shopping';
        else if (desc.includes('bill') || desc.includes('recharge') || desc.includes('electricity')) category = 'Bills';
        else if (desc.includes('upi')) category = 'UPI Transfer';

        categories[category] = (categories[category] || 0) + e.amount;
    });

    const categoryData = Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }));

    // 3. Monthly Trends (Last 6 months)
    const last6Months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), i)).reverse();
    const monthlyData = last6Months.map(date => {
        const monthExpenses = expenses.filter(e => isSameMonth(parseISO(e.date), date) && e.amount > 0);
        const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        return { month: format(date, 'MMM'), total };
    });
    const maxMonthly = Math.max(...monthlyData.map(d => d.total), 1); // Avoid div by 0

    // 4. Most Paid (Top Descriptions)
    const descriptionTotals: Record<string, number> = {};
    expenses.forEach(e => {
        if (e.amount < 0) return;
        const desc = e.description.trim(); // Use exact description
        descriptionTotals[desc] = (descriptionTotals[desc] || 0) + e.amount;
    });
    const topPaid = Object.entries(descriptionTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);


    const cards = [
        { label: 'Total Spent', value: `₹${summary.total_spent.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900' },
        { label: 'Reimbursed', value: `₹${summary.total_reimbursed.toLocaleString('en-IN')}`, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900' },
        { label: 'Pending', value: `₹${summary.total_pending.toLocaleString('en-IN')}`, icon: Clock, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900' },
        {
            label: 'Last Uploaded',
            value: lastUploaded ? format(lastUploaded, 'dd MMM yyyy') : 'Never',
            icon: Calendar,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-100 dark:bg-purple-900'
        },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${card.bg}`}>
                            <card.icon className={card.color} size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {card.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-gray-500" />
                            Monthly Spending
                        </h3>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {monthlyData.map((d) => (
                            <div key={d.month} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full flex justify-center">
                                    <div
                                        className="w-full max-w-[40px] bg-blue-500 dark:bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-500"
                                        style={{ height: `${(d.total / maxMonthly) * 200}px` }}
                                    ></div>
                                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                        ₹{d.total.toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-gray-500" />
                            Top Categories
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {categoryData.slice(0, 5).map((cat, index) => (
                            <div key={cat.name} className="relative">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">₹{cat.value.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-2.5 rounded-full ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'][index % 5]}`}
                                        style={{ width: `${(cat.value / summary.total_spent) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {categoryData.length === 0 && <p className="text-gray-500 text-center py-4">No expense data available.</p>}
                    </div>
                </div>
            </div>

            {/* Most Paid */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-gray-500" />
                        Most Paid To
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topPaid.map(([name, amount], index) => (
                        <div key={name} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                #{index + 1}
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={name}>
                                    {name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Total: <span className="font-semibold text-gray-900 dark:text-gray-200">₹{amount.toLocaleString('en-IN')}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                    {topPaid.length === 0 && <p className="text-gray-500 text-center py-4 col-span-full">No data available.</p>}
                </div>
            </div>

            {/* Last Reimbursement Info */}
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
