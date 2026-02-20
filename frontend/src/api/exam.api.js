import api from './axios';

export const getExams = (params) => api.get('/exams', { params });
export const createExam = (data) => api.post('/exams', data);
export const bulkSubmitMarks = (data) => api.post('/exams/bulk-marks', data);
export const getExamResults = (params) => api.get('/exams/results', { params });
export const getReportCard = (examId, params) => api.get(`/exams/${examId}/report`, { params });
