import { QueryClient } from '@tanstack/react-query';

export const mobileQueryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});
