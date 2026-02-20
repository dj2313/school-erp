import { create } from 'zustand';

const useUIStore = create((set) => ({
    sidebarOpen: true,
    sidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

export default useUIStore;
