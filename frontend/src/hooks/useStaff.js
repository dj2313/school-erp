import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStaff, getStaffMember, createStaff, updateStaff, getLeaves, applyLeave, updateLeave, getPayroll, generatePayroll } from '../api/staff.api';
import toast from 'react-hot-toast';

export const useStaff = (params) => {
    return useQuery({
        queryKey: ['staff', params],
        queryFn: () => getStaff(params).then((r) => r.data),
    });
};

export const useStaffMember = (id) => {
    return useQuery({
        queryKey: ['staff', id],
        queryFn: () => getStaffMember(id).then((r) => r.data),
        enabled: !!id,
    });
};

export const useCreateStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createStaff,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            toast.success('Staff member added successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to add staff'),
    });
};

export const useLeaves = (params) => {
    return useQuery({
        queryKey: ['leaves', params],
        queryFn: () => getLeaves(params).then((r) => r.data),
    });
};

export const useApplyLeave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: applyLeave,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Leave applied successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to apply leave'),
    });
};

export const usePayroll = (params) => {
    return useQuery({
        queryKey: ['payroll', params],
        queryFn: () => getPayroll(params).then((r) => r.data),
        enabled: !!(params?.month && params?.year),
    });
};

export const useGeneratePayroll = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: generatePayroll,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll'] });
            toast.success('Payroll generated successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to generate payroll'),
    });
};
