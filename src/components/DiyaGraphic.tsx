import React from 'react';

interface DiyaGraphicProps {
  isLit?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
  showGlowSpread?: boolean;
  label?: string;
}

export const DiyaGraphic: React.FC<DiyaGraphicProps> = ({
  isLit = true,
  size = 'md',
  className = '',
  onClick,
  showGlowSpread = true,
  label,
}) => {
  const sizeMap = {
    sm: { width: 90, height: 75, flameScale: 0.75, glowRadius: 70 },
    md: { width: 140, height: 110, flameScale: 1, glowRadius: 120 },
    lg: { width: 190, height: 145, flameScale: 1.3, glowRadius: 170 },
    hero: { width: 260, height: 195, flameScale: 1.7, glowRadius: 240 },
  };

  const { width, height, flameScale, glowRadius } = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none transition-all duration-700 ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      style={{ width: `${width}px` }}
      role={onClick ? 'button' : 'img'}
      aria-label={label || (isLit ? 'Lit Diya' : 'Unlit Diya')}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Dynamic warm radial ambient glow behind diya */}
      {isLit && showGlowSpread && (
        <div
          className="absolute -top-12 pointer-events-none rounded-full diya-glow-pulse transition-opacity duration-1000"
          style={{
            width: `${glowRadius * 2}px`,
            height: `${glowRadius * 2}px`,
            background: 'radial-gradient(circle, rgba(243, 217, 154, 0.42) 0%, rgba(217, 182, 111, 0.22) 35%, rgba(85, 24, 43, 0.12) 65%, transparent 75%)',
            filter: 'blur(18px)',
            zIndex: 0,
          }}
        />
      )}

      {/* SVG Diya Container */}
      <svg
        viewBox="0 0 200 150"
        width={width}
        height={height}
        className="relative z-10 overflow-visible transition-transform duration-500 group-hover:scale-105"
      >
        <defs>
          {/* Gradients for Clay / Brass Body */}
          <linearGradient id={`diyaBodyGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A85434" />
            <stop offset="30%" stopColor="#80341B" />
            <stop offset="70%" stopColor="#4D1D0D" />
            <stop offset="100%" stopColor="#2F0F05" />
          </linearGradient>

          <linearGradient id={`diyaGoldRim-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D9B66F" />
            <stop offset="50%" stopColor="#FFF5E6" />
            <stop offset="100%" stopColor="#B38C43" />
          </linearGradient>

          <radialGradient id={`oilPool-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E28743" stopOpacity={isLit ? "0.9" : "0.3"} />
            <stop offset="80%" stopColor="#6C2810" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#250904" stopOpacity="0.95" />
          </radialGradient>

          {/* Flame Gradients */}
          <radialGradient id={`flameOuter-${size}`} cx="50%" cy="75%" r="65%">
            <stop offset="0%" stopColor="#FFF5E6" />
            <stop offset="25%" stopColor="#FFDF95" />
            <stop offset="60%" stopColor="#FF8F3D" />
            <stop offset="90%" stopColor="#E63920" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9C1717" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`flameInner-${size}`} cx="50%" cy="80%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FFF2B2" />
            <stop offset="80%" stopColor="#FFA62B" />
            <stop offset="100%" stopColor="#FF7A00" stopOpacity="0.1" />
          </radialGradient>

          <linearGradient id={`flameBaseBlue-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6BB6FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0B4DB8" stopOpacity="0" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id={`diyaShadow-${size}`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* Shadow under base */}
        <ellipse cx="100" cy="142" rx="65" ry="8" fill="#000000" opacity="0.65" />

        {/* Diya Base / Pedestal */}
        <path
          d="M72 135 C 72 142, 128 142, 128 135 L 122 128 L 78 128 Z"
          fill="#3B150A"
          stroke="#D9B66F"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* Diya Bowl Outer Body */}
        <g filter={`url(#diyaShadow-${size})`}>
          <path
            d="M 22 92 C 20 122, 65 138, 100 138 C 135 138, 180 122, 178 92 C 176 82, 160 84, 100 84 C 40 84, 24 82, 22 92 Z"
            fill={`url(#diyaBodyGrad-${size})`}
            stroke="#D9B66F"
            strokeWidth="1.2"
          />

          {/* Traditional decorative etched motifs on bowl */}
          <path
            d="M 45 108 Q 65 125 100 125 Q 135 125 155 108"
            fill="none"
            stroke="#D9B66F"
            strokeWidth="1"
            strokeOpacity="0.75"
            strokeDasharray="2,3"
          />
          <circle cx="100" cy="120" r="2.5" fill="#D9B66F" opacity="0.8" />
          <circle cx="75" cy="115" r="1.8" fill="#D9B66F" opacity="0.7" />
          <circle cx="125" cy="115" r="1.8" fill="#D9B66F" opacity="0.7" />

          {/* Diya Rim (Upper edge) */}
          <ellipse
            cx="100"
            cy="84"
            rx="76"
            ry="14"
            fill={`url(#oilPool-${size})`}
            stroke={`url(#diyaGoldRim-${size})`}
            strokeWidth="1.8"
          />

          {/* Oil Surface shimmer */}
          <ellipse
            cx="100"
            cy="84"
            rx="66"
            ry="10"
            fill={`url(#oilPool-${size})`}
          />

          {/* Diya Beak (Pointed lip holding wick) */}
          <path
            d="M 90 76 Q 100 68 110 76 L 105 84 L 95 84 Z"
            fill="#5E1F0B"
            stroke="#D9B66F"
            strokeWidth="1"
          />

          {/* Wick */}
          <path
            d="M 98 80 Q 99 69 101 64 Q 102 61 100 58"
            stroke={isLit ? "#3D1702" : "#22110A"}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Animated Flame (Visible only when isLit is true) */}
        {isLit && (
          <g
            className="flame-anim-main"
            style={{
              transformOrigin: '100px 60px',
            }}
          >
            {/* Outer Flame Glow */}
            <path
              d="M 100 10 C 80 32, 75 48, 85 62 C 92 70, 108 70, 115 62 C 125 48, 120 32, 100 10 Z"
              fill={`url(#flameOuter-${size})`}
              filter="blur(1px)"
              style={{ transform: `scale(${flameScale})`, transformOrigin: '100px 60px' }}
            />

            {/* Inner Intense Flame */}
            <path
              className="flame-anim-inner"
              d="M 100 24 C 88 38, 86 48, 92 58 C 96 63, 104 63, 108 58 C 114 48, 112 38, 100 24 Z"
              fill={`url(#flameInner-${size})`}
              style={{ transform: `scale(${flameScale})`, transformOrigin: '100px 60px' }}
            />

            {/* Tiny Core White/Ivory Light */}
            <ellipse
              cx="100"
              cy="52"
              rx="4"
              ry="7"
              fill="#FFFFFF"
              opacity="0.9"
            />

            {/* Blue base of the flame */}
            <ellipse
              cx="100"
              cy="59"
              rx="6"
              ry="3"
              fill={`url(#flameBaseBlue-${size})`}
            />

            {/* Little rising spark particles */}
            <circle cx="98" cy="18" r="1.2" fill="#FFF5E6" opacity="0.8" className="animate-ping" style={{ animationDuration: '2s' }} />
            <circle cx="102" cy="6" r="0.9" fill="#FFDF95" opacity="0.6" className="animate-ping" style={{ animationDuration: '3s' }} />
          </g>
        )}

        {/* When unlit, subtle wick tip glow indicating it can be lit */}
        {!isLit && (
          <g className="animate-pulse">
            <circle cx="100" cy="58" r="2.5" fill="#D9B66F" opacity="0.5" />
            <circle cx="100" cy="58" r="5" fill="#F3D99A" opacity="0.2" />
          </g>
        )}
      </svg>

      {/* Label underneath if specified */}
      {label && (
        <span
          className={`mt-2 font-display text-sm tracking-wider uppercase transition-all duration-300 ${
            isLit
              ? 'text-gold-champagne font-semibold drop-shadow-[0_0_8px_rgba(217,182,111,0.5)]'
              : 'text-stone-400 opacity-60 group-hover:opacity-100 group-hover:text-gold-warm'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
};
