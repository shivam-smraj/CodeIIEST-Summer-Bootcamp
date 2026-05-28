'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * SplashScreen — animated CodeIIEST logo intro.
 *
 * STRATEGY: Show on EVERY full page load/refresh, but NOT on client-side
 * navigation (React router pushes).
 *
 * How it works:
 *   - A module-level variable `splashShownThisLoad` starts as `false`.
 *   - On a full page refresh, the JavaScript module re-initialises → `false` → show splash.
 *   - On client-side navigation (Next.js Link), the module stays in memory → already `true` → skip.
 *   - This is better than sessionStorage (which persists the ENTIRE browser session
 *     and never shows the splash again until the tab is closed).
 *
 * HYDRATION-SAFE:
 *   - Overlay renders with opacity:0 by SSR (invisible, no layout shift, no mismatch).
 *   - useEffect immediately sets opacity:1 on the overlay element before the first paint.
 *   - No body/html visibility:hidden tricks → zero hydration warnings.
 */

// Resets on every hard refresh, persists across client-side navigation.
let splashShownThisLoad = false;

export function SplashScreen() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    if (splashShownThisLoad) {
      // Client-side navigation — skip immediately
      setDone(true);
      return;
    }

    // Make overlay visible immediately (before next paint)
    el.style.opacity = '1';
    el.style.pointerEvents = 'all';
    document.body.style.overflow = 'hidden';

    // After animation: fade out overlay
    const fadeTimer = setTimeout(() => {
      el.style.transition = 'opacity 0.6s ease';
      el.style.opacity = '0';
    }, 3400);

    // After fade: remove from DOM
    const doneTimer = setTimeout(() => {
      document.body.style.overflow = '';
      splashShownThisLoad = true; // Mark shown only on SUCCESSFUL completion of the animation! (Solves React StrictMode double-mount skipping the splash screen)
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
        @keyframes ci-glow {
          0%, 100% { filter: drop-shadow(0 0 0px #dc2626); }
          50%       { filter: drop-shadow(0 0 28px #dc2626cc); }
        }
        @keyframes ci-label-in {
          from { opacity: 0; transform: translateY(10px); }
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
          gap: 6px;
          animation: ci-glow 2s ease-in-out 1.5s 1 forwards;
        }

        .ci-splash-label {
          font-family: system-ui, sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #374151;
          animation: ci-label-in 0.5s ease-out 2s both;
        }

        /* Red CI bars */
        #sp-r46, #sp-r48, #sp-r49_2 {
          animation: ci-horiz 0.75s var(--ci-easein) forwards;
          transform-origin: right;
        }
        #sp-r49 {
          animation: ci-horiz 0.75s var(--ci-easeout) 0.85s forwards;
          transform: scaleX(0);
          transform-origin: right;
        }
        #sp-r123 {
          animation: ci-vert 0.75s var(--ci-easeout) 0.85s forwards;
          transform: scaleY(0);
          transform-origin: top;
        }
        #sp-r126 {
          animation: ci-vert 0.75s var(--ci-easeout) 0.85s forwards;
          transform: scaleY(0);
          transform-origin: bottom;
        }
        #sp-r129 {
          animation: ci-vert-grow 0.75s var(--ci-easeout) 0.85s forwards;
          height: 0;
        }

        /* Grey II bars */
        #sp-ri1 {
          animation: ci-vert 0.75s ease-out 0.85s forwards;
          transform: scaleY(0);
          transform-origin: top;
        }
        #sp-ri2 {
          animation: ci-vert 0.75s ease-out 1.05s forwards;
          transform: scaleY(0);
          transform-origin: bottom;
        }
        #sp-ri3 {
          animation: ci-vert 0.75s ease-out 0.95s forwards;
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
          <svg width="232" height="185" viewBox="0 0 621 495" fill="none">
            {/* Red "CI" mark */}
            <rect id="sp-r46"   width="425" height="40" fill="#F60000" />
            <rect id="sp-r48"   x="110" y="60"  width="315" height="40"  fill="#FF0000" />
            <rect id="sp-r49"   x="165" y="400" width="260" height="40"  fill="#F60000" />
            <rect id="sp-r49_2" x="55"  y="455" width="370" height="40"  fill="#671616" />
            <rect id="sp-r126"  x="55"  y="60"  width="40"  height="435" fill="#671616" />
            <rect id="sp-r129"  x="110" y="60"  width="40"  height="380" fill="#FF0000" />
            <rect id="sp-r123"  width="40" height="495" fill="#F60000" />

            {/* Grey "II" mark */}
            <rect id="sp-ri1" x="470" width="37"  height="495" fill="#A6A6A6" />
            <rect id="sp-ri2" x="527" width="37"  height="495" fill="#D9D9D9" />
            <rect id="sp-ri3" x="584" width="37"  height="495" fill="#D9D9D9" />
          </svg>
        </div>

        <p className="ci-splash-label">CP &amp; DSA Bootcamp 2026</p>
      </div>
    </>
  );
}
