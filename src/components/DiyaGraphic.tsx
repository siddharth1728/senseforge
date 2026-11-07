import React, { useState } from 'react';

interface DiyaGraphicProps {
  isLit?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
  showGlowSpread?: boolean;
  label?: string;
  interactive?: boolean;
}

export const DiyaGraphic: React.FC<DiyaGraphicProps> = ({
  isLit = true,
  size = 'md',
  className = '',
  onClick,
  showGlowSpread = true,
  label,
  interactive = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeMap = {
    sm: { width: 96, height: 82, flameScale: 0.8, glowRadius: 85 },
    md: { width: 145, height: 115, flameScale: 1.05, glowRadius: 130 },
    lg: { width: 195, height: 150, flameScale: 1.35, glowRadius: 180 },
    hero: { width: 270, height: 205, flameScale: 1.75, glowRadius: 260 },
  };

  const { width, height, flameScale, glowRadius } = sizeMap[size];

  const isClickable = interactive && onClick;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex flex-col items-center justify-center select-none transition-transform duration-500 ${
        isClickable ? 'cursor-pointer group hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{ width: `${width}px` }}
      role={isClickable ? 'button' : 'img'}
      aria-label={label || (isLit ? 'Kindled Diya' : 'Unlit Diya')}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Warm Ambient Radial Illumination */}
      {isLit && showGlowSpread && (
        <div
          className="absolute -top-14 pointer-events-none rounded-full diya-glow-pulse transition-all duration-1000"
          style={{
            width: `${glowRadius * 2.2}px`,
            height: `${glowRadius * 2.2}px`,
            background:
              'radial-gradient(circle, rgba(243, 217, 154, 0.45) 0%, rgba(217, 182, 111, 0.22) 32%, rgba(85, 24, 43, 0.12) 65%, transparent 75%)',
            filter: 'blur(20px)',
            zIndex: 0,
          }}
        />
      )}

      {/* When Unlit & Hovered: Subtle Golden Invitation Halo */}
      {!isLit && isHovered && (
        <div
          className="absolute -top-6 pointer-events-none rounded-full animate-pulse transition-opacity duration-300"
          style={{
            width: `${width * 1.2}px`,
            height: `${width * 1.2}px`,
            background: 'radial-gradient(circle, rgba(243, 217, 154, 0.28) 0%, rgba(217, 182, 111, 0.1) 45%, transparent 70%)',
            filter: 'blur(12px)',
            zIndex: 0,
          }}
        />
      )}

      {/* Handcrafted Diya SVG Artwork */}
      <svg
        viewBox="0 0 200 150"
        width={width}
        height={height}
        className="relative z-10 overflow-visible transition-all duration-500"
      >
        <defs>
          {/* Terracotta/Brass Dual Gradient */}
          <linearGradient id={`diyaBodyGrad-${size}`} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#8A3416" />
            <stop offset="25%" stopColor="#6E260E" />
            <stop offset="60%" stopColor="#451508" />
            <stop offset="100%" stopColor="#250904" />
          </linearGradient>

          {/* Burnished Gold Rim Gradient */}
          <linearGradient id={`goldRimGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B38C43" />
            <stop offset="35%" stopColor="#F3D99A" />
            <stop offset="50%" stopColor="#FFF5E6" />
            <stop offset="75%" stopColor="#D9B66F" />
            <stop offset="100%" stopColor="#8C6322" />
          </linearGradient>

          {/* Molten Oil Reservoir */}
          <radialGradient id={`oilPoolGrad-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isLit ? '#FF9A3C' : '#5A200B'} stopOpacity={isLit ? '0.95' : '0.5'} />
            <stop offset="65%" stopColor={isLit ? '#993D0E' : '#3B1306'} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1B0703" stopOpacity="0.98" />
          </radialGradient>

          {/* Living Flame Multi-Gradients */}
          <radialGradient id={`flameOuterHalo-${size}`} cx="50%" cy="70%" r="65%">
            <stop offset="0%" stopColor="#FFF5E6" stopOpacity="1" />
            <stop offset="20%" stopColor="#FFE08A" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#FF7A00" stopOpacity="0.8" />
            <stop offset="85%" stopColor="#D12800" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8A1000" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`flameCoreGrad-${size}`} cx="50%" cy="75%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FFF9D2" />
            <stop offset="70%" stopColor="#FFB326" />
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0.2" />
          </radialGradient>

          {/* Blue Oxygen Root */}
          <linearGradient id={`flameBlueRoot-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7AC5FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0B4DB8" stopOpacity="0" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id={`diyaShadowFilter-${size}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Ground Surface Contact Shadow */}
        <ellipse cx="100" cy="142" rx="70" ry="8" fill="#000000" opacity="0.75" />

        {/* Diya Base / Footing */}
        <path
          d="M 68 135 C 68 143, 132 143, 132 135 L 125 128 L 75 128 Z"
          fill="#2B0C04"
          stroke="url(#goldRimGrad-${size})"
          strokeWidth="0.8"
        />

        {/* Main Diya Clay / Brass Bowl */}
        <g filter={`url(#diyaShadowFilter-${size})`}>
          <path
            d="M 20 90 C 18 123, 62 139, 100 139 C 138 139, 182 123, 180 90 C 178 79, 160 82, 100 82 C 40 82, 22 79, 20 90 Z"
            fill={`url(#diyaBodyGrad-${size})`}
            stroke={`url(#goldRimGrad-${size})`}
            strokeWidth="1.2"
          />

          {/* Traditional Etched Petal Motifs on Bowl Front */}
          <path
            d="M 40 108 Q 70 126 100 126 Q 130 126 160 108"
            fill="none"
            stroke="#D9B66F"
            strokeWidth="1.1"
            strokeOpacity="0.65"
            strokeDasharray="2,3"
          />
          <path
            d="M 60 114 Q 80 123 100 123 Q 120 123 140 114"
            fill="none"
            stroke="#F3D99A"
            strokeWidth="0.8"
            strokeOpacity="0.5"
          />

          <circle cx="100" cy="120" r="2.8" fill="#F3D99A" opacity="0.8" />
          <circle cx="75" cy="115" r="2" fill="#D9B66F" opacity="0.7" />
          <circle cx="125" cy="115" r="2" fill="#D9B66F" opacity="0.7" />
          <circle cx="55" cy="108" r="1.6" fill="#D9B66F" opacity="0.6" />
          <circle cx="145" cy="108" r="1.6" fill="#D9B66F" opacity="0.6" />

          {/* Diya Rim Upper Lip */}
          <ellipse
            cx="100"
            cy="82"
            rx="78"
            ry="14"
            fill={`url(#oilPoolGrad-${size})`}
            stroke={`url(#goldRimGrad-${size})`}
            strokeWidth="2"
          />

          {/* Oil Glisten / Specular Sheen */}
          <ellipse
            cx="100"
            cy="82"
            rx="66"
            ry="10"
            fill={`url(#oilPoolGrad-${size})`}
          />

          {/* Spout / Wick Channel */}
          <path
            d="M 91 74 Q 100 66 109 74 L 105 82 L 95 82 Z"
            fill="#451406"
            stroke="#D9B66F"
            strokeWidth="1"
          />

          {/* Cotton Wick Tip */}
          <path
            d="M 98 78 Q 99 68 101 63 Q 102 59 100 55"
            stroke={isLit ? '#2A0D02' : '#140602'}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Dynamic Living Diya Flame (When Lit) */}
        {isLit && (
          <g
            className="flame-anim-main"
            style={{
              transformOrigin: '100px 58px',
            }}
          >
            {/* Outer Warm Golden Aura */}
            <path
              d="M 100 8 C 76 32, 72 48, 83 62 C 90 70, 110 70, 117 62 C 128 48, 124 32, 100 8 Z"
              fill={`url(#flameOuterHalo-${size})`}
              filter="blur(1.5px)"
              style={{ transform: `scale(${flameScale})`, transformOrigin: '100px 58px' }}
            />

            {/* Inner Incandescent Teardrop */}
            <path
              className="flame-anim-inner"
              d="M 100 20 C 86 36, 84 47, 91 58 C 95 63, 105 63, 109 58 C 116 47, 114 36, 100 20 Z"
              fill={`url(#flameCoreGrad-${size})`}
              style={{ transform: `scale(${flameScale})`, transformOrigin: '100px 58px' }}
            />

            {/* White-Hot Nuclear Center */}
            <ellipse
              cx="100"
              cy="50"
              rx="4"
              ry="8"
              fill="#FFFFFF"
              opacity="0.95"
            />

            {/* Blue Base of Oxygen Combustion */}
            <ellipse
              cx="100"
              cy="58"
              rx="6.5"
              ry="3"
              fill={`url(#flameBlueRoot-${size})`}
            />

            {/* Spark Embers drifting upwards */}
            <circle cx="98" cy="14" r="1.3" fill="#FFF5E6" opacity="0.85" className="animate-ping" style={{ animationDuration: '2.2s' }} />
            <circle cx="102" cy="4" r="1" fill="#FFDF95" opacity="0.75" className="animate-ping" style={{ animationDuration: '3.1s' }} />
          </g>
        )}

        {/* When Unlit: Gentle Pulsing Wick Invitation */}
        {!isLit && (
          <g className="animate-pulse">
            <circle cx="100" cy="55" r="2.8" fill="#F3D99A" opacity="0.6" />
            <circle cx="100" cy="55" r="6" fill="#D9B66F" opacity="0.25" />
          </g>
        )}
      </svg>

      {/* Label under diya */}
      {label && (
        <span
          className={`mt-2 font-display text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 ${
            isLit
              ? 'text-gold-champagne font-semibold drop-shadow-[0_0_10px_rgba(217,182,111,0.5)]'
              : 'text-ivory/50 group-hover:text-gold-warm group-hover:opacity-100'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
};
