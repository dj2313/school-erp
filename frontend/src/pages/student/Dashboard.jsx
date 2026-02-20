import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    GraduationCap,
    Calendar,
    Clock,
    FileText,
    CreditCard,
    Trophy,
    TrendingUp,
    MapPin,
    Phone
} from 'lucide-react';

const StudentDashboard = () => {
    // TODO: Implement student dashboard data fetching
    const isLoading = false;
    const student = null;
    if (!student) return <div className="p-20 text-center text-red-500 font-black">Student profile not found. Please contact administration.</div>;

    const attendanceRate = student.attendance.length > 0
        ? ((student.attendance.filter(a => a.status === 'PRESENT').length / student.attendance.length) * 100).toFixed(0)
        : 0;

    const today = new Date().getDay() - 1; // 0=Mon, ... 5=Sat
    const todaysSchedule = student.class?.timetable
        .filter(t => t.day === Math.max(0, today))
        .sort((a, b) => a.period_no - b.period_no) || [];

    const stats = [
        { label: 'Attendance', value: `${attendanceRate}%`, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Unpaid Fees', value: student.fee_invoices.length, icon: CreditCard, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'GPA Equivalent', value: '3.8', icon: Trophy, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header / Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-indigo-50 ring-8 ring-indigo-50/30">
                        {student.photo_url ? (
                            <img src={student.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-black italic">
                                {student.first_name[0]}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white italic">{student.first_name} {student.last_name}</h1>
                        <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                            Class {student.class?.name}-{student.class?.section}
                        </span>
                    </div>
                    <p className="text-gray-400 font-bold mb-6 tracking-wide uppercase text-xs">Admission ID: {student.admission_no} • Roll: {student.roll_no || 'N/A'}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3 text-sm font-bold text-gray-500">
                            <MapPin size={16} className="text-indigo-400" />
                            <span className="truncate">{student.address || 'No Address Data'}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm font-bold text-gray-500">
                            <Phone size={16} className="text-indigo-400" />
                            <span>{student.phone || 'No Phone Data'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-[38px] border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:scale-105">
                        <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl w-fit mb-6 shadow-sm`}>
                            <stat.icon size={24} />
                        </div>
                        <h3 className="text-4xl font-black mb-1">{stat.value}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timetable / Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-2xl font-black italic">Today's Lectures</h2>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Full Week View</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {todaysSchedule.length === 0 ? (
                            <div className="col-span-full py-16 bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                                <Clock className="mx-auto text-gray-300 mb-4" size={40} />
                                <p className="text-gray-400 font-bold tracking-tight">No lectures scheduled for today.</p>
                            </div>
                        ) : todaysSchedule.map((period, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-all flex items-center space-x-6 group">
                                <div className="text-center min-w-[60px]">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase">Per {period.period_no}</p>
                                    <p className="text-sm font-black text-gray-300 group-hover:text-indigo-300 transition">{period.start_time}</p>
                                </div>
                                <div className="h-10 w-px bg-gray-100 dark:bg-gray-700"></div>
                                <div>
                                    <h4 className="font-black text-lg group-hover:text-indigo-600 transition tracking-tight">{period.subject.name}</h4>
                                    <p className="text-xs font-bold text-gray-400">by {period.staff?.first_name || 'TBD'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Exams / Results */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black italic px-2">Performance</h2>
                    <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none">
                        <TrendingUp size={80} className="absolute -bottom-4 -right-4 opacity-10" />
                        <h3 className="text-xl font-black mb-6 italic">Recent Grades</h3>
                        <div className="space-y-4">
                            {student.exam_results.length === 0 ? (
                                <p className="text-sm font-bold opacity-60">No exam results available yet.</p>
                            ) : student.exam_results.map((res, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                    <div>
                                        <p className="text-[10px] font-black uppercase opacity-60">{res.exam.name}</p>
                                        <p className="font-bold text-sm">{res.subject.name}</p>
                                    </div>
                                    <div className="bg-white text-indigo-600 px-4 py-1.5 rounded-xl font-black text-sm">
                                        {res.grade}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
