import api from './axios';

// Dashboard stats
export const getSuperAdminDashboardStats = () => api.get('/superadmin/dashboard/stats');

// Institutions
export const getInstitutions = (params) => api.get('/superadmin/institutions', { params });
export const createInstitution = (data) => api.post('/superadmin/institutions', data);
export const updateInstitution = (id, data) => api.put(`/superadmin/institutions/${id}`, data);
export const deleteInstitution = (id) => api.delete(`/superadmin/institutions/${id}`);
export const assignAdmin = (institutionId, data) => api.post(`/superadmin/institutions/${institutionId}/admin`, data);
