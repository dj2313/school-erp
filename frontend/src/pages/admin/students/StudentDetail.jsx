import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getStudentById,
    deleteStudent,
    getStudentAttendance,
    getStudentFees,
    getStudentResults,
} from '../../../api/students.api';

const StudentDetail = () => {
    const { id: studentId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');

    const { data: student, isLoading, error } = useQuery({
        queryKey: ['student', studentId],
        queryFn: () => getStudentById(studentId),
    });

    const { data: attendanceData, isLoading: isAttendanceLoading } = useQuery({
        queryKey: ['student-attendance', studentId],
        queryFn: () => getStudentAttendance(studentId),
        enabled: activeTab === 'attendance',
    });

    const { data: feesData, isLoading: isFeesLoading } = useQuery({
        queryKey: ['student-fees', studentId],
        queryFn: () => getStudentFees(studentId),
        enabled: activeTab === 'fees',
    });

    const { data: resultsData, isLoading: isResultsLoading } = useQuery({
        queryKey: ['student-results', studentId],
        queryFn: () => getStudentResults(studentId),
        enabled: activeTab === 'results',
    });

    const deleteMutation = {
        mutate: async () => {
            if (window.confirm('Are you sure you want to delete this student?')) {
                try {
                    await deleteStudent(studentId);
                    toast.success('Student deleted successfully');
                    navigate('/admin/students');
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to delete student');
                }
            }
        },
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="h-96 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <p className="text-red-700 dark:text-red-300">Failed to load student data</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'attendance', label: 'Attendance', icon: '📋' },
        { id: 'fees', label: 'Fees', icon: '💰' },
        { id: 'results', label: 'Results', icon: '📊' },
        { id: 'documents', label: 'Documents', icon: '📄' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/students')}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                    <ArrowLeft size={20} />
                    Back to Students
                </button>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Edit size={18} />
                        Edit Student
                    </button>
                    <button
                        onClick={() => deleteMutation.mutate()}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <Trash2 size={18} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Student Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex gap-6 items-start">
                    {student?.photo_url ? (
                        <img
                            src={student.photo_url}
                            alt={student.first_name}
                            className="w-32 h-32 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-4xl">👤</span>
                        </div>
                    )}

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {student?.first_name} {student?.last_name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Admission: {student?.admission_no}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Class</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{student?.class?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Roll No</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{student?.roll_no || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">DOB</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {student?.dob ? new Date(student.dob).toLocaleDateString() : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Gender</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{student?.gender || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-medium border-b-2 transition-all ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">First Name</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.first_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Name</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.last_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Blood Group</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.blood_group || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.category || '-'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.address || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Parent/Guardian Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Father's Name</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.father_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Father's Phone</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.father_phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Father's Email</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.father_email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Mother's Name</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.mother_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Mother's Phone</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.mother_phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Mother's Email</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{student?.mother_email || '-'}</p>
                                </div>
                                {student?.guardian_name && (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Guardian's Name</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{student.guardian_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Guardian's Phone</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{student.guardian_phone || '-'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Records</h3>
                        {isAttendanceLoading ? (
                            <p>Loading attendance...</p>
                        ) : attendanceData?.data && attendanceData.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceData.data.map((record) => (
                                            <tr
                                                key={record.id}
                                                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${record.status === 'Present'
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                            }`}
                                                    >
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{record.remarks || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 py-8 text-center">No attendance records found</p>
                        )}
                    </div>
                )}

                {/* Fees Tab */}
                {activeTab === 'fees' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fee Records</h3>
                        {isFeesLoading ? (
                            <p>Loading fees...</p>
                        ) : feesData?.data && feesData.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Invoice No</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Paid</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Remaining</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feesData.data.map((invoice) => (
                                            <tr
                                                key={invoice.id}
                                                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="py-3 px-4">{invoice.invoice_no}</td>
                                                <td className="py-3 px-4">₹{invoice.amount?.toLocaleString()}</td>
                                                <td className="py-3 px-4">₹{invoice.paid_amount?.toLocaleString() || 0}</td>
                                                <td className="py-3 px-4">
                                                    ₹{(invoice.amount - (invoice.paid_amount || 0)).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${invoice.paid_amount === invoice.amount
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                            }`}
                                                    >
                                                        {invoice.paid_amount === invoice.amount ? 'Paid' : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 py-8 text-center">No fee records found</p>
                        )}
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Exam Results</h3>
                        {isResultsLoading ? (
                            <p>Loading results...</p>
                        ) : resultsData?.data && resultsData.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Exam</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Subject</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Marks Obtained</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Marks</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultsData.data.map((result) => {
                                            const percentage = ((result.obtained_marks / result.max_marks) * 100).toFixed(2);
                                            return (
                                                <tr
                                                    key={result.id}
                                                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <td className="py-3 px-4">{result.exam?.name || '-'}</td>
                                                    <td className="py-3 px-4">{result.exam?.subject || '-'}</td>
                                                    <td className="py-3 px-4">{result.obtained_marks}</td>
                                                    <td className="py-3 px-4">{result.max_marks}</td>
                                                    <td className="py-3 px-4 font-medium">{percentage}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 py-8 text-center">No exam results found</p>
                        )}
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h3>
                        {student?.documents && student.documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white">{doc.document_type}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {doc.file_url && (
                                                <a
                                                    href={doc.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                                                >
                                                    <Download size={20} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 py-8 text-center">No documents uploaded</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetail;
