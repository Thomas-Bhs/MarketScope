import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MarketScope',
  description: 'AI-powered stock insights and financial analysis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`
                           ${geistSans.variable} ${geistMono.variable}
          antialiased
          min-h-screen
          bg-gradient-to-b
          from-slate-50 via-white to-slate-100
          dark:from-[#070707] dark:via-[#0D0D0F] dark:to-[#050505]
          text-slate-900
          dark:text-white
        `}
      >
        <div className='relative min-h-screen overflow-x-hidden'>
          {/* subtle radial glow for premium depth */}
          <div className='pointer-events-none absolute inset-0'>
            <div
              className='
                absolute left-1/2 top-[-200px]
                h-[600px] w-[600px]
                -translate-x-1/2
                rounded-full
                bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]
                dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_65%)]
                blur-3xl
              '
            />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
