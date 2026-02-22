export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-12 gap-3'>
      <div className='h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary' />
      <p className='text-sm text-muted-foreground'>{message}</p>
    </div>
  );
}
