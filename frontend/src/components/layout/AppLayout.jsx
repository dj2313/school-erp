import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useUIStore from '../../store/uiStore';

const AppLayout = () => {
    const { sidebarOpen, sidebarCollapsed } = useUIStore();

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <div
                className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${sidebarOpen ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'
                    }`}
            >
                {/* Header */}
                <Header />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
