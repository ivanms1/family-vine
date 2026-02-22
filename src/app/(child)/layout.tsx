'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Award, Trophy, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useExitChildMode } from '@/hooks/use-child-session';

const navItems = [
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/my-rewards', label: 'My Rewards', icon: Award },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
];

export default function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const exitChild = useExitChildMode();

  return (
    <div className='min-h-screen bg-gradient-to-b from-primary/5 to-background'>
      <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur'>
        <div className='container mx-auto flex h-14 max-w-5xl items-center px-4'>
          <Link
            href='/learn'
            className='mr-6 text-lg font-bold text-primary'
          >
            FamilyVine
          </Link>

          <nav className='flex items-center gap-1'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className='h-4 w-4' />
                <span className='hidden sm:inline'>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className='ml-auto'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => exitChild.mutate()}
              disabled={exitChild.isPending}
            >
              <LogOut className='mr-2 h-4 w-4' />
              <span className='hidden sm:inline'>Exit</span>
            </Button>
          </div>
        </div>
      </header>

      <main className='container mx-auto max-w-5xl px-4 py-6'>
        {children}
      </main>
    </div>
  );
}
