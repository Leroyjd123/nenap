import type { Metadata } from 'next';
import { Hanken_Grotesk, Newsreader, Spline_Sans_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

// Hi-Fi typography: Newsreader (display/prose), Hanken Grotesk (UI), Spline Sans Mono (meta).
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
});
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
});
const splineMono = Spline_Sans_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-spline-mono',
});

export const metadata: Metadata = {
  title: 'Nenap — Focus on the moment',
  description: 'A calm knowledge-capture app. Focus on the moment. Nenap remembers the rest.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${hanken.variable} ${splineMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
