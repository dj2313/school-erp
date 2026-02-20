import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Calendar,
    BookOpen,
    Library,
    Plus,
    Trash2,
    Edit2,
    Link as LinkIcon,
    ChevronRight,
    Search,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getClasses, createClass,
    getSubjects, createSubject,
    getAcademicYears, createAcademicYear,
    assignSubjectToClass
} from '../../../api/academic.api';

const AcademicSetup = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('years');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Queries
    const { data: yearsData, isLoading: loadingYears } = useQuery({ queryKey: ['academic-years'], queryFn: getAcademicYears });
    const { data: classesData, isLoading: loadingClasses } = useQuery({ queryKey: ['classes'], queryFn: getClasses });
    const { data: subjectsData, isLoading: loadingSubjects } = useQuery({ queryKey: ['subjects'], queryFn: getSubjects });

    const years = yearsData?.data || [];
    const classes = classesData?.data || [];
    const subjects = subjectsData?.data || [];

    // Mutations
    const createYearMutation = useMutation({
        mutationFn: createAcademicYear,
        onSuccess: () => {
            queryClient.invalidateQueries(['academic-years']);
            toast.success('Academic Year Added');
            setIsModalOpen(false);
        }
    });

    const createClassMutation = useMutation({
        mutationFn: createClass,
        onSuccess: () => {
            queryClient.invalidateQueries(['classes']);
            toast.success('Class Added');
            setIsModalOpen(false);
        }
    });

    const createSubjectMutation = useMutation({
        mutationFn: createSubject,
        onSuccess: () => {
            queryClient.invalidateQueries(['subjects']);
            toast.success('Subject Created');
            setIsModalOpen(false);
        }
    });

    const tabs = [
        { id: 'years', label: 'Academic Years', icon: Calendar },
        { id: 'classes', label: 'Classes & Sections', icon: Library },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Academic Setup</h1>
                    <p className="text-sm text-gray-500 font-medium">Define your school's structure, subjects, and sessions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>Add {activeTab === 'years' ? 'New Year' : activeTab === 'classes' ? 'New Class' : 'New Subject'}</span>
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            px-6 py-3 rounded-xl flex items-center space-x-2 font-bold text-sm transition-all
                            ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}
                        `}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                {activeTab === 'years' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {years.map(y => (
                            <div key={y.id} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 group hover:border-indigo-500 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${y.is_current ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                        <Calendar size={20} />
                                    </div>
                                    {y.is_current && (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Current Session</span>
                                    )}
                                </div>
                                <h3 className="text-xl font-black mb-2">{y.name}</h3>
                                <div className="text-sm text-gray-500 space-y-1 font-medium">
                                    <p>{new Date(y.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {new Date(y.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div className="mt-6 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition"><Edit2 size={16} /></button>
                                    <button className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-bottom border-gray-100">
                                    <th className="py-4 px-4 text-xs font-black uppercase text-gray-400 tracking-widest">Class Name</th>
                                    <th className="py-4 px-4 text-xs font-black uppercase text-gray-400 tracking-widest">Academic Year</th>
                                    <th className="py-4 px-4 text-xs font-black uppercase text-gray-400 tracking-widest">Strength</th>
                                    <th className="py-4 px-4 text-xs font-black uppercase text-gray-400 tracking-widest">Subjects</th>
                                    <th className="py-4 px-4 text-xs font-black uppercase text-gray-400 tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {classes.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group">
                                        <td className="py-5 px-4 font-black text-gray-900 dark:text-white">{c.name} ({c.section})</td>
                                        <td className="py-5 px-4"><span className="text-sm font-bold text-gray-500">{c.academic_year.name}</span></td>
                                        <td className="py-5 px-4"><span className="text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">{c._count.students} / {c.capacity}</span></td>
                                        <td className="py-5 px-4">
                                            <div className="flex -space-x-2">
                                                {c.subjects.slice(0, 3).map((s, i) => (
                                                    <div key={i} title={s.subject.name} className="w-8 h-8 rounded-lg bg-indigo-100 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-black text-indigo-600 ring-2 ring-indigo-50">
                                                        {s.subject.code.substring(0, 2)}
                                                    </div>
                                                ))}
                                                {c.subjects.length > 3 && (
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-black text-gray-500">
                                                        +{c.subjects.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex justify-center space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-indigo-600 transition"><Edit2 size={16} /></button>
                                                <button className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'subjects' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {subjects.map(s => (
                            <div key={s.id} className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 rounded-3xl hover:border-indigo-600 transition-all hover:shadow-xl shadow-indigo-100 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                                        <BookOpen size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-gray-300 group-hover:text-indigo-600 transition">{s.code}</span>
                                </div>
                                <h4 className="font-black text-lg mb-1">{s.name}</h4>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.type}</p>
                                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500">{s.class_subjects.length} Classes</span>
                                    <button title="Assign to Class" className="p-2 text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 rounded-xl transition">
                                        <LinkIcon size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Placeholder */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black mb-8 italic">New {activeTab === 'years' ? 'Academic Year' : activeTab === 'classes' ? 'Class/Section' : 'Subject'}</h2>
                        {/* Simplified forms for brevity in this step */}
                        <div className="space-y-6">
                            <input
                                placeholder="Name (e.g. 2024-25 or Mathematics)"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition"
                            />
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 py-4 rounded-2xl font-black transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 transition active:scale-95"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicSetup;
