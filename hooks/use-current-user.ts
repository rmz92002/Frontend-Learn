import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/api';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: ({ signal }) => getCurrentUser(signal),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 1 day
    retry: false,
  });
}
