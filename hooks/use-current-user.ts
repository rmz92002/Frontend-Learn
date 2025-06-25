import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/api';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: ({ signal }) => getCurrentUser(signal),
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: false,
  });
}
