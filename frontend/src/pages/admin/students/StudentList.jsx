import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Search, Plus, Download, Upload, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getStudents,
    deleteStudent,
    bulkImportStudents,
} from '../../../api/students.api';
import { getClasses } from '../../../api/classes.api';

const StudentList = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const [search, setSearch] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Fetch classes for filter
    const { data: classesData } = useQuery({
        queryKey: ['classes'],
        queryFn: getClasses,
    });
    const classes = classesData?.data || [];

    // Fetch students
    const { data, isLoading } = useQuery({
        queryKey: ['students', search, classFilter, statusFilter, pagination],
        queryFn: () =>
            getStudents({
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                search,
                class_id: classFilter,
                section: sectionFilter,
                status: statusFilter,
            }),
    });

    const students = data?.data?.data || [];
    const pageCount = data?.data?.pagination?.pages || 1;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            toast.success('Student deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
    });

    // Bulk import mutation
    const importMutation = useMutation({
        mutationFn: bulkImportStudents,
        onSuccess: (res) => {
            toast.success(`${res.data.created} students imported successfully`);
            if (res.data.errors) {
                toast.error(`${res.data.errors.length} errors occurred`);
            }
            queryClient.invalidateQueries({ queryKey: ['students'] });
            fileInputRef.current.value = '';
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Import failed'),
    });

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            importMutation.mutate(file);
        }
    };

    const handleExportCSV = () => {
        if (students.length === 0) {
            toast.error('No students to export');
            return;
        }

        const headers = [
            'ID',
            'First Name',
            'Last Name',
            'Admission No',
            'Roll No',
            'Class',
            'Section',
            'Parent Phone',
            'Status',
        ];

        const rows = students.map(s => [
            s.id,
            s.first_name,
            s.last_name,
            s.admission_no,
            s.roll_no || '',
            s.class?.name || '',
            s.class?.section || '',
            s.father_phone || s.mother_phone || '',
            s.is_active ? 'Active' : 'Inactive',
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('File downloaded successfully');
    };

    // Table columns
    const columns = [
        {
            accessorKey: 'photo_url',
            header: 'Photo',
            cell: (info) => (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {info.row.original.first_name[0]}
                </div>
            ),
        },
        {
            accessorKey: 'first_name',
            header: 'Name',
            cell: (info) => (
                <div className="font-medium text-gray-900 dark:text-white">
                    {info.row.original.first_name} {info.row.original.last_name}
                </div>
            ),
        },
        {
            accessorKey: 'admission_no',
            header: 'Admission No',
            cell: (info) => <span className="text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
        },
        {
            accessorKey: 'class.name',
            header: 'Class',
            cell: (info) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {info.row.original.class?.name || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'father_phone',
            header: 'Parent Phone',
            cell: (info) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {info.getValue() || info.row.original.mother_phone || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: (info) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue()
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                >
                    {info.getValue() ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className="flex gap-2">
                    <Link
                        to={`/admin/students/${info.row.original.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View"
                    >
                        <Eye size={16} />
                    </Link>
                    <button
                        onClick={() => navigate(`/admin/students/${info.row.original.id}`)}
                        className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(info.row.original.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: students,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        pageCount,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all students in your institution</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                    >
                        <Upload size={18} />
                        Import CSV
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                    <button
                        onClick={() => navigate('/admin/students/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add Student
                    </button>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImport}
                className="hidden"
            />

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
                <div className="flex gap-4 flex-wrap">
                    {/* Search */}
                    <div className="flex-1 min-w-64 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or admission number..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPagination({ ...pagination, pageIndex: 0 });
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Class Filter */}
                    <select
                        value={classFilter}
                        onChange={(e) => {
                            setClassFilter(e.target.value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Classes</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} {c.section ? `(${c.section})` : ''}
                            </option>
                        ))}
                    </select>

                    {/* Section Filter */}
                    <select
                        value={sectionFilter}
                        onChange={(e) => {
                            setSectionFilter(e.target.value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Sections</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No students found
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {pagination.pageIndex + 1} of {pageCount} | Total: {data?.data?.pagination?.total || 0} students
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
                            disabled={pagination.pageIndex === 0}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
                            disabled={pagination.pageIndex >= pageCount - 1}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentList;
