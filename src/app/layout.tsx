import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@root/auth';
import { Toaster } from '@/components/ui/sonner';
import { SplashScreen } from '@/components/ui/splash-screen';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'CodeIIEST CP & DSA Summer Bootcamp 2026',
    template: '%s | CodeIIEST Bootcamp',
  },
  description:
    'An 8-week structured competitive programming and DSA bootcamp for IIEST Shibpur students. Weekly expert sessions, automated Codeforces leaderboard, and a clear path to Expert rating.',
  keywords: [
    'competitive programming', 'DSA', 'IIEST Shibpur', 'CodeIIEST', 'Codeforces', 'bootcamp',
  ],
  authors: [{ name: 'CodeIIEST Dev Team', url: 'https://codeiiest.in' }],
  creator: 'CodeIIEST',
  openGraph: {
    type: 'website', locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'CodeIIEST CP & DSA Summer Bootcamp 2026',
    description: "Master competitive programming this summer with IIEST Shibpur's top CP team.",
    siteName: 'CodeIIEST Bootcamp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeIIEST Summer CP Bootcamp 2026',
    description: 'Master competitive programming this summer.',
  },
  robots: { index: true, follow: true },
};

/**
 * SPLASH SCREEN STRATEGY — eliminates FOUC completely:
 *
 * The inline <script> below runs synchronously BEFORE the browser paints.
 * It checks sessionStorage immediately:
 *   - First visit: sets body visibility to "hidden" so nothing is shown.
 *     The SplashScreen React component then takes over (z-index:99999),
 *     and after 4.2s both the splash fades AND body becomes visible again.
 *   - Return visit: sessionStorage flag already set → body stays visible,
 *     no splash is shown at all.
 *
 * This is the ONLY reliable way to prevent FOUC without SSR tricks.
 */
const splashBlockingScript = `
(function(){
  try {
    var shown = sessionStorage.getItem('ci-splash-shown');
    if (!shown) {
      // First visit: hide body immediately so no content flashes
      document.documentElement.style.visibility = 'hidden';
    }
  } catch(e) {}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className="dark">
      <head>
        {/* Blocking script — runs before first paint to prevent FOUC */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: splashBlockingScript }} />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-[#0a0a0a] text-white`}
      >
        <SessionProvider session={session}>
          <SplashScreen />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#ffffff',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
