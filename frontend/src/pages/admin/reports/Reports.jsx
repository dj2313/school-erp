import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
    FileText,
    TrendingUp,
    Users,
    Wallet,
    Calendar,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    getAttendanceReport,
    getFeeCollectionReport,
    getStudentStrengthReport,
    getPayrollReport
} from '../../../api/reports.api';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('attendance');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
        queryKey: ['report-attendance'],
        queryFn: () => getAttendanceReport({ month: new Date().getMonth() + 1, year: new Date().getFullYear() }),
        enabled: activeTab === 'attendance'
    });

    const { data: feeData, isLoading: loadingFees } = useQuery({
        queryKey: ['report-fees', dateRange],
        queryFn: () => getFeeCollectionReport({ start_date: dateRange.start, end_date: dateRange.end }),
        enabled: activeTab === 'fees'
    });

    const { data: strengthData, isLoading: loadingStrength } = useQuery({
        queryKey: ['report-strength'],
        queryFn: getStudentStrengthReport,
        enabled: activeTab === 'strength'
    });

    const { data: payrollData, isLoading: loadingPayroll } = useQuery({
        queryKey: ['report-payroll'],
        queryFn: () => getPayrollReport({ month: new Date().getMonth() + 1, year: new Date().getFullYear() }),
        enabled: activeTab === 'payroll'
    });

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    const tabs = [
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'fees', label: 'Fee Collection', icon: Wallet },
        { id: 'strength', label: 'Student Strength', icon: Users },
        { id: 'payroll', label: 'Staff Payroll', icon: FileText },
    ];

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Institutional Reports</h1>
                    <p className="text-sm text-gray-500 font-medium">Deep dive into school performance and financial metrics.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                    <Filter size={18} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-500">Date Range:</span>
                </div>
                <input
                    type="date"
                    className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={dateRange.start}
                    onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <span className="text-gray-400">to</span>
                <input
                    type="date"
                    className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={dateRange.end}
                    onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                />
                <div className="flex-1"></div>
                <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition font-bold shadow-lg shadow-indigo-100 dark:shadow-none">
                    <Download size={18} />
                    <span>Export Excel</span>
                </button>
            </div>

            {/* Attendance Report */}
            {activeTab === 'attendance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-50 dark:border-gray-700">
                        <h3 className="text-lg font-black mb-6">Class-wise Attendance %</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceData?.data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="class_name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="attendance_percentage" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                            <h4 className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">Top Performing Class</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-3xl font-black">98.2%</p>
                                    <p className="text-gray-600 dark:text-gray-400 font-bold text-sm">Class 10-A</p>
                                </div>
                                <ArrowUpRight className="text-green-500" size={32} />
                            </div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-800">
                            <h4 className="text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest mb-4">Critical Review (Low Att.)</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-3xl font-black">62.5%</p>
                                    <p className="text-gray-600 dark:text-gray-400 font-bold text-sm">Class 12-C</p>
                                </div>
                                <ArrowDownRight className="text-red-500" size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fee Collection Report */}
            {activeTab === 'fees' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-50 dark:border-gray-700">
                        <h3 className="text-lg font-black mb-6">Payment Mode Distribution</h3>
                        <div className="h-80 flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={Object.entries(feeData?.data?.mode_breakdown || {}).map(([name, value]) => ({ name, value }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {Object.entries(feeData?.data?.mode_breakdown || {}).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-2xl shadow-indigo-200 dark:shadow-none flex flex-col justify-center">
                        <TrendingUp size={48} className="mb-6 opacity-80" />
                        <p className="text-sm font-bold uppercase tracking-widest opacity-80">Total Revenue Collected</p>
                        <h2 className="text-5xl font-black mt-2">₹{(feeData?.data?.total_collected || 0).toLocaleString()}</h2>
                        <div className="mt-8 pt-8 border-t border-white/20">
                            <p className="text-sm opacity-80">Total Transactions: <span className="font-black">{feeData?.data?.transactions}</span></p>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Strength */}
            {activeTab === 'strength' && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-50 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-black mb-6">Class-wise Strength</h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={strengthData?.data} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                <XAxis type="number" axisLine={false} tickLine={false} />
                                <YAxis dataKey="class_name" type="category" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Payroll Summary */}
            {activeTab === 'payroll' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-50 dark:border-gray-700 text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Wallet size={32} />
                        </div>
                        <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Monthly Payout</h4>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">₹{(payrollData?.data?.total_payout || 0).toLocaleString()}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-50 dark:border-gray-700 text-center">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText size={32} />
                        </div>
                        <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Processed Payslips</h4>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">{payrollData?.data?.payslips_count}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-50 dark:border-gray-700 text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ArrowDownRight size={32} />
                        </div>
                        <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Pending Payments</h4>
                        <p className="text-4xl font-black text-red-600">{payrollData?.data?.pending_payments}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
