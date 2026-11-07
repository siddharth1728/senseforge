import React from 'react';

interface RangoliProps {
  className?: string;
  size?: number;
  opacity?: number;
}

export const RangoliMandala: React.FC<RangoliProps> = ({
  className = '',
  size = 280,
  opacity = 0.25,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      className={`pointer-events-none select-none transition-opacity duration-1000 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="rangoliGoldGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF5E6" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#F3D99A" stopOpacity="0.7" />
          <stop offset="80%" stopColor="#D9B66F" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#B38C43" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform="translate(150, 150)" stroke="url(#rangoliGoldGrad)" fill="none" strokeWidth="1">
        {/* Concentric sacred circles */}
        <circle r="15" strokeWidth="1.2" />
        <circle r="32" strokeDasharray="3,3" />
        <circle r="55" strokeWidth="0.8" />
        <circle r="85" strokeDasharray="4,4" />
        <circle r="120" strokeWidth="0.8" />
        <circle r="135" strokeDasharray="2,4" />

        {/* Central 8-petal Lotus */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <g key={i} transform={`rotate(${angle})`}>
            {/* Inner Petal */}
            <path d="M 0 0 C 12 -20, 12 -40, 0 -50 C -12 -40, -12 -20, 0 0" fill="rgba(217, 182, 111, 0.08)" />
            {/* Outer Petal */}
            <path d="M 0 -50 C 22 -75, 22 -105, 0 -120 C -22 -105, -22 -75, 0 -50" fill="rgba(85, 24, 43, 0.08)" />
            {/* Diya Tip accent */}
            <circle cx="0" cy="-126" r="2.5" fill="#F3D99A" />
            <line x1="0" y1="-85" x2="0" y2="-115" strokeWidth="0.8" />
          </g>
        ))}

        {/* 16 secondary radiating rays */}
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
          <g key={`sec-${i}`} transform={`rotate(${angle})`}>
            <circle cx="0" cy="-70" r="2" fill="#D9B66F" opacity="0.6" />
            <path d="M 0 -85 Q 8 -98 0 -110 Q -8 -98 0 -85" />
          </g>
        ))}
      </g>
    </svg>
  );
};

// Subtle marigold flower accent
export const MarigoldMotif: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`inline-block select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="marigoldGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFA62B" />
          <stop offset="60%" stopColor="#E26D14" />
          <stop offset="100%" stopColor="#B33E00" />
        </radialGradient>
      </defs>
      <g transform="translate(50, 50)">
        {[...Array(12)].map((_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-28"
            rx="12"
            ry="20"
            fill="url(#marigoldGrad)"
            opacity="0.88"
            transform={`rotate(${i * 30})`}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <ellipse
            key={`in-${i}`}
            cx="0"
            cy="-16"
            rx="8"
            ry="14"
            fill="#FFDF95"
            opacity="0.95"
            transform={`rotate(${i * 45})`}
          />
        ))}
        <circle cx="0" cy="0" r="9" fill="#992B00" />
        <circle cx="0" cy="0" r="5" fill="#FFE082" />
      </g>
    </svg>
  );
};

// Elegant Ornamental Border Divider
export const RoyalDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-3 w-full max-w-md mx-auto ${className}`} aria-hidden="true">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D9B66F]/40 to-[#D9B66F]/80" />
      <div className="flex items-center gap-1.5 text-[#F3D99A]">
        <span className="w-1.5 h-1.5 rotate-45 border border-[#D9B66F] bg-[#35101D]" />
        <span className="text-xs">✦</span>
        <span className="w-2 h-2 rotate-45 bg-[#D9B66F] shadow-[0_0_6px_#F3D99A]" />
        <span className="text-xs">✦</span>
        <span className="w-1.5 h-1.5 rotate-45 border border-[#D9B66F] bg-[#35101D]" />
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#D9B66F]/40 to-[#D9B66F]/80" />
    </div>
  );
};

