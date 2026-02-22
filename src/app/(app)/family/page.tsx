'use client';

import { useFamily } from '@/hooks/use-family';
import { ChildCard } from '@/components/family/child-card';
import { AddChildDialog } from '@/components/family/add-child-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function FamilyPage() {
  const { data, isLoading } = useFamily();
  const family = data?.family;
  const children = family?.children ?? [];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Loading family...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{family?.familyName}</h1>
          <p className='text-muted-foreground'>
            Manage your family members and their settings
          </p>
        </div>
        <AddChildDialog />
      </div>

      {children.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No children yet</CardTitle>
            <CardDescription>
              Add your first child to start their learning journey. Children
              don&apos;t need their own account - they log in through your
              family profile.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}
    </div>
  );
}
