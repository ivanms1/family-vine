'use client';

import { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useChildLogin } from '@/hooks/use-child-session';
import { toast } from 'sonner';
import type { ChildProfile } from '@/types/family';

export function ChildSelectCard({ child }: { child: ChildProfile }) {
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const childLogin = useChildLogin();

  const initials = child.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  function handleSelect() {
    if (child.hasPin) {
      setShowPin(true);
      return;
    }
    childLogin.mutate(
      { childProfileId: child.id },
      {
        onError: (error) => {
          toast.error(error.message || 'Failed to start child session');
        },
      }
    );
  }

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    childLogin.mutate(
      { childProfileId: child.id, pin },
      {
        onError: (error) => {
          toast.error(error.message || 'Invalid PIN');
          setPin('');
        },
      }
    );
  }

  return (
    <Card className='transition-colors hover:bg-accent/50'>
      <CardContent className='flex flex-col items-center gap-4 p-6'>
        <Avatar className='h-20 w-20'>
          <AvatarImage src={child.avatarUrl ?? undefined} />
          <AvatarFallback className='bg-primary/10 text-primary text-2xl'>
            {initials || <User className='h-8 w-8' />}
          </AvatarFallback>
        </Avatar>
        <h3 className='text-lg font-semibold'>{child.displayName}</h3>

        {showPin ? (
          <form onSubmit={handlePinSubmit} className='flex flex-col gap-2 w-full'>
            <div className='flex items-center gap-2'>
              <Lock className='h-4 w-4 text-muted-foreground' />
              <Input
                type='text'
                inputMode='numeric'
                maxLength={4}
                placeholder='Enter PIN'
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className='text-center text-lg tracking-widest'
                autoFocus
              />
            </div>
            <Button
              type='submit'
              disabled={pin.length !== 4 || childLogin.isPending}
              className='w-full'
            >
              {childLogin.isPending ? 'Starting...' : 'Go!'}
            </Button>
          </form>
        ) : (
          <Button
            onClick={handleSelect}
            className='w-full'
            disabled={childLogin.isPending}
          >
            {child.hasPin && <Lock className='mr-2 h-4 w-4' />}
            {childLogin.isPending ? 'Starting...' : 'Start Learning'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
