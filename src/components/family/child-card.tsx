'use client';

import Link from 'next/link';
import { Coins, Lock, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ChildProfile } from '@/types/family';

export function ChildCard({ child }: { child: ChildProfile }) {
  const initials = child.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/family/${child.id}`}>
      <Card className='transition-colors hover:bg-accent/50'>
        <CardHeader className='flex flex-row items-center gap-4 pb-2'>
          <Avatar className='h-12 w-12'>
            <AvatarImage src={child.avatarUrl ?? undefined} />
            <AvatarFallback className='bg-primary/10 text-primary'>
              {initials || <User className='h-5 w-5' />}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <CardTitle className='text-base'>{child.displayName}</CardTitle>
            <div className='flex items-center gap-2 mt-1'>
              {child.hasPin && (
                <Badge variant='outline' className='text-xs gap-1'>
                  <Lock className='h-3 w-3' />
                  PIN
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-1 text-sm text-muted-foreground'>
            <Coins className='h-4 w-4' />
            <span>{child.tokenBalance} tokens</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
