import usePDF from '../../../hooks/usePDF';
import { downloadReceiptPDF } from '../../../api/reports.api';

const CollectFee = () => {
    const queryClient = useQueryClient();
    const { downloadPDF } = usePDF();
    const [search, setSearch] = useState('');
    // ... rest of state stays same ...
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        payment_mode: 'CASH',
        transaction_id: '',
        notes: ''
    });

    const { data: invoicesData, isLoading } = useQuery({
        queryKey: ['invoices', search],
        queryFn: () => getInvoices({ search }),
        enabled: search.length > 2
    });

    const collectMutation = useMutation({
        mutationFn: collectFee,
        onSuccess: (res) => {
            queryClient.invalidateQueries(['invoices']);
            toast.success('Payment Collected!');

            // Trigger Receipt PDF download
            const receiptNo = res.data.data.receipt_no;
            downloadPDF(downloadReceiptPDF(receiptNo), `Receipt_${receiptNo}.pdf`);

            setSelectedInvoice(null);
            setPaymentData({ amount: '', payment_mode: 'CASH', transaction_id: '', notes: '' });
        }
    });

    const invoices = invoicesData?.data || [];

    const handleCollect = (e) => {
        e.preventDefault();
        collectMutation.mutate({
            invoice_id: selectedInvoice.id,
            ...paymentData
        });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Collect Student Fees</h1>

            {/* Search Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search student by name or admission number..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-transparent focus:border-indigo-500 transition outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {search.length > 0 && search.length < 3 && (
                    <p className="mt-2 text-xs text-blue-500">Type at least 3 characters to search</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search Results */}
                <div className="lg:col-span-2 space-y-4">
                    {search.length >= 3 && invoices.length === 0 && !isLoading && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300">
                            <User className="mx-auto text-gray-300 mb-2" size={48} />
                            <p className="text-gray-500">No pending invoices found for this search</p>
                        </div>
                    )}

                    {invoices.map((inv) => (
                        <div
                            key={inv.id}
                            onClick={() => setSelectedInvoice(inv)}
                            className={`p-6 rounded-2xl border transition cursor-pointer ${selectedInvoice?.id === inv.id
                                ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20'
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-300'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex space-x-4">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold">
                                        {inv.student.first_name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{inv.student.first_name} {inv.student.last_name}</h3>
                                        <p className="text-sm text-gray-500">Adm: {inv.student.admission_no} | Class: {inv.student.class?.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-indigo-600">₹{inv.balance.toLocaleString()}</p>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${inv.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 flex space-x-4 text-xs text-gray-400">
                                <span className="flex items-center space-x-1"><Receipt size={14} /> <span>{inv.invoice_no}</span></span>
                                <span className="flex items-center space-x-1"><Clock size={14} /> <span>Due: {new Date(inv.due_date).toLocaleDateString()}</span></span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Collection Panel */}
                <div className="lg:col-span-1">
                    {selectedInvoice ? (
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-900/30 sticky top-6">
                            <h2 className="text-xl font-black mb-6 flex items-center space-x-2">
                                <CreditCard className="text-indigo-600" />
                                <span>Collect Payment</span>
                            </h2>

                            <form onSubmit={handleCollect} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Payment Amount (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-xl font-bold"
                                        value={paymentData.amount}
                                        placeholder={`Max ₹${selectedInvoice.balance}`}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Payment Mode</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl"
                                        value={paymentData.payment_mode}
                                        onChange={(e) => setPaymentData({ ...paymentData, payment_mode: e.target.value })}
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="UPI">UPI / QR</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="CHEQUE">Cheque</option>
                                    </select>
                                </div>

                                {paymentData.payment_mode !== 'CASH' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Transaction ID / Reference</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl"
                                            value={paymentData.transaction_id}
                                            onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm"
                                        rows="2"
                                        value={paymentData.notes}
                                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    disabled={collectMutation.isLoading}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
                                >
                                    <span>{collectMutation.isLoading ? 'Processing...' : 'Confirm Collection'}</span>
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-12 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                            <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Receipt size={32} />
                            </div>
                            <h3 className="font-bold text-gray-500">Pick an invoice to start collection</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectFee;
