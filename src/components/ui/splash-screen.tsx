'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * SplashScreen — animated CodeIIEST logo intro.
 *
 * APPROACH (hydration-safe):
 *  - Uses a fixed overlay div (not body/html visibility tricks) to cover
 *    the page content during the animation. This avoids SSR/hydration mismatches.
 *  - On first visit: overlay is visible (opacity 1), animation runs, then fades out.
 *  - On return visit within the session: overlay starts at opacity 0, removed immediately.
 *  - sessionStorage key 'ci-splash-shown' prevents showing on every navigation.
 *
 *  The overlay is rendered server-side with opacity: 0 by default (no flash).
 *  A useLayoutEffect-like trick via a ref + immediate DOM mutation makes it
 *  visible before the first paint on first visit.
 */
export function SplashScreen() {
  const overlayRef   = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    let alreadyShown = false;
    try {
      alreadyShown = !!sessionStorage.getItem('ci-splash-shown');
    } catch { /* incognito */ }

    if (alreadyShown) {
      // Return visit — remove overlay immediately
      setDone(true);
      return;
    }

    // First visit — make overlay visible immediately (before paint)
    try { sessionStorage.setItem('ci-splash-shown', '1'); } catch { /* ignore */ }

    // Show overlay and lock scroll
    el.style.opacity   = '1';
    el.style.pointerEvents = 'all';
    document.body.style.overflow = 'hidden';

    // After animation completes: fade out overlay
    const fadeTimer = setTimeout(() => {
      el.style.transition = 'opacity 0.6s ease';
      el.style.opacity    = '0';
    }, 3400);

    // After fade completes: remove entirely
    const doneTimer = setTimeout(() => {
      document.body.style.overflow = '';
      setDone(true);
    }, 4100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (done) return null;

  return (
    <>
      <style>{`
        @keyframes ci-horiz {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes ci-vert {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes ci-vert-grow {
          from { height: 0; }
          to   { height: 380px; }
        }
        @keyframes ci-pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 0px #dc2626); }
          50%       { filter: drop-shadow(0 0 24px #dc2626cc); }
        }
        @keyframes ci-text-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ci-splash-overlay {
          background: #09090b;
          width: 100vw;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          position: fixed;
          inset: 0;
          z-index: 99999;
          opacity: 0;
          pointer-events: none;
          --ci-easein:  cubic-bezier(0.8, 0, 1, 1);
          --ci-easeout: cubic-bezier(0, 0, 0.2, 1);
        }

        .ci-logo-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: ci-pulse-glow 2s ease-in-out 1.5s 1 forwards;
        }

        .ci-splash-label {
          font-family: system-ui, sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #374151;
          animation: ci-text-in 0.5s ease-out 2s both;
        }

        /* CI — horizontal top/bottom bars */
        #ci-r46, #ci-r48, #ci-r49_2 {
          animation: ci-horiz 0.8s var(--ci-easein) forwards;
          transform-origin: right;
        }
        #ci-r49 {
          animation: ci-horiz 0.8s var(--ci-easeout) 0.9s forwards;
          transform: scaleX(0);
          transform-origin: right;
        }

        /* CI — vertical bars */
        #ci-r123 {
          animation: ci-vert 0.8s var(--ci-easeout) 0.9s forwards;
          transform: scaleY(0);
          transform-origin: top;
        }
        #ci-r126 {
          animation: ci-vert 0.8s var(--ci-easeout) 0.9s forwards;
          transform: scaleY(0);
          transform-origin: bottom;
        }
        #ci-r129 {
          animation: ci-vert-grow 0.8s var(--ci-easeout) 0.9s forwards;
          height: 0;
        }

        /* II — all three bars */
        #ci-ri121 {
          animation: ci-vert 0.8s ease-out 0.9s forwards;
          transform: scaleY(0);
          transform-origin: top;
        }
        #ci-ri122 {
          animation: ci-vert 0.8s ease-out 1.1s forwards;
          transform: scaleY(0);
          transform-origin: bottom;
        }
        #ci-ri123 {
          animation: ci-vert 0.8s ease-out 1.0s forwards;
          transform: scaleY(0);
          transform-origin: top;
        }
      `}</style>

      <div
        ref={overlayRef}
        className="ci-splash-overlay"
        role="dialog"
        aria-label="Loading CodeIIEST"
        aria-live="polite"
      >
        <div className="ci-logo-row">
          {/* Red "CI" mark */}
          <svg width="160" height="190" viewBox="0 0 425 495" fill="none">
            <rect id="ci-r46"   width="425" height="40" fill="#F60000" />
            <rect id="ci-r48"   x="110" y="60"  width="315" height="40"  fill="#FF0000" />
            <rect id="ci-r49"   x="165" y="400" width="260" height="40"  fill="#F60000" />
            <rect id="ci-r49_2" x="55"  y="455" width="370" height="40"  fill="#671616" />
            <rect id="ci-r126"  x="55"  y="60"  width="40"  height="435" fill="#671616" />
            <rect id="ci-r129"  x="110" y="60"  width="40"  height="380" fill="#FF0000" />
            <rect id="ci-r123"  width="40" height="495" fill="#F60000" />
          </svg>

          {/* Grey "II" mark */}
          <svg width="55" height="190" viewBox="0 0 151 495" fill="none">
            <rect id="ci-ri121" width="37"  height="495" fill="#A6A6A6" />
            <rect id="ci-ri122" x="57"  width="37" height="495" fill="#D9D9D9" />
            <rect id="ci-ri123" x="114" width="37" height="495" fill="#D9D9D9" />
          </svg>
        </div>

        <p className="ci-splash-label">CP &amp; DSA Bootcamp 2026</p>
      </div>
    </>
  );
}
