import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';

// Debug pages
import SupabaseDebugPage from '../pages/SupabaseDebug';

// SuperAdmin pages
import SuperAdminDashboard from '../pages/superadmin/Dashboard';
import Institutions from '../pages/superadmin/Institutions';
import SuperAdminSettings from '../pages/superadmin/Settings';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';
import StudentList from '../pages/admin/students/StudentList';
import StudentDetail from '../pages/admin/students/StudentDetail';
import AddStudent from '../pages/admin/students/AddStudent';
import MarkAttendance from '../pages/admin/attendance/MarkAttendance';
import AttendanceReport from '../pages/admin/attendance/AttendanceReport';
import FeeOverview from '../pages/admin/fees/FeeOverview';
import FeeStructure from '../pages/admin/fees/FeeStructure';
import FeeInvoices from '../pages/admin/fees/FeeInvoices';
import CollectFee from '../pages/admin/fees/CollectFee';
import PendingDues from '../pages/admin/fees/PendingDues';
import FeeReport from '../pages/admin/fees/FeeReport';
import Reports from '../pages/admin/reports/Reports';
import AcademicSetup from '../pages/admin/academic/AcademicSetup';
import TimetableBuilder from '../pages/admin/academic/TimetableBuilder';
import ExamManagement from '../pages/admin/academic/ExamManagement';
import MarksEntry from '../pages/admin/academic/MarksEntry';

// HR pages
import Staff from '../pages/hr/Staff';
import Leave from '../pages/hr/Leave';
import Payroll from '../pages/hr/Payroll';

// Accountant pages
import AccountantDashboard from '../pages/accountant/Dashboard';
import Expenses from '../pages/accountant/Expenses';

// Student pages
import StudentPortalDashboard from '../pages/student/Dashboard';

// Teacher pages
import TeacherDashboard from '../pages/teacher/Dashboard';

// Layout
import AppLayout from '../components/layout/AppLayout';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/supabase-debug" element={<SupabaseDebugPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

                {/* SuperAdmin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['SUPERADMIN']} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                        <Route path="/superadmin/institutions" element={<Institutions />} />
                        <Route path="/superadmin/settings" element={<SuperAdminSettings />} />
                    </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/reports" element={<Reports />} />
                        <Route path="/admin/academic" element={<AcademicSetup />} />
                        <Route path="/admin/students" element={<StudentList />} />
                        <Route path="/admin/students/new" element={<AddStudent />} />
                        <Route path="/admin/students/:id" element={<StudentDetail />} />
                        <Route path="/admin/attendance" element={<MarkAttendance />} />
                        <Route path="/admin/attendance/report" element={<AttendanceReport />} />
                        <Route path="/admin/timetable" element={<TimetableBuilder />} />
                        <Route path="/admin/exams" element={<ExamManagement />} />
                        <Route path="/admin/exams/marks" element={<MarksEntry />} />
                        <Route path="/admin/fees" element={<FeeOverview />} />
                        <Route path="/admin/fees/structures" element={<FeeStructure />} />
                        <Route path="/admin/fees/invoices" element={<FeeInvoices />} />
                        <Route path="/admin/fees/pending" element={<PendingDues />} />
                        <Route path="/admin/fees/collect" element={<CollectFee />} />
                        <Route path="/admin/fees/report" element={<FeeReport />} />
                        <Route path="/admin/staff" element={<Staff />} />
                        <Route path="/admin/leave" element={<Leave />} />
                        <Route path="/admin/payroll" element={<Payroll />} />
                    </Route>
                </Route>

                {/* Teacher Routes */}
                <Route element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN', 'SUPERADMIN']} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                        <Route path="/teacher/attendance" element={<div>Teacher Attendance</div>} />
                        <Route path="/teacher/classes" element={<div>My Classes</div>} />
                        <Route path="/teacher/homework" element={<div>Homework</div>} />
                        <Route path="/teacher/marks" element={<div>Mark Entry</div>} />
                    </Route>
                </Route>

                {/* Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/student/dashboard" element={<StudentPortalDashboard />} />
                    </Route>
                </Route>

                {/* Accountant Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ACCOUNTANT', 'ADMIN', 'SUPERADMIN']} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
                        <Route path="/accountant/collect" element={<CollectFee />} />
                        <Route path="/accountant/pending" element={<PendingDues />} />
                        <Route path="/accountant/reports" element={<FeeReport />} />
                        <Route path="/accountant/expenses" element={<Expenses />} />
                    </Route>
                </Route>

                {/* HR Routes */}
                <Route element={<ProtectedRoute allowedRoles={['HR', 'ADMIN', 'SUPERADMIN']} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/hr/dashboard" element={<div>HR Dashboard</div>} />
                        <Route path="/hr/staff" element={<Staff />} />
                        <Route path="/hr/attendance" element={<div>Staff Attendance</div>} />
                        <Route path="/hr/leave" element={<Leave />} />
                        <Route path="/hr/payroll" element={<Payroll />} />
                    </Route>
                </Route>

                {/* Receptionist Routes */}
                <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN', 'SUPERADMIN']} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/reception/dashboard" element={<div>Reception Dashboard</div>} />
                        <Route path="/reception/inquiries" element={<div>Admission Inquiries</div>} />
                        <Route path="/reception/gate" element={<div>Gate Management</div>} />
                    </Route>
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
