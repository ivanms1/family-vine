import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className='flex min-h-screen flex-col'>
      <header className='border-b border-border'>
        <div className='container mx-auto flex h-16 max-w-6xl items-center justify-between px-4'>
          <h1 className='text-xl font-bold text-primary'>FamilyVine</h1>
          <div className='flex items-center gap-4'>
            <Link
              href='/login'
              className='text-sm font-medium text-muted-foreground hover:text-foreground'
            >
              Sign in
            </Link>
            <Link
              href='/register'
              className='rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90'
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className='flex flex-1 flex-col items-center justify-center px-4'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-4xl font-bold tracking-tight sm:text-5xl'>
            Grow Together in
            <span className='text-primary'> Faith & Wisdom</span>
          </h2>
          <p className='mt-6 text-lg text-muted-foreground'>
            A family-first learning app where parents and children grow
            together. Short, faith-aligned lessons in language, values, culture,
            and digital wisdom.
          </p>
          <div className='mt-10 flex items-center justify-center gap-4'>
            <Link
              href='/register'
              className='rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90'
            >
              Start Your Family Journey
            </Link>
            <Link
              href='/login'
              className='rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-accent'
            >
              Sign In
            </Link>
          </div>

          <div className='mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4'>
            {[
              { icon: '🙏', label: 'Faith', desc: 'Biblical values & wisdom' },
              {
                icon: '🗣️',
                label: 'Language',
                desc: 'Heritage language learning',
              },
              {
                icon: '🌍',
                label: 'Culture',
                desc: 'Cultural understanding',
              },
              {
                icon: '💡',
                label: 'Digital Wisdom',
                desc: 'Safe Web3 education',
              },
            ].map((item) => (
              <div
                key={item.label}
                className='rounded-xl border border-border p-4 text-center'
              >
                <div className='text-3xl'>{item.icon}</div>
                <h3 className='mt-2 font-semibold'>{item.label}</h3>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className='border-t border-border py-8'>
        <div className='container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground'>
          <p>
            Technology should serve families, not replace parents or faith
            formation.
          </p>
          <p className='mt-2'>
            &copy; {new Date().getFullYear()} FamilyVine. Built with love for
            families.
          </p>
        </div>
      </footer>
    </div>
  );
}
