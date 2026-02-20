import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    Search,
    MessageSquare,
    Download,
    AlertTriangle,
    Mail,
    ChevronRight,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getPendingDues } from '../../../api/fees.api';

const PendingDues = () => {
    const [search, setSearch] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);

    const { data: duesData, isLoading } = useQuery({
        queryKey: ['pending-dues'],
        queryFn: getPendingDues,
    });

    const dues = duesData?.data || [];

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(dues.map(d => d.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelect = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const sendReminderMutation = useMutation({
        mutationFn: async (studentIds) => {
            // Placeholder for real SMS/Email API
            return new Promise(resolve => setTimeout(resolve, 1500));
        },
        onSuccess: () => {
            toast.success(`Reminders sent to ${selectedStudents.length} students/parents`);
            setSelectedStudents([]);
        }
    });

    const filteredDues = dues.filter(d =>
        d.student.first_name.toLowerCase().includes(search.toLowerCase()) ||
        d.student.last_name.toLowerCase().includes(search.toLowerCase()) ||
        d.student.admission_no.toLowerCase().includes(search.toLowerCase()) ||
        d.invoice_no.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <span>Pending Dues</span>
                        {dues.length > 0 && (
                            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-sm font-bold">
                                {dues.length}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 text-sm">Follow up with students who have outstanding balances.</p>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <button
                        disabled={selectedStudents.length === 0 || sendReminderMutation.isLoading}
                        onClick={() => sendReminderMutation.mutate(selectedStudents)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm ${selectedStudents.length > 0
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <MessageSquare size={18} />
                        <span>{sendReminderMutation.isLoading ? 'Sending...' : 'Send Reminders'}</span>
                    </button>
                </div>
            </div>

            {/* Filters & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find by name, admission no, or invoice..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border-none focus:ring-2 focus:ring-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition">
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center space-x-3">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-red-600/70 font-bold uppercase tracking-wider">Total Outstanding</p>
                            <p className="text-lg font-black text-red-600">
                                ₹{dues.reduce((sum, d) => sum + d.balance, 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dues Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr className="text-left border-b border-gray-100 dark:border-gray-700">
                                <th className="py-4 px-6 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedStudents.length === dues.length && dues.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-4 px-4 font-bold text-gray-600 dark:text-gray-400">Student Details</th>
                                <th className="py-4 px-4 font-bold text-gray-600 dark:text-gray-400">Invoice Info</th>
                                <th className="py-4 px-4 font-bold text-gray-600 dark:text-gray-400">Due Date</th>
                                <th className="py-4 px-4 font-bold text-gray-600 dark:text-gray-400">Balance</th>
                                <th className="py-4 px-4 font-bold text-gray-600 dark:text-gray-400">Days Overdue</th>
                                <th className="py-4 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan="7" className="py-12 text-center text-gray-500">Loading pending dues...</td></tr>
                            ) : filteredDues.length === 0 ? (
                                <tr><td colSpan="7" className="py-12 text-center text-gray-500">No overdue payments found.</td></tr>
                            ) : filteredDues.map((due) => {
                                const today = new Date();
                                const dueDate = new Date(due.due_date);
                                const diffDays = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));

                                return (
                                    <tr key={due.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                                        <td className="py-4 px-6 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={selectedStudents.includes(due.id)}
                                                onChange={() => handleSelect(due.id)}
                                            />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center font-bold text-indigo-600">
                                                    {due.student.first_name[0]}{due.student.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white leading-tight">
                                                        {due.student.first_name} {due.student.last_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Adm: {due.student.admission_no} • {due.student.class?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-xs font-mono text-gray-500">
                                            {due.invoice_no}
                                        </td>
                                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                                            {dueDate.toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-bold text-red-600">₹{due.balance.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400">Total: ₹{due.total_amount.toLocaleString()}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${diffDays > 30 ? 'bg-red-100 text-red-600' :
                                                    diffDays > 7 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {diffDays} Days
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button title="Email Reminder" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                                                    <Mail size={16} />
                                                </button>
                                                <button title="Phone Reminder" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition">
                                                    <MessageSquare size={16} />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-indigo-600 transition">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PendingDues;
