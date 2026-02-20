import api from './axios';

export const generatePayroll = (data) => api.post('/payroll/generate', data);
export const getPayslips = (month, year) => api.get('/payroll/payslips', { params: { month, year } });
export const markPayslipAsPaid = (id, data) => api.put(`/payroll/payslips/${id}/pay`, data);
