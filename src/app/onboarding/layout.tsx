import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started — CodeIIEST Bootcamp',
  description: 'Complete your profile setup to join the CodeIIEST CP & DSA Summer Bootcamp 2026.',
  robots: { index: false, follow: false }, // Keep onboarding private
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal layout — no navbar/footer for onboarding
  return <>{children}</>;
}
