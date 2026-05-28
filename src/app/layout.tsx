import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@root/auth';
import { Toaster } from '@/components/ui/sonner';
import { SplashScreen } from '@/components/ui/splash-screen';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://codeiiest-bootcamp.vercel.app'),
  title: {
    default: 'CodeIIEST CP & DSA Summer Bootcamp 2026',
    template: '%s | CodeIIEST Bootcamp',
  },
  description:
    'An 8-week structured competitive programming and DSA bootcamp for IIEST Shibpur students. Weekly expert sessions, automated Codeforces leaderboard, and a clear path to Expert rating.',
  keywords: [
    'competitive programming', 'DSA', 'IIEST Shibpur', 'CodeIIEST', 'Codeforces', 'bootcamp', 'Codeforces Leaderboard', 'IIEST CP Bootcamp', 'CodeIIEST Bootcamp'
  ],
  authors: [{ name: 'CodeIIEST Dev Team', url: 'https://codeiiest.in' }],
  creator: 'CodeIIEST',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
  },
  openGraph: {
    type: 'website', locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://codeiiest-bootcamp.vercel.app',
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    // suppressHydrationWarning: The SplashScreen component mutates the DOM
    // (overlay opacity) client-side after hydration. This is intentional and
    // safe — suppressing the warning prevents false-positive console errors.
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Course / Event Structured Data (JSON-LD) for Search Engine Optimization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              "name": "CodeIIEST CP & DSA Summer Bootcamp 2026",
              "description": "Structured 8-week competitive programming and DSA bootcamp for IIEST Shibpur students. Features weekly expert sessions, active Codeforces leaderboard tracking, and contest analysis.",
              "provider": {
                "@type": "EducationalOrganization",
                "name": "CodeIIEST",
                "url": "https://codeiiest.in"
              },
              "courseCode": "CODEIIEST-CP-2026",
              "hasCourseInstance": {
                "@type": "CourseInstance",
                "courseMode": "Online",
                "duration": "P8W",
                "startDate": "2026-06-01",
                "endDate": "2026-07-24",
                "location": {
                  "@type": "VirtualLocation",
                  "url": "https://codeiiest-bootcamp.vercel.app"
                }
              }
            })
          }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
        style={{ background: '#09090b', color: '#f8fafc', minHeight: '100dvh' }}
      >
        <SessionProvider session={session}>
          {/* Splash screen overlay — shown only on first visit per session */}
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
