import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass rounded-xl text-sm font-medium',
          duration: 3000,
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
