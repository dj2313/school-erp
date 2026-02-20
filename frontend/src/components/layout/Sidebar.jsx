import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    Settings,
    Users,
    UserCheck,
    CalendarCheck,
    IndianRupee,
    ClipboardList,
    Clock,
    Bell,
    BarChart2,
    BookOpen,
    FileText,
    PenLine,
    Wallet,
    AlertCircle,
    Receipt,
    CalendarX,
    MessageSquare,
    DoorOpen,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { menus } from '../../config/sidebarMenu';

const iconMap = {
    LayoutDashboard,
    Building2,
    CreditCard,
    Settings,
    Users,
    UserCheck,
    CalendarCheck,
    IndianRupee,
    ClipboardList,
    Clock,
    Bell,
    BarChart2,
    BookOpen,
    FileText,
    PenLine,
    Wallet,
    AlertCircle,
    Receipt,
    CalendarX,
    MessageSquare,
    DoorOpen,
};

const Sidebar = () => {
    const { user, logout } = useAuthStore();
    const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
    const navigate = useNavigate();

    const menuItems = user?.role ? (menus[user.role] || []) : [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!sidebarOpen) return null;

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg z-40 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                {!sidebarCollapsed && (
                    <div className="flex items-center gap-2">
                        <GraduationCap className="text-blue-600" size={24} />
                        <span className="font-bold text-lg text-gray-800 dark:text-white">School ERP</span>
                    </div>
                )}
                {sidebarCollapsed && <GraduationCap className="text-blue-600 mx-auto" size={24} />}
                <button
                    onClick={toggleSidebarCollapse}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                >
                    {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-2">
                {menuItems.map((item) => {
                    const Icon = iconMap[item.icon];
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`
                            }
                        >
                            {Icon && <Icon size={20} />}
                            {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                {!sidebarCollapsed && user && (
                    <div className="px-3 py-2 mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.name}</p>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{user.role}</p>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={20} />
                    {!sidebarCollapsed && <span className="text-sm">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
