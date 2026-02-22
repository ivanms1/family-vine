'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyApi } from '@/api/family';
import { familyQueries } from '@/queries/family';
import { QUERY_KEYS } from '@/queries/keys';
import type { AddChildInput, UpdateChildInput } from '@/types/family';

export function useFamily() {
  return useQuery(familyQueries.family());
}

export function useChild(childId: string) {
  return useQuery(familyQueries.child(childId));
}

export function useAddChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddChildInput) => familyApi.addChild(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAMILY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTH] });
    },
  });
}

export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      childId,
      input,
    }: {
      childId: string;
      input: UpdateChildInput;
    }) => familyApi.updateChild(childId, input),
    onSuccess: (_, { childId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAMILY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CHILDREN, childId],
      });
    },
  });
}

export function useDeleteChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (childId: string) => familyApi.deleteChild(childId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAMILY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTH] });
    },
  });
}

export function useSetChildPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, pin }: { childId: string; pin: string }) =>
      familyApi.setChildPin(childId, { pin }),
    onSuccess: (_, { childId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAMILY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CHILDREN, childId],
      });
    },
  });
}

export function useRemoveChildPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (childId: string) => familyApi.removeChildPin(childId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAMILY] });
    },
  });
}
