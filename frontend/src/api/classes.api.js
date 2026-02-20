import api from './axios';

export const getClasses = () => api.get('/classes');
export const createClass = (data) => api.post('/classes', data);
