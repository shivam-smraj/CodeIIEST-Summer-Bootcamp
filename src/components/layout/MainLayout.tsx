import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/**
 * Main application layout shell.
 * Wraps all public-facing pages with Navbar + Footer.
 *
 * Admin pages (/admin/*) use their own sidebar layout instead.
 * Onboarding (/onboarding) uses a minimal layout (no navbar/footer).
 */
export function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* pt-16 accounts for the fixed navbar height — using inline style to ensure reliability on all builds */}
      <main className="flex-1" style={{ paddingTop: '64px' }}>{children}</main>
      <Footer />
    </div>
  );
}
