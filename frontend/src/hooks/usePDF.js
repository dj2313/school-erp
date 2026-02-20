import { useState } from 'react';
import toast from 'react-hot-toast';

const usePDF = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const downloadPDF = async (url, filename) => {
        setIsGenerating(true);
        const loadingToast = toast.loading('Generating PDF...');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename || 'document.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            toast.success('PDF downloaded successfully', { id: loadingToast });
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Error downloading PDF', { id: loadingToast });
        } finally {
            setIsGenerating(false);
        }
    };

    const openPDF = async (url) => {
        setIsGenerating(true);
        const loadingToast = toast.loading('Preparing PDF...');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to open PDF');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');

            toast.success('PDF opened in new tab', { id: loadingToast });
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Error opening PDF', { id: loadingToast });
        } finally {
            setIsGenerating(false);
        }
    };

    return { downloadPDF, openPDF, isGenerating };
};

export default usePDF;
