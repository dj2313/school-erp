import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeeStructures, getFeeInvoices, collectFee, getPendingFees, getFeeReport } from '../api/fees.api';
import toast from 'react-hot-toast';

export const useFeeStructures = () => {
    return useQuery({
        queryKey: ['fee-structures'],
        queryFn: () => getFeeStructures().then((r) => r.data),
    });
};

export const useFeeInvoices = (params) => {
    return useQuery({
        queryKey: ['fee-invoices', params],
        queryFn: () => getFeeInvoices(params).then((r) => r.data),
    });
};

export const usePendingFees = (params) => {
    return useQuery({
        queryKey: ['pending-fees', params],
        queryFn: () => getPendingFees(params).then((r) => r.data),
    });
};

export const useFeeReport = (params) => {
    return useQuery({
        queryKey: ['fee-report', params],
        queryFn: () => getFeeReport(params).then((r) => r.data),
        enabled: !!(params?.start_date && params?.end_date),
    });
};

export const useCollectFee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: collectFee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fee-invoices'] });
            queryClient.invalidateQueries({ queryKey: ['pending-fees'] });
            toast.success('Fee collected successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to collect fee'),
    });
};
