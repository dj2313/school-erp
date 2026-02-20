import api from './axios';

export const getTeacherDashboard = () => api.get('/teacher/dashboard');
