import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from '@/components/common/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          1000 * 60 * 2,   // 2 minutes
      gcTime:             1000 * 60 * 10,  // 10 minutes
      retry:              2,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

