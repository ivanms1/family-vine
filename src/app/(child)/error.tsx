'use client';

import { ErrorFallback } from '@/components/common/error-boundary';

export default function ChildError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback error={error} reset={reset} />;
}
