import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Clock,
    Calendar,
    Plus,
    X,
    Save,
    User,
    BookOpen,
    Trash2,
    ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getClasses, getSubjects } from '../../../api/academic.api';
import { getStaff } from '../../../api/staff.api';
import { getTimetableByClass, upsertTimetableEntry, deleteTimetableEntry } from '../../../api/timetable.api';

const TimetableBuilder = () => {
    const queryClient = useQueryClient();
    const [selectedClass, setSelectedClass] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeEntry, setActiveEntry] = useState(null);

    // Queries
    const { data: classesData } = useQuery({ queryKey: ['classes'], queryFn: getClasses });
    const { data: subjectsData } = useQuery({ queryKey: ['subjects'], queryFn: getSubjects });
    const { data: staffData } = useQuery({ queryKey: ['staff'], queryFn: getStaff });
    const { data: timetableData, isLoading: loadingTimetable } = useQuery({
        queryKey: ['timetable', selectedClass?.id],
        queryFn: () => getTimetableByClass(selectedClass.id),
        enabled: !!selectedClass
    });

    const classes = classesData?.data || [];
    const subjects = subjectsData?.data || [];
    const staff = staffData?.data || [];
    const timetable = timetableData?.data || [];

    // Mutation
    const saveMutation = useMutation({
        mutationFn: upsertTimetableEntry,
        onSuccess: () => {
            queryClient.invalidateQueries(['timetable', selectedClass?.id]);
            toast.success('Period saved');
            setIsModalOpen(false);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Conflict detected');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTimetableEntry,
        onSuccess: () => {
            queryClient.invalidateQueries(['timetable', selectedClass?.id]);
            toast.success('Period removed');
        }
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    const getEntry = (dayIdx, periodNo) => {
        return timetable.find(t => t.day === dayIdx && t.period_no === periodNo);
    };

    const handleCellClick = (dayIdx, periodNo) => {
        const existing = getEntry(dayIdx, periodNo);
        setActiveEntry(existing || {
            class_id: selectedClass.id,
            day: dayIdx,
            period_no: periodNo,
            subject_id: '',
            staff_id: '',
            start_time: '09:00',
            end_time: '09:45'
        });
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Weekly Timetable</h1>
                    <p className="text-sm text-gray-500 font-medium">Schedule subjects and assign teachers to avoid resource conflicts.</p>
                </div>
                <div className="flex space-x-4">
                    <select
                        className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-3 font-bold text-sm shadow-sm focus:ring-2 ring-indigo-500 outline-none transition"
                        onChange={(e) => {
                            const cls = classes.find(c => c.id === parseInt(e.target.value));
                            setSelectedClass(cls);
                        }}
                        value={selectedClass?.id || ''}
                    >
                        <option value="">Select Class & Section</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedClass ? (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-[40px] p-24 text-center">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Calendar size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mb-2 italic">Architecture of Education</h2>
                    <p className="text-indigo-600/70 font-medium max-w-xs mx-auto">Select a class from the dropdown above to start building its weekly schedule.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="py-6 px-4 border-b border-r border-gray-100 dark:border-gray-800 font-black text-[10px] uppercase tracking-widest text-gray-400">Day / Period</th>
                                    {periods.map(p => (
                                        <th key={p} className="py-6 px-4 border-b border-gray-100 dark:border-gray-800 font-black text-[10px] uppercase tracking-widest text-gray-400">P{p}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {days.map((day, dayIdx) => (
                                    <tr key={day}>
                                        <td className="py-6 px-4 border-r border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 font-black text-xs uppercase tracking-widest text-gray-500">{day}</td>
                                        {periods.map(p => {
                                            const entry = getEntry(dayIdx, p);
                                            return (
                                                <td
                                                    key={p}
                                                    onClick={() => handleCellClick(dayIdx, p)}
                                                    className={`
                                                        py-4 px-4 border-b border-r border-gray-100 dark:border-gray-800 h-28 min-w-[140px] cursor-pointer transition-all
                                                        ${entry ? 'bg-indigo-50 dark:bg-indigo-900/20 hover:scale-[1.02] hover:shadow-lg relative group' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                                                    `}
                                                >
                                                    {entry ? (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center space-x-1.5 font-black text-indigo-600 text-[10px] uppercase tracking-tighter">
                                                                <BookOpen size={12} />
                                                                <span className="truncate">{entry.subject.name}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1.5 font-bold text-gray-500 text-[10px]">
                                                                <User size={12} />
                                                                <span className="truncate">{entry.staff?.first_name}</span>
                                                            </div>
                                                            <div className="text-[9px] font-black text-gray-300 group-hover:text-indigo-300 transition">{entry.start_time} - {entry.end_time}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                                            <Plus size={16} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] p-10 shadow-3xl animate-in zoom-in duration-300 border border-white/20">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black italic">Scheduling Period {activeEntry.period_no}</h2>
                                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">{days[activeEntry.day]}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full hover:bg-red-50 hover:text-red-500 transition"><X size={20} /></button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Subject Selection</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 outline-none transition"
                                    value={activeEntry.subject_id || ''}
                                    onChange={(e) => setActiveEntry({ ...activeEntry, subject_id: parseInt(e.target.value) })}
                                >
                                    <option value="">Choose Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Assign Teacher</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 outline-none transition"
                                    value={activeEntry.staff_id || ''}
                                    onChange={(e) => setActiveEntry({ ...activeEntry, staff_id: parseInt(e.target.value) })}
                                >
                                    <option value="">Select Instructor</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 outline-none transition"
                                        value={activeEntry.start_time}
                                        onChange={(e) => setActiveEntry({ ...activeEntry, start_time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 outline-none transition"
                                        value={activeEntry.end_time}
                                        onChange={(e) => setActiveEntry({ ...activeEntry, end_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex space-x-4">
                                {activeEntry.id && (
                                    <button
                                        onClick={() => { if (window.confirm('Delete this period?')) deleteMutation.mutate(activeEntry.id); setIsModalOpen(false); }}
                                        className="p-5 bg-red-100 text-red-600 rounded-3xl hover:bg-red-200 transition"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                )}
                                <button
                                    onClick={() => saveMutation.mutate(activeEntry)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-3xl font-black shadow-xl shadow-indigo-200 transition active:scale-95 flex items-center justify-center space-x-3"
                                >
                                    <Save size={24} />
                                    <span>{activeEntry.id ? 'Update Schedule' : 'Create Period'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableBuilder;
