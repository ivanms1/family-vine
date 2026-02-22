'use client';

import { LogOut, User } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export function UserNav() {
  const { data } = useCurrentUser();
  const logout = useLogout();

  const user = data?.user;

  return (
    <div className='flex items-center gap-2'>
      {user && (
        <span className='hidden text-sm text-muted-foreground sm:inline'>
          {user.displayName}
        </span>
      )}
      <Button
        variant='ghost'
        size='icon'
        onClick={() => logout.mutate()}
        title='Sign out'
      >
        <LogOut className='h-4 w-4' />
      </Button>
    </div>
  );
}
