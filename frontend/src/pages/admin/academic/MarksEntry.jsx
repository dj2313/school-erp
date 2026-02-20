import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Save,
    ArrowLeft,
    Users,
    BookOpen,
    ClipboardCheck,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getExams, bulkSubmitMarks, getExamResults } from '../../../api/exam.api';
import { getClasses, getSubjects } from '../../../api/academic.api';
import { getStudents } from '../../../api/students.api';

const MarksEntry = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const [examId, setExamId] = useState(searchParams.get('exam_id') || '');
    const [classId, setClassId] = useState(searchParams.get('class_id') || '');
    const [subjectId, setSubjectId] = useState('');
    const [maxMarks, setMaxMarks] = useState(100);
    const [studentMarks, setStudentMarks] = useState({});

    // Queries
    const { data: examsData } = useQuery({ queryKey: ['exams'], queryFn: getExams });
    const { data: classesData } = useQuery({ queryKey: ['classes'], queryFn: getClasses });
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects'],
        queryFn: getSubjects
    });

    // Get students when class is selected
    const { data: studentsData, isLoading: loadingStudents } = useQuery({
        queryKey: ['students-for-marks', classId],
        queryFn: () => getStudents({ class_id: classId, is_active: true }),
        enabled: !!classId
    });

    // Get existing results for pre-filling
    const { data: existingResults } = useQuery({
        queryKey: ['exam-results-entry', examId, classId, subjectId],
        queryFn: () => getExamResults({ exam_id: examId, class_id: classId, subject_id: subjectId }),
        enabled: !!examId && !!classId && !!subjectId
    });

    const exams = examsData?.data || [];
    const classes = classesData?.data || [];
    const subjects = subjectsData?.data || [];
    const students = studentsData?.data || [];

    // Pre-fill studentMarks with existing results
    useEffect(() => {
        if (existingResults?.data) {
            const marksMap = {};
            existingResults.data.forEach(r => {
                marksMap[r.student_id] = {
                    obtained_marks: r.obtained_marks,
                    remarks: r.remarks || ''
                };
            });
            setStudentMarks(marksMap);
            if (existingResults.data.length > 0) {
                setMaxMarks(existingResults.data[0].max_marks);
            }
        } else {
            setStudentMarks({});
        }
    }, [existingResults]);

    const submitMutation = useMutation({
        mutationFn: bulkSubmitMarks,
        onSuccess: () => {
            toast.success('Marks updated successfully!');
            queryClient.invalidateQueries(['exam-results-entry']);
        }
    });

    const handleMarkChange = (studentId, value) => {
        setStudentMarks(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], obtained_marks: value }
        }));
    };

    const handleRemarkChange = (studentId, value) => {
        setStudentMarks(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks: value }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const results = students.map(s => ({
            student_id: s.id,
            obtained_marks: studentMarks[s.id]?.obtained_marks || 0,
            max_marks: maxMarks,
            remarks: studentMarks[s.id]?.remarks || ''
        }));

        submitMutation.mutate({
            exam_id: examId,
            subject_id: subjectId,
            class_id: classId,
            results
        });
    };

    return (
        <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin/exams')}
                        className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 transition"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic">Bulk Marks Entry</h1>
                        <p className="text-sm text-gray-500 font-medium">Capture academic scores and observations for a class.</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isLoading || !subjectId}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center space-x-3 transition-all active:scale-95"
                >
                    <Save size={20} />
                    <span>{submitMutation.isLoading ? 'Recording...' : 'Finalize Ledger'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white dark:bg-gray-900/50 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Select Examination</label>
                    <select
                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition"
                        value={examId}
                        onChange={e => setExamId(e.target.value)}
                    >
                        <option value="">Choose Exam Session</option>
                        {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Target Class</label>
                    <select
                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition"
                        value={classId}
                        onChange={e => setClassId(e.target.value)}
                    >
                        <option value="">Choose Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Subject</label>
                    <select
                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition"
                        value={subjectId}
                        onChange={e => setSubjectId(e.target.value)}
                    >
                        <option value="">Choose Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Maximum Marks</label>
                    <input
                        type="number"
                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition"
                        value={maxMarks}
                        onChange={e => setMaxMarks(e.target.value)}
                    />
                </div>
            </div>

            {!classId || !subjectId ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[40px] p-24 text-center border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ArrowLeft size={40} className="rotate-90" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-400 italic mb-2">Configure Target Ledger</h2>
                    <p className="text-gray-400 font-medium max-w-xs mx-auto">Please select a class and subject above to load the student list and start marks entry.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                                <th className="py-6 px-10 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Student Identity</th>
                                <th className="py-6 px-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 w-48">Obtained Marks</th>
                                <th className="py-6 px-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Teacher Remarks</th>
                                <th className="py-6 px-10 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Performance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loadingStudents ? (
                                <tr><td colSpan="4" className="py-20 text-center text-gray-400 italic tracking-widest font-black text-[10px]">Assembling Class Register...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan="4" className="py-20 text-center text-gray-400 italic">No active students found in this class.</td></tr>
                            ) : students.map(s => {
                                const score = studentMarks[s.id]?.obtained_marks || 0;
                                const percent = (score / maxMarks) * 100;
                                let color = 'text-green-500';
                                if (percent < 35) color = 'text-red-500';
                                else if (percent < 60) color = 'text-orange-500';

                                return (
                                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800 transition group">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                                                    {s.first_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 dark:text-gray-100 tracking-tight">{s.first_name} {s.last_name}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.admission_no}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6">
                                            <input
                                                type="number"
                                                step="0.5"
                                                max={maxMarks}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 font-black text-center text-indigo-600 focus:ring-2 ring-indigo-500 transition"
                                                value={studentMarks[s.id]?.obtained_marks || ''}
                                                placeholder="0.0"
                                                onChange={e => handleMarkChange(s.id, e.target.value)}
                                            />
                                        </td>
                                        <td className="py-6 px-6">
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 font-bold text-gray-500 focus:ring-2 ring-indigo-500 transition"
                                                value={studentMarks[s.id]?.remarks || ''}
                                                placeholder="Enter observations..."
                                                onChange={e => handleRemarkChange(s.id, e.target.value)}
                                            />
                                        </td>
                                        <td className="py-6 px-10 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-xl font-black ${color}`}>{percent.toFixed(0)}%</span>
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Efficiency</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MarksEntry;
