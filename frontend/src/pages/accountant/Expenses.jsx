import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Trash2,
    Search,
    Receipt,
    Calendar,
    DollarSign,
    Filter,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getExpenses, createExpense, deleteExpense } from '../../api/expense.api';

const Expenses = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: 'Utility',
        amount: '',
        payment_mode: 'CASH',
        description: '',
        expense_date: new Date().toISOString().split('T')[0]
    });

    const { data: expensesData, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: getExpenses
    });

    const createMutation = useMutation({
        mutationFn: createExpense,
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['accountant-stats']);
            toast.success('Expense recorded!');
            setIsModalOpen(false);
            setFormData({ category: 'Utility', amount: '', payment_mode: 'CASH', description: '', expense_date: new Date().toISOString().split('T')[0] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteExpense,
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['accountant-stats']);
            toast.success('Expense deleted');
        }
    });

    const expenses = expensesData?.data || [];

    const categories = ['Salary', 'Rent', 'Utility', 'Maintenance', 'Event', 'Stationery', 'Other'];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black">Expense Management</h1>
                    <p className="text-sm text-gray-500 font-medium">Tracking institutional spend and utility payments.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition font-bold shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                    <Plus size={18} />
                    <span>Record Expense</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                            <tr className="text-left">
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Date</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Category</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Description</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Amount</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {isLoading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-gray-400 italic">Loading ledger...</td></tr>
                            ) : expenses.length === 0 ? (
                                <tr><td colSpan="5" className="py-20 text-center text-gray-400 italic">No expenses recorded yet.</td></tr>
                            ) : expenses.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition">
                                    <td className="py-4 px-6 font-medium text-gray-500">{new Date(e.expense_date).toLocaleDateString()}</td>
                                    <td className="py-4 px-6">
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg font-bold text-xs">{e.category}</span>
                                    </td>
                                    <td className="py-4 px-6 max-w-xs truncate font-medium text-gray-700 dark:text-gray-300">{e.description}</td>
                                    <td className="py-4 px-6 font-black text-red-500">₹{e.amount.toLocaleString()}</td>
                                    <td className="py-4 px-6 flex justify-center space-x-2">
                                        <button
                                            onClick={() => { if (window.confirm('Delete this expense?')) deleteMutation.mutate(e.id) }}
                                            className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <h2 className="text-xl font-black">Record New Expense</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition"><X size={20} /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-1">Category</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm px-4 py-3"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm px-4 py-3"
                                        value={formData.expense_date}
                                        onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-1">Amount (₹)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm px-4 py-3 font-bold"
                                    value={formData.amount}
                                    placeholder="0.00"
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-1">Payment Mode</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm px-4 py-3"
                                    value={formData.payment_mode}
                                    onChange={e => setFormData({ ...formData, payment_mode: e.target.value })}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="UPI">UPI</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-1">Description</label>
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm px-4 py-3"
                                    rows="3"
                                    value={formData.description}
                                    placeholder="Enter details about this expense..."
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                disabled={createMutation.isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2"
                            >
                                < DollarSign size={20} />
                                <span>{createMutation.isLoading ? 'Recording...' : 'Submit Expense'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
