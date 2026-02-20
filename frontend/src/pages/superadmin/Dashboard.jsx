import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building2, Users, DollarSign, UserCheck, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSuperAdminDashboardStats } from '../../api/superadmin.api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4" style={{ borderColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        {trend && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            <TrendingUp size={12} className="inline mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['superadmin-stats'],
    queryFn: getSuperAdminDashboardStats,
  });

  if (error) toast.error(error.response?.data?.message || 'Failed to load dashboard');

  const stats = data?.data?.stats || {};
  const subscriptions = data?.data?.subscriptions || [];
  const recentInstitutions = data?.data?.recentInstitutions || [];
  const monthlyGrowth = data?.data?.monthlyGrowth || [];

  // Prepare subscription chart data
  const subscriptionData = subscriptions.map(sub => ({
    name: sub.subscription.charAt(0).toUpperCase() + sub.subscription.slice(1),
    value: sub._count,
  }));

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to your School ERP platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Total Institutions"
          value={stats.totalInstitutions}
          color="#3b82f6"
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          color="#10b981"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={stats.activeUsers}
          color="#f59e0b"
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={formatCurrency(stats.revenue)}
          color="#ef4444"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Growth */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Institutions Growth (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Subscription Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {subscriptionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Institutions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Institutions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentInstitutions.map(inst => (
                <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {inst.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {inst.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {inst.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      inst.subscription === 'enterprise'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : inst.subscription === 'pro'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {inst.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {inst._count.users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(inst.created_at, 'dd MMM yyyy')}
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

export default SuperAdminDashboard;
