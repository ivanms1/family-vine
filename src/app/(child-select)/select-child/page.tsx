'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useFamily } from '@/hooks/use-family';
import { ChildSelectCard } from '@/components/auth/child-select-card';
import { Button } from '@/components/ui/button';

export default function SelectChildPage() {
  const { data, isLoading } = useFamily();
  const children = data?.family?.children ?? [];

  if (isLoading) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>Loading family...</p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>Who&apos;s Learning Today?</h1>
        <p className='mt-2 text-muted-foreground'>
          Select a child profile to start their learning session
        </p>
      </div>

      {children.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>
            No children added yet. Go to Family settings to add a child.
          </p>
          <Button asChild className='mt-4'>
            <Link href='/family'>Manage Family</Link>
          </Button>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {children.map((child) => (
            <ChildSelectCard key={child.id} child={child} />
          ))}
        </div>
      )}

      <div className='text-center'>
        <Button variant='ghost' asChild>
          <Link href='/dashboard'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
