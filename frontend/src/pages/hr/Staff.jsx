import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Filter,
    Mail,
    Phone,
    UserCircle,
    X,
    Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../../api/staff.api';

const Staff = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'TEACHER',
        employee_code: '',
        designation: '',
        department: '',
        joining_date: new Date().toISOString().split('T')[0],
        salary: '',
        password: '',
    });

    const { data: staffData, isLoading } = useQuery({
        queryKey: ['staff'],
        queryFn: getStaff,
    });

    const staff = staffData?.data || [];

    const createMutation = useMutation({
        mutationFn: createStaff,
        onSuccess: () => {
            queryClient.invalidateQueries(['staff']);
            toast.success('Staff member added successfully!');
            setShowModal(false);
            resetForm();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to add staff'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateStaff(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['staff']);
            toast.success('Staff member updated!');
            setShowModal(false);
            setEditingStaff(null);
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStaff,
        onSuccess: () => {
            queryClient.invalidateQueries(['staff']);
            toast.success('Staff member deactivated');
        },
    });

    const resetForm = () => {
        setFormData({
            first_name: '', last_name: '', email: '', phone: '',
            role: 'TEACHER', employee_code: '', designation: '',
            department: '', joining_date: new Date().toISOString().split('T')[0],
            salary: '', password: '',
        });
    };

    const handleEdit = (member) => {
        setEditingStaff(member);
        setFormData({
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            phone: member.phone,
            role: member.user?.role || 'TEACHER',
            employee_code: member.employee_code,
            designation: member.designation,
            department: member.department,
            joining_date: new Date(member.joining_date).toISOString().split('T')[0],
            salary: member.salary,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingStaff) {
            updateMutation.mutate({ id: editingStaff.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const filteredStaff = staff.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Staff Management
                    </h1>
                    <p className="text-sm text-gray-500">Manage teachers, administrators, and other support staff.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingStaff(null); setShowModal(true); }}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                    <Plus size={20} />
                    <span className="font-bold">Add New Staff</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or employee code..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                    <Filter size={18} />
                    <span>More Filters</span>
                </button>
            </div>

            {/* Staff Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-20 text-gray-500">Loading staff directory...</div>
                ) : filteredStaff.map((member) => (
                    <div key={member.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                                <UserCircle size={32} />
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(member)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 text-indigo-600 rounded-lg"><Edit size={16} /></button>
                                <button onClick={() => deleteMutation.mutate(member.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                                {member.first_name} {member.last_name}
                            </h3>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{member.designation}</p>
                            <p className="text-xs text-gray-400 mt-1">ID: {member.employee_code}</p>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail size={14} />
                                <span className="truncate">{member.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone size={14} />
                                <span>{member.phone}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Department</span>
                            <span className="text-xs font-medium px-2 py-0.5 bg-gray-50 dark:bg-gray-700 rounded-full">{member.department || 'General'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <h2 className="text-xl font-black">{editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">First Name</label>
                                <input required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Last Name</label>
                                <input required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
                                <input required type="email" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone Number</label>
                                <input required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Employee Code</label>
                                <input required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl" value={formData.employee_code} onChange={e => setFormData({ ...formData, employee_code: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">System Role</label>
                                <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="HR">HR Manager</option>
                                    <option value="ACCOUNTANT">Accountant</option>
                                    <option value="RECEPTIONIST">Receptionist</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Designation</label>
                                <input required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Monthly Salary (₹)</label>
                                <input required type="number" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl font-bold" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                            </div>
                            {!editingStaff && (
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Account Password</label>
                                    <input required type="password" placeholder="Default: Staff@123" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                            )}
                            <div className="col-span-2 pt-4">
                                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition flex items-center justify-center space-x-2">
                                    <Save size={20} />
                                    <span>{editingStaff ? 'Update Profile' : 'Register Staff Member'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
