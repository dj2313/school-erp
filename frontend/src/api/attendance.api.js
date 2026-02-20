import api from './axios';

export const getAttendance = (params) => api.get('/attendance', { params });
export const markAttendance = (data) => api.post('/attendance', data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
export const getAttendanceReport = (params) => api.get('/attendance/report', { params });
