import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'FamilyVine - Christian Family Learning',
  description:
    'A family-first learning app where parents and children grow together in faith, language, culture, and digital wisdom.',
  keywords: [
    'christian',
    'family',
    'learning',
    'faith',
    'education',
    'children',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
