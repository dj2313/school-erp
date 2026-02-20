import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search, Plus, Edit2, Trash2, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  assignAdmin,
} from '../../api/superadmin.api';
import { institutionSchema, assignAdminSchema } from '../../utils/validators';

// Modal Components
const InstitutionModal = ({ isOpen, onClose, onSubmit, defaultValues, isLoading, title }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(institutionSchema),
    defaultValues,
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Institution Name
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter institution name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code (Unique)
            </label>
            <input
              type="text"
              {...register('code')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., DEMO-001"
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <input
              type="text"
              {...register('city')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="school">School</option>
              <option value="college">College</option>
              <option value="coaching">Coaching</option>
            </select>
          </div>

          {/* Subscription */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subscription
            </label>
            <select
              {...register('subscription')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignAdminModal = ({ isOpen, onClose, institutionId, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(assignAdminSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Admin</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(data => onSubmit(data, institutionId))} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Name
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InstitutionsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [assignAdminState, setAssignAdminState] = useState({ open: false, institutionId: null });

  // Fetch institutions
  const { data, isLoading } = useQuery({
    queryKey: ['institutions', search, type, status, pagination],
    queryFn: () =>
      getInstitutions({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
        type,
        status,
      }),
  });

  const institutions = data?.data?.data || [];
  const pageCount = data?.data?.pagination?.pages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: createInstitution,
    onSuccess: () => {
      toast.success('Institution created successfully');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      setModalState({ type: null, data: null });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateInstitution(id, data),
    onSuccess: () => {
      toast.success('Institution updated successfully');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      setModalState({ type: null, data: null });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInstitution,
    onSuccess: () => {
      toast.success('Institution deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const assignAdminMutation = useMutation({
    mutationFn: ({ institutionId, data }) => assignAdmin(institutionId, data),
    onSuccess: () => {
      toast.success('Admin assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      setAssignAdminState({ open: false, institutionId: null });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to assign admin'),
  });

  const handleAddInstitution = (data) => {
    createMutation.mutate(data);
  };

  const handleUpdateInstitution = (data) => {
    if (modalState.data) {
      updateMutation.mutate({ id: modalState.data.id, data });
    }
  };

  const handleDeleteInstitution = (id) => {
    if (window.confirm('Are you sure you want to delete this institution? All associated users will be deleted.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssignAdmin = (data, institutionId) => {
    assignAdminMutation.mutate({ institutionId, data });
  };

  // Table columns
  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => (
        <div className="font-medium text-gray-900 dark:text-white">{info.getValue()}</div>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: (info) => <span className="text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: (info) => <span className="text-gray-600 dark:text-gray-400">{info.getValue() || '-'}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: (info) => (
        <span className="capitalize text-gray-600 dark:text-gray-400">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: 'subscription',
      header: 'Plan',
      cell: (info) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          info.getValue() === 'enterprise'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            : info.getValue() === 'pro'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: (info) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          info.getValue()
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex gap-2">
          <button
            onClick={() => setModalState({ type: 'edit', data: info.row.original })}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setAssignAdminState({ open: true, institutionId: info.row.original.id })}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Assign Admin"
          >
            <UserPlus size={16} />
          </button>
          <button
            onClick={() => handleDeleteInstitution(info.row.original.id)}
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
    data: institutions,
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Institutions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all institutions on the platform</p>
        </div>
        <button
          onClick={() => setModalState({ type: 'create', data: null })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Institution
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination({ ...pagination, pageIndex: 0 });
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="school">School</option>
            <option value="college">College</option>
            <option value="coaching">Coaching</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
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
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No institutions found
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
            Page {pagination.pageIndex + 1} of {pageCount}
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

      {/* Institution Modal */}
      <InstitutionModal
        isOpen={modalState.type === 'create' || modalState.type === 'edit'}
        onClose={() => setModalState({ type: null, data: null })}
        onSubmit={modalState.type === 'create' ? handleAddInstitution : handleUpdateInstitution}
        defaultValues={modalState.data || {}}
        isLoading={createMutation.isPending || updateMutation.isPending}
        title={modalState.type === 'create' ? 'Add Institution' : 'Edit Institution'}
      />

      {/* Assign Admin Modal */}
      <AssignAdminModal
        isOpen={assignAdminState.open}
        onClose={() => setAssignAdminState({ open: false, institutionId: null })}
        institutionId={assignAdminState.institutionId}
        onSubmit={handleAssignAdmin}
        isLoading={assignAdminMutation.isPending}
      />
    </div>
  );
};

export default InstitutionsPage;
