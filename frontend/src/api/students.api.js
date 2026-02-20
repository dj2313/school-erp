import api from './axios';

export const getStudents = (params) => api.get('/students', { params });
export const getStudentById = (id) => api.get(`/students/${id}`);
export const createStudent = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    return api.post('/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const updateStudent = (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    return api.put(`/students/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getStudentAttendance = (id) => api.get(`/students/${id}/attendance`);
export const getStudentFees = (id) => api.get(`/students/${id}/fees`);
export const getStudentResults = (id) => api.get(`/students/${id}/results`);
export const bulkImportStudents = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/students/import/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
