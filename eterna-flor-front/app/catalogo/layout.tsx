import { Fraunces, Nunito } from 'next/font/google';
import type { ReactNode } from 'react';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-nunito',
  display: 'swap',
});

export default function CatalogoLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${nunito.variable}`}>
      {children}
    </div>
  );
}
