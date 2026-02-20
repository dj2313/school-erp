// Placeholder page components — full implementation in Phase 1 & 2

// ── AUTH ──────────────────────────────────
export { default as LoginPage } from './auth/LoginPage';

// ── SUPERADMIN ───────────────────────────
export { default as SuperAdminDashboard } from './superadmin/Dashboard';
export { default as Institutions } from './superadmin/Institutions';
export { default as SuperAdminSettings } from './superadmin/Settings';

// ── ADMIN ─────────────────────────────────
export { default as AdminDashboard } from './admin/Dashboard';
export { default as StudentList } from './admin/students/StudentList';
export { default as StudentDetail } from './admin/students/StudentDetail';
export { default as AddStudent } from './admin/students/AddStudent';
export { default as MarkAttendance } from './admin/attendance/MarkAttendance';
export { default as AttendanceReport } from './admin/attendance/AttendanceReport';
export { default as FeeOverview } from './admin/fees/FeeOverview';
export { default as FeeStructure } from './admin/fees/FeeStructure';
export { default as FeeInvoices } from './admin/fees/FeeInvoices';
export { default as CollectFee } from './admin/fees/CollectFee';
export { default as FeeReport } from './admin/fees/FeeReport';
