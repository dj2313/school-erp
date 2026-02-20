import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ClipboardList,
    Plus,
    Calendar,
    ChevronRight,
    PenLine,
    FileText,
    ArrowRight,
    TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getExams, createExam } from '../../../api/exam.api';
import { getAcademicYears, getClasses } from '../../../api/academic.api';

const ExamManagement = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        type: 'written',
        class_id: '',
        academic_year_id: ''
    });

    const { data: examsData, isLoading: examsLoading } = useQuery({ queryKey: ['exams'], queryFn: getExams });
    const { data: yearsData } = useQuery({ queryKey: ['academic-years'], queryFn: getAcademicYears });
    const { data: classesData } = useQuery({ queryKey: ['classes'], queryFn: getClasses });

    const exams = examsData?.data || [];
    const years = yearsData?.data || [];
    const classes = classesData?.data || [];

    const createMutation = useMutation({
        mutationFn: createExam,
        onSuccess: () => {
            queryClient.invalidateQueries(['exams']);
            toast.success('Exam scheduled!');
            setIsModalOpen(false);
            setFormData({ name: '', start_date: '', end_date: '', type: 'written', class_id: '', academic_year_id: '' });
        }
    });

    const handleEnterMarks = (exam) => {
        navigate(`/admin/exams/marks?exam_id=${exam.id}${exam.class_id ? `&class_id=${exam.class_id}` : ''}`);
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 italic">Examination Controller</h1>
                    <p className="text-sm text-gray-500 font-medium">Schedule assessments and manage academic performance.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Schedule Exam</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examsLoading ? (
                    <div className="col-span-full py-20 text-center text-gray-400">Fetching examination schedule...</div>
                ) : exams.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 italic">No exams scheduled for the current session.</div>
                ) : exams.map(exam => (
                    <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl group relative overflow-hidden">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
                                    <ClipboardList size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-indigo-600 transition">{exam.type}</span>
                                    <p className="text-sm font-bold text-gray-500 mt-1">{exam.class?.name || 'All Classes'}</p>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black mb-1 group-hover:text-indigo-600 transition">{exam.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-400 font-bold mb-8 uppercase tracking-tighter">
                                <Calendar size={14} />
                                <span>{new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}</span>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleEnterMarks(exam)}
                                    className="flex-1 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 p-4 rounded-2xl font-black text-sm transition flex items-center justify-center space-x-2 group-hover:shadow-lg group-hover:shadow-indigo-100 dark:group-hover:shadow-none"
                                >
                                    <PenLine size={18} />
                                    <span>Enter Marks</span>
                                </button>
                                <button className="p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600 rounded-2xl transition border border-transparent hover:border-gray-200 dark:hover:border-gray-500">
                                    <FileText size={18} className="text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] p-10 shadow-3xl animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black mb-8 italic">New Assessment Session</h2>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Exam Title</label>
                                <input
                                    required
                                    placeholder="e.g. Unit Test 1"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Start Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm"
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">End Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm"
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Academic Year</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm"
                                        value={formData.academic_year_id}
                                        onChange={e => setFormData({ ...formData, academic_year_id: e.target.value })}
                                    >
                                        <option value="">Select Year</option>
                                        {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Apply to Class</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm"
                                        value={formData.class_id}
                                        onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                                    >
                                        <option value="">All Classes</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex space-x-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 py-4 rounded-2xl font-black transition"
                                >
                                    Dismiss
                                </button>
                                <button
                                    disabled={createMutation.isLoading}
                                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 transition active:scale-95"
                                >
                                    {createMutation.isLoading ? 'Scheduling...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamManagement;
