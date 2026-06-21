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

// Set the theme before first paint so there's no flash of the wrong mode.
const themeScript = `(function(){try{var t=localStorage.getItem('nenap-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${hanken.variable} ${splineMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
