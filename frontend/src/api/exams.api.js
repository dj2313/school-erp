import api from './axios';

export const getExams = (params) => api.get('/exams', { params });
export const createExam = (data) => api.post('/exams', data);
export const enterResults = (examId, data) => api.post(`/exams/${examId}/results`, data);
export const getResults = (examId, params) => api.get(`/exams/${examId}/results`, { params });
export const getReportCard = (examId, params) => api.get(`/exams/${examId}/report`, { params });
