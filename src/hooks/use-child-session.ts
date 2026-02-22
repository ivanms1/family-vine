'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { familyApi } from '@/api/family';
import { apiClient } from '@/lib/api-client';
import type { ChildLoginInput } from '@/types/family';

export function useChildLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: ChildLoginInput) => familyApi.childLogin(input),
    onSuccess: () => {
      router.push('/learn');
    },
  });
}

export function useExitChildMode() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () =>
      apiClient.post<{ success: boolean }>('/api/auth/exit-child'),
    onSuccess: () => {
      queryClient.clear();
      router.push('/dashboard');
    },
  });
}
