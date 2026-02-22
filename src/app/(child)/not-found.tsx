import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ChildNotFound() {
  return (
    <div className='flex flex-col items-center justify-center py-16'>
      <h2 className='text-2xl font-bold'>Page Not Found</h2>
      <p className='mt-2 text-muted-foreground'>
        Oops! This page doesn&apos;t exist.
      </p>
      <Button asChild className='mt-4'>
        <Link href='/learn'>Back to Learn</Link>
      </Button>
    </div>
  );
}
