/**
 * CodeIIEST Logo SVG Component
 *
 * The official CI+II mark used across the platform.
 * Size variants: 'sm' (24px), 'md' (32px - default), 'lg' (48px), 'xl' (64px)
 */

interface CodeiiestLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = { sm: 24, md: 32, lg: 48, xl: 64 };

export function CodeiiestLogo({ size = 'md', className }: CodeiiestLogoProps) {
  const px = SIZES[size];
  const width = Math.round(px * 1.2545);

  return (
    <svg
      width={width}
      height={px}
      viewBox="0 0 621 495"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Red "CI" mark */}
      <rect width="425" height="40" fill="#F60000" />
      <rect x="110" y="60"  width="315" height="40" fill="#FF0000" />
      <rect x="165" y="400" width="260" height="40" fill="#F60000" />
      <rect x="55"  y="455" width="370" height="40" fill="#671616" />
      <rect x="55"  y="60"  width="40"  height="435" fill="#671616" />
      <rect x="110" y="60"  width="40"  height="380" fill="#FF0000" />
      <rect width="40" height="495" fill="#F60000" />

      {/* Grey "II" mark */}
      <rect x="470" width="37"  height="495" fill="#A6A6A6" />
      <rect x="527" width="37"  height="495" fill="#D9D9D9" />
      <rect x="584" width="37"  height="495" fill="#D9D9D9" />
    </svg>
  );
}
