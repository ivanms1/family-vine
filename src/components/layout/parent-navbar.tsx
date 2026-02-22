'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Coins,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserNav } from './user-nav';
import { MobileNav } from './mobile-nav';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/family', label: 'Family', icon: Users },
  { href: '/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/tokens', label: 'Tokens', icon: Coins },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function ParentNavbar() {
  const pathname = usePathname();

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-14 max-w-7xl items-center px-4'>
        <MobileNav />
        <Link
          href='/dashboard'
          className='mr-8 text-lg font-bold text-primary'
        >
          FamilyVine
        </Link>

        <nav className='hidden items-center gap-1 md:flex'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <item.icon className='h-4 w-4' />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className='ml-auto flex items-center gap-2'>
          <Link
            href='/select-child'
            className='rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20'
          >
            Child Mode
          </Link>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
