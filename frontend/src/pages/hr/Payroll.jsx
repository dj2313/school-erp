import usePDF from '../../hooks/usePDF';
import { downloadPayslipPDF } from '../../api/reports.api';

const Payroll = () => {
    const queryClient = useQueryClient();
    const { downloadPDF } = usePDF();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const { data: payrollData, isLoading } = useQuery({
        queryKey: ['payroll', month, year],
        queryFn: () => getPayslips(month, year),
    });

    const payslips = payrollData?.data || [];

    const generateMutation = useMutation({
        mutationFn: () => generatePayroll({ month, year }),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['payroll']);
            toast.success(res.data.message);
        },
    });

    const payMutation = useMutation({
        mutationFn: ({ id }) => markPayslipAsPaid(id, { payment_mode: 'bank_transfer' }),
        onSuccess: () => {
            queryClient.invalidateQueries(['payroll']);
            toast.success('Salary marked as paid!');
        },
    });

    const handleDownloadPayslip = (p) => {
        downloadPDF(downloadPayslipPDF(p.id), `Payslip_${p.staff.employee_code}.pdf`);
    };

    const totalPayout = payslips.reduce((sum, p) => sum + p.net_salary, 0);
    const paidCount = payslips.filter(p => p.is_paid).length;

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Payroll Processing</h1>
                    <p className="text-sm text-gray-500">Calculate salaries and manage payslips for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}.</p>
                </div>

                <div className="flex items-center bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <button onClick={() => setMonth(m => m === 1 ? 12 : m - 1)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft size={20} /></button>
                    <div className="px-4 font-bold min-w-[120px] text-center">
                        {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
                    </div>
                    <button onClick={() => setMonth(m => m === 12 ? 1 : m + 1)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <Wallet className="mb-4 opacity-80" size={32} />
                        <h3 className="text-xs font-bold uppercase tracking-widest opacity-80">Total Net Payout</h3>
                        <p className="text-3xl font-black mt-1">₹{totalPayout.toLocaleString()}</p>
                        <button
                            disabled={generateMutation.isLoading}
                            onClick={() => generateMutation.mutate()}
                            className="w-full mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-md py-3 rounded-2xl font-bold text-sm transition flex items-center justify-center space-x-2 border border-white/30"
                        >
                            <Calculator size={18} />
                            <span>{generateMutation.isLoading ? 'Calculating...' : 'Recalculate Payroll'}</span>
                        </button>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition duration-500"></div>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <span className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20} /></span>
                        </div>
                        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Salary Paid</h4>
                        <p className="text-2xl font-black mt-1">{paidCount} / {payslips.length} Staff</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={20} /></span>
                        </div>
                        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Working Days</h4>
                        <p className="text-2xl font-black mt-1">30 Days</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <span className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></span>
                        </div>
                        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Leaves Deducted</h4>
                        <p className="text-2xl font-black mt-1">{payslips.reduce((sum, p) => sum + p.leaves_taken, 0)} Total</p>
                    </div>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-black">Payslips Directory</h3>
                    <div className="flex space-x-2">
                        <button className="flex items-center space-x-2 px-4 py-2 border border-blue-100 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition">
                            <Download size={18} />
                            <span>Export All</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                            <tr className="text-left">
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Staff Details</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Basic Salary</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Leaves / Attendance</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Net Payable</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan="6" className="py-20 text-center text-gray-400 italic font-medium tracking-widest">Compiling payslips...</td></tr>
                            ) : payslips.length === 0 ? (
                                <tr><td colSpan="6" className="py-20 text-center text-gray-400 italic">No payroll generated for this month yet.</td></tr>
                            ) : payslips.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-300">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center font-black text-gray-400">
                                                {p.staff.first_name[0]}{p.staff.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white leading-tight">{p.staff.first_name} {p.staff.last_name}</p>
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter mt-1">{p.staff.employee_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-medium text-gray-600 dark:text-gray-400">
                                        ₹{p.basic_salary.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{p.present_days} / 30 Present</span>
                                            <span className="text-[10px] text-red-500 font-bold uppercase">-{p.leaves_taken} Excl. Leave</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-black text-lg text-indigo-600">
                                        ₹{p.net_salary.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.is_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {p.is_paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center space-x-2">
                                            {!p.is_paid && (
                                                <button
                                                    onClick={() => payMutation.mutate({ id: p.id })}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none"
                                                >
                                                    Mark as Paid
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDownloadPayslip(p)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 transition"
                                                title="Download PDF"
                                            >
                                                <Receipt size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payroll;
