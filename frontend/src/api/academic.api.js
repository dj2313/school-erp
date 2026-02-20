import api from './axios';

// Classes
export const getClasses = () => api.get('/academic/classes');
export const createClass = (data) => api.post('/academic/classes', data);
export const updateClass = (id, data) => api.put(`/academic/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/academic/classes/${id}`);

// Subjects
export const getSubjects = () => api.get('/academic/subjects');
export const createSubject = (data) => api.post('/academic/subjects', data);
export const assignSubjectToClass = (data) => api.post('/academic/subjects/assign', data);

// Academic Years
export const getAcademicYears = () => api.get('/academic/years');
export const createAcademicYear = (data) => api.post('/academic/years', data);
