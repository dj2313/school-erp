import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    UserCircle,
    Check,
    X,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeaves, updateLeaveStatus } from '../../api/leave.api';

const Leave = () => {
    const queryClient = useQueryClient();

    const { data: leavesData, isLoading } = useQuery({
        queryKey: ['leaves'],
        queryFn: () => getLeaves(),
    });

    const leaves = leavesData?.data || [];

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => updateLeaveStatus(id, { status }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['leaves']);
            toast.success(`Leave ${data.data.status.toLowerCase()}!`);
        },
        onError: () => toast.error('Failed to update leave status'),
    });

    const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
    const historyLeaves = leaves.filter(l => l.status !== 'PENDING');

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-400 font-medium">{label}</p>
                <p className="text-2xl font-black">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black">Leave Management</h1>
                    <p className="text-sm text-gray-500">Review and manage staff leave requests.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Pending Requests" value={pendingLeaves.length} icon={Clock} color="bg-yellow-100 text-yellow-600" />
                <StatCard label="Approved (This Month)" value={leaves.filter(l => l.status === 'APPROVED').length} icon={CheckCircle2} color="bg-green-100 text-green-600" />
                <StatCard label="Rejected" value={leaves.filter(l => l.status === 'REJECTED').length} icon={XCircle} color="bg-red-100 text-red-600" />
            </div>

            {/* Pending Requests */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    <span>Pending Requests</span>
                </h3>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {isLoading ? (
                        <p className="col-span-full py-10 text-center text-gray-500">Loading requests...</p>
                    ) : pendingLeaves.length === 0 ? (
                        <div className="col-span-full py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                            <Check className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500 font-medium">All caught up! No pending leaves.</p>
                        </div>
                    ) : pendingLeaves.map((leave) => (
                        <div key={leave.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-yellow-100 dark:border-yellow-900/20 p-6 flex justify-between items-center">
                            <div className="flex space-x-4">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <UserCircle className="text-gray-400" size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                        {leave.staff.first_name} {leave.staff.last_name}
                                    </h4>
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{leave.leave_type}</p>
                                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                                        <span className="flex items-center space-x-1"><Calendar size={12} /> <span>{new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}</span></span>
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[10px]">{leave.total_days} Days</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic">"{leave.reason}"</p>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => statusMutation.mutate({ id: leave.id, status: 'APPROVED' })}
                                    className="p-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition shadow-sm"
                                    title="Approve"
                                >
                                    <Check size={20} />
                                </button>
                                <button
                                    onClick={() => statusMutation.mutate({ id: leave.id, status: 'REJECTED' })}
                                    className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition shadow-sm"
                                    title="Reject"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* History Table */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Leave History</h3>
                    <button className="flex items-center space-x-2 text-sm text-indigo-600 font-bold"><Filter size={16} /> <span>Filter History</span></button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr className="text-left border-b border-gray-100 dark:border-gray-700">
                                <th className="py-4 px-6 font-bold text-gray-500">Staff</th>
                                <th className="py-4 px-6 font-bold text-gray-500">Dates</th>
                                <th className="py-4 px-6 font-bold text-gray-500">Days</th>
                                <th className="py-4 px-6 font-bold text-gray-500">Type</th>
                                <th className="py-4 px-6 font-bold text-gray-500 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {historyLeaves.map((leave) => (
                                <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <td className="py-4 px-6">
                                        <p className="font-bold">{leave.staff.first_name} {leave.staff.last_name}</p>
                                        <p className="text-[10px] text-gray-400">{leave.staff.designation}</p>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400 text-xs">
                                        {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 font-medium">{leave.total_days}</td>
                                    <td className="py-4 px-6">
                                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded text-[10px] font-black uppercase">
                                            {leave.leave_type}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leave;
