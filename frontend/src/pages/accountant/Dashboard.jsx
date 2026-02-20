import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    TrendingDown,
    PlusCircle,
    RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAccountantStats } from '../../api/expense.api';

const AccountantDashboard = () => {
    const { data: statsData, isLoading, refetch } = useQuery({
        queryKey: ['accountant-stats'],
        queryFn: getAccountantStats
    });

    const stats = statsData?.data || { today_collection: 0, today_expenses: 0, total_pending_fees: 0 };

    const cards = [
        {
            label: 'Daily Collection',
            value: `₹${stats.today_collection.toLocaleString()}`,
            icon: TrendingUp,
            color: 'bg-green-50 text-green-600',
            border: 'border-green-100'
        },
        {
            label: 'Daily Expenses',
            value: `₹${stats.today_expenses.toLocaleString()}`,
            icon: TrendingDown,
            color: 'bg-red-50 text-red-600',
            border: 'border-red-100'
        },
        {
            label: 'Total Pending Fees',
            value: `₹${stats.total_pending_fees.toLocaleString()}`,
            icon: Wallet,
            color: 'bg-indigo-50 text-indigo-600',
            border: 'border-indigo-100'
        },
    ];

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black">Financial Overview</h1>
                    <p className="text-sm text-gray-500 font-medium">Monitoring revenue, expenses, and fee recovery.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition"
                >
                    <RotateCcw size={20} className="text-gray-500" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className={`bg-white dark:bg-gray-800 p-8 rounded-3xl border ${card.border} shadow-sm group hover:shadow-xl transition-all duration-300`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Update</span>
                        </div>
                        <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">{card.label}</h4>
                        <p className="text-4xl font-black text-gray-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-100 dark:shadow-none">
                    <h2 className="text-2xl font-black mb-6">Accounting Tools</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/accountant/collect" className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-6 rounded-2xl transition border border-white/10 flex flex-col items-center text-center">
                            <PlusCircle size={32} className="mb-4" />
                            <span className="font-bold text-sm">Collect Fee</span>
                        </Link>
                        <Link to="/accountant/expenses" className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-6 rounded-2xl transition border border-white/10 flex flex-col items-center text-center">
                            <ArrowDownRight size={32} className="mb-4" />
                            <span className="font-bold text-sm">Record Expense</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-xl font-black mb-6">Next Steps</h2>
                    <ul className="space-y-4">
                        <li className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">1</div>
                            <div className="text-sm font-bold text-gray-600 dark:text-gray-300">Run monthly reconciliation report</div>
                        </li>
                        <li className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">2</div>
                            <div className="text-sm font-bold text-gray-600 dark:text-gray-300">Follow up on top 10 fee defaulters</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AccountantDashboard;
