import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Users,
    BookOpen,
    Calendar,
    Clock,
    ChevronRight,
    ArrowUpRight,
    UserCheck,
    FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTeacherDashboard } from '../../api/teacher.api';

const TeacherDashboard = () => {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['teacher-dashboard'],
        queryFn: getTeacherDashboard
    });

    const data = dashboardData?.data || { assignments: [], timetable: [], attendanceRate: 0, staff: {} };

    const today = new Date().toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black mb-1">Welcome back, {data.staff.first_name}! 👋</h1>
                    <p className="text-gray-500 font-medium">It's {today}. Here's what's happening today.</p>
                </div>
                <div className="flex space-x-3">
                    <Link to="/teacher/attendance" className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition flex items-center space-x-2">
                        <UserCheck size={18} className="text-indigo-600" />
                        <span>Mark Attendance</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Statistics Cards */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-100 dark:shadow-none relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-xs font-black uppercase opacity-60 tracking-widest mb-4">Assigned Classes</h4>
                            <p className="text-5xl font-black">{data.assignments.length}</p>
                            <div className="mt-8 flex items-center space-x-2 text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                                <BookOpen size={16} />
                                <span>{data.assignments.map(a => a.class.name).join(', ')}</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4 opacity-10">
                            <BookOpen size={180} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                        <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4">Average Attendance</h4>
                        <div className="flex items-end space-x-4">
                            <p className="text-5xl font-black text-gray-900 dark:text-white">{data.attendanceRate}%</p>
                            <ArrowUpRight className="text-green-500 mb-2" size={32} />
                        </div>
                        <p className="text-xs text-gray-400 font-bold mt-4 uppercase tracking-tighter">Based on active class assignments</p>
                    </div>
                </div>

                {/* Timetable / Today's Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black flex items-center space-x-3">
                                <Clock className="text-indigo-600" />
                                <span>Today's Classes</span>
                            </h2>
                            <Link to="/teacher/classes" className="text-indigo-600 font-bold text-sm hover:underline">View Full Schedule</Link>
                        </div>

                        <div className="space-y-4">
                            {data.timetable.filter(t => t.day === new Date().getDay() - 1).length === 0 ? (
                                <div className="text-center py-12 text-gray-400 italic">No classes scheduled for today.</div>
                            ) : data.timetable.filter(t => t.day === new Date().getDay() - 1).map((period, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-3xl hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition group">
                                    <div className="flex items-center space-x-6">
                                        <div className="text-center bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[100px]">
                                            <p className="text-[10px] font-black uppercase text-gray-400">Period {period.period_no}</p>
                                            <p className="font-bold text-indigo-600">{period.start_time}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg">{period.subject.name}</h3>
                                            <p className="text-sm font-bold text-gray-500">{period.class.name} ({period.class.section})</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access Tools */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'My Students', icon: Users, path: '/teacher/students', color: 'bg-blue-100 text-blue-600' },
                    { label: 'Enter Marks', icon: FileText, path: '/teacher/marks', color: 'bg-green-100 text-green-600' },
                    { label: 'Homework', icon: Calendar, path: '/teacher/homework', color: 'bg-orange-100 text-orange-600' },
                    { label: 'Notices', icon: BookOpen, path: '/admin/notices', color: 'bg-purple-100 text-purple-600' },
                ].map((tool, i) => (
                    <Link key={i} to={tool.path} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition flex flex-col items-center text-center space-y-4">
                        <div className={`p-4 rounded-2xl ${tool.color}`}>
                            <tool.icon size={24} />
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest">{tool.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TeacherDashboard;
