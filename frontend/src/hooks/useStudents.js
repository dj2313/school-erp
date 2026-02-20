import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudents, getStudent, createStudent, updateStudent, deleteStudent } from '../api/students.api';
import toast from 'react-hot-toast';

export const useStudents = (params) => {
    return useQuery({
        queryKey: ['students', params],
        queryFn: () => getStudents(params).then((r) => r.data),
    });
};

export const useStudent = (id) => {
    return useQuery({
        queryKey: ['students', id],
        queryFn: () => getStudent(id).then((r) => r.data),
        enabled: !!id,
    });
};

export const useCreateStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success('Student added successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to add student'),
    });
};

export const useUpdateStudent = (id) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => updateStudent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success('Student updated successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update student'),
    });
};

export const useDeleteStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success('Student removed successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove student'),
    });
};
