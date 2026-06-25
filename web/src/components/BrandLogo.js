import React from 'react';

export default function BrandLogo({
  size = 40,
  showText = false,
  textColor = '#FFFFFF',
  textSize = 15,
  compactText = false,
}) {
  const wordmark = compactText ? 'Auto-Compta' : 'Auto-Compta';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo Auto-Compta"
      >
        <defs>
          <linearGradient id="auto-compta-logo-bg" x1="10" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1D4ED8" />
            <stop offset="0.55" stopColor="#2563EB" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="auto-compta-logo-accent" x1="40" y1="10" x2="53" y2="25" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE68A" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#auto-compta-logo-bg)" />
        <path
          d="M19 19.5C19 17.567 20.567 16 22.5 16H37.5C39.433 16 41 17.567 41 19.5V44.5C41 46.433 39.433 48 37.5 48H22.5C20.567 48 19 46.433 19 44.5V19.5Z"
          fill="rgba(255,255,255,0.15)"
          stroke="white"
          strokeWidth="2.2"
        />
        <path d="M25 25H35" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M25 31H31" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M25 38L29.5 33.5L33 36L39 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36.5 28H39V30.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M47.2 12L48.7 16.1L52.8 17.6L48.7 19.1L47.2 23.2L45.7 19.1L41.6 17.6L45.7 16.1L47.2 12Z"
          fill="url(#auto-compta-logo-accent)"
        />
      </svg>

      {showText && (
        <span
          style={{
            color: textColor,
            fontWeight: 800,
            fontSize: textSize,
            whiteSpace: 'nowrap',
            letterSpacing: '-0.02em',
          }}
        >
          {wordmark}
        </span>
      )}
    </div>
  );
}
