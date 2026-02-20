import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendance, markAttendance, updateAttendance, getAttendanceReport } from '../api/attendance.api';
import toast from 'react-hot-toast';

export const useAttendance = (params) => {
    return useQuery({
        queryKey: ['attendance', params],
        queryFn: () => getAttendance(params).then((r) => r.data),
        enabled: !!(params?.class_id && params?.date),
    });
};

export const useAttendanceReport = (params) => {
    return useQuery({
        queryKey: ['attendance-report', params],
        queryFn: () => getAttendanceReport(params).then((r) => r.data),
        enabled: !!(params?.month && params?.year),
    });
};

export const useMarkAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Attendance marked successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark attendance'),
    });
};

export const useUpdateAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateAttendance(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast.success('Attendance updated');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update attendance'),
    });
};
