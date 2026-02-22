import { ParentNavbar } from '@/components/layout/parent-navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen'>
      <ParentNavbar />
      <main className='container mx-auto max-w-7xl px-4 py-6'>
        {children}
      </main>
    </div>
  );
}
