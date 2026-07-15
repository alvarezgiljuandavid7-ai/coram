import { QueryClient } from '@tanstack/react-query';

const MINUTE = 60 * 1000;

export const coramQueryKeys = {
  corarios: ['public', 'corarios'] as const,
  hymns: ['public', 'hymns', 'himnario-manantial-de-inspiracion'] as const,
  courses: ['public', 'courses'] as const,
  resources: ['public', 'resources'] as const,
  campaigns: ['public', 'campaigns'] as const,
  homeBanners: ['public', 'home-banners'] as const,
};

export function clearCoramQueryCache(queryClient: QueryClient) {
  queryClient.clear();
}

export function createCoramQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * MINUTE,
        gcTime: 30 * MINUTE,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
