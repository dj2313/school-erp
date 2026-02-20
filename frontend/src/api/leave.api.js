import api from './axios';

export const getLeaves = (params) => api.get('/leaves', { params });
export const applyLeave = (data) => api.post('/leaves/apply', data);
export const updateLeaveStatus = (id, data) => api.put(`/leaves/${id}/status`, data);
