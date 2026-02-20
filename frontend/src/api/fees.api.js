import api from './axios';

export const getFeeStructures = () => api.get('/fees/structures');
export const createFeeStructure = (data) => api.post('/fees/structures', data);

export const getInvoices = (params) => api.get('/fees/invoices', { params });
export const generateInvoices = (data) => api.post('/fees/generate-invoices', data);

export const collectFee = (data) => api.post('/fees/collect', data);
export const getReceipt = (receiptNo) => api.get(`/fees/receipts/${receiptNo}`);

export const getPendingDues = () => api.get('/fees/pending-dues');
export const getFeeReport = (period) => api.get('/fees/report', { params: { period } });
