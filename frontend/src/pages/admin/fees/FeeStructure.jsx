import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFeeStructures, createFeeStructure } from '../../../api/fees.api';
import { getClasses } from '../../../api/classes.api';

const FeeStructure = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        class_id: '',
        academic_year: '2024-25',
        due_day: 10,
        late_fee_per_day: 50,
        components: [{ name: '', amount: '' }]
    });

    const { data: structures, isLoading: isStructuresLoading } = useQuery({
        queryKey: ['fee-structures'],
        queryFn: getFeeStructures,
    });

    const { data: classesData } = useQuery({
        queryKey: ['classes'],
        queryFn: getClasses,
    });
    const classes = classesData?.data || [];

    const createMutation = useMutation({
        mutationFn: createFeeStructure,
        onSuccess: () => {
            queryClient.invalidateQueries(['fee-structures']);
            toast.success('Fee structure created!');
            setShowForm(false);
            setFormData({
                name: '',
                class_id: '',
                academic_year: '2024-25',
                due_day: 10,
                late_fee_per_day: 50,
                components: [{ name: '', amount: '' }]
            });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Error occurred'),
    });

    const addComponent = () => {
        setFormData({
            ...formData,
            components: [...formData.components, { name: '', amount: '' }]
        });
    };

    const removeComponent = (index) => {
        const newComponents = formData.components.filter((_, i) => i !== index);
        setFormData({ ...formData, components: newComponents });
    };

    const updateComponent = (index, field, value) => {
        const newComponents = [...formData.components];
        newComponents[index][field] = value;
        setFormData({ ...formData, components: newComponents });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const total = formData.components.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        createMutation.mutate({ ...formData, total_amount: total });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Structures</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                >
                    <Plus size={20} />
                    <span>Create Structure</span>
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold">New Fee Structure</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Structure Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Annual Fees Class 10"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Class</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    >
                                        <option value="">Specific Class (Optional)</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Academic Year</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                                        value={formData.academic_year}
                                        onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Due Day (of month)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                                        value={formData.due_day}
                                        onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Late Fee (per day)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                                        value={formData.late_fee_per_day}
                                        onChange={(e) => setFormData({ ...formData, late_fee_per_day: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">Fee Components</h3>
                                    <button type="button" onClick={addComponent} className="text-indigo-600 font-medium text-sm">+ Add Row</button>
                                </div>
                                {formData.components.map((comp, idx) => (
                                    <div key={idx} className="flex space-x-2 items-center">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Component (e.g. Tuition)"
                                            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700"
                                            value={comp.name}
                                            onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                                        />
                                        <input
                                            required
                                            type="number"
                                            placeholder="Amount"
                                            className="w-32 px-4 py-2 border rounded-lg dark:bg-gray-700"
                                            value={comp.amount}
                                            onChange={(e) => updateComponent(idx, 'amount', e.target.value)}
                                        />
                                        <button type="button" onClick={() => removeComponent(idx)} className="text-red-500 p-2"><Trash2 size={20} /></button>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled={createMutation.isLoading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mt-4 hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
                            >
                                <Save size={20} />
                                <span>{createMutation.isLoading ? 'Creating...' : 'Save Fee Structure'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isStructuresLoading ? (
                    <p>Loading structures...</p>
                ) : structures?.data?.map((s) => (
                    <div key={s.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold">{s.name}</h3>
                                <p className="text-sm text-gray-500">{s.academic_year}</p>
                            </div>
                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {s.class_id ? 'Class-Specific' : 'General'}
                            </span>
                        </div>

                        <div className="space-y-2 mb-6">
                            {JSON.parse(JSON.stringify(s.components)).map((c, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{c.name}</span>
                                    <span className="font-medium">₹{c.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 flex justify-between font-bold text-indigo-600">
                                <span>Total Amount</span>
                                <span>₹{s.total_amount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button className="flex-1 py-2 border border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">
                                Edit
                            </button>
                            <button className="p-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeeStructure;
