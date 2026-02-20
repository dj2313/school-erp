import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Wallet,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Users
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { getFeeReport, getInvoices } from '../../../api/fees.api';

const FeeOverview = () => {
    const { data: reportData } = useQuery({
        queryKey: ['fee-report', 'monthly'],
        queryFn: () => getFeeReport('monthly'),
    });

    const { data: invoicesData } = useQuery({
        queryKey: ['all-invoices'],
        queryFn: () => getInvoices({ limit: 100 }),
    });

    const stats = [
        {
            label: 'Total Collected (Month)',
            value: `₹${reportData?.data?.summary?.total_collected?.toLocaleString() || 0}`,
            icon: Wallet,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            label: 'Total Invoices',
            value: invoicesData?.data?.length || 0,
            icon: Clock,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            label: 'Paid Invoices',
            value: invoicesData?.data?.filter(i => i.status === 'PAID').length || 0,
            icon: CheckCircle,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100'
        },
        {
            label: 'Pending Balance',
            value: `₹${invoicesData?.data?.reduce((sum, i) => sum + i.balance, 0).toLocaleString() || 0}`,
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-100'
        }
    ];

    const modeSummary = reportData?.data?.summary?.by_mode || {};
    const chartData = Object.keys(modeSummary).map(mode => ({
        name: mode,
        value: modeSummary[mode]
    }));

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Overview</h1>
                <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
                        <div className={`${stat.bg} p-3 rounded-lg`}>
                            <stat.icon className={stat.color} size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Collection Trend (By Mode) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-6">Collection by Mode</h3>
                    <div className="h-64">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available for this period</div>
                        )}
                    </div>
                </div>

                {/* Collection Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-6">Payment Distribution</h3>
                    <div className="h-64 flex items-center justify-center">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No transactions recorded</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Payments Table */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                <th className="pb-3 px-2">Invoice No</th>
                                <th className="pb-3 px-2">Student</th>
                                <th className="pb-3 px-2">Class</th>
                                <th className="pb-3 px-2">Amount</th>
                                <th className="pb-3 px-2">Status</th>
                                <th className="pb-3 px-2">Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoicesData?.data?.slice(0, 5).map((inv) => (
                                <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                    <td className="py-3 px-2 font-medium">{inv.invoice_no}</td>
                                    <td className="py-3 px-2">{inv.student?.first_name} {inv.student?.last_name}</td>
                                    <td className="py-3 px-2">{inv.student?.class?.name}</td>
                                    <td className="py-3 px-2">₹{inv.total_amount?.toLocaleString()}</td>
                                    <td className="py-3 px-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-gray-500">{new Date(inv.due_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FeeOverview;
