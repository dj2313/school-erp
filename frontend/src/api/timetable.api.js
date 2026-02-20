import api from './axios';

export const getTimetableByClass = (classId) => api.get(`/timetable/class/${classId}`);
export const upsertTimetableEntry = (data) => api.post('/timetable', data);
export const deleteTimetableEntry = (id) => api.delete(`/timetable/${id}`);
