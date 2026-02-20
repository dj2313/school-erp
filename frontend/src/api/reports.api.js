import api from './axios';

export const getAttendanceReport = (params) => api.get('/reports/attendance', { params });
export const getFeeCollectionReport = (params) => api.get('/reports/fees', { params });
export const getStudentStrengthReport = () => api.get('/reports/strength');
export const getPayrollReport = (params) => api.get('/reports/payroll', { params });

// PDF Downloads
export const downloadReceiptPDF = (receiptNo) => `${import.meta.env.VITE_API_URL}/reports/pdf/receipt/${receiptNo}`;
export const downloadPayslipPDF = (id) => `${import.meta.env.VITE_API_URL}/reports/pdf/payslip/${id}`;
export const downloadReportCardPDF = (studentId, examId) => `${import.meta.env.VITE_API_URL}/reports/pdf/report-card/${studentId}/${examId}`;
