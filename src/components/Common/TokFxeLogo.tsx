import React from 'react';

interface TokFxeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showArabic?: boolean;
  className?: string;
  onClick?: () => void;
}

export const TokFxeLogo: React.FC<TokFxeLogoProps> = ({
  size = 'md',
  showText = true,
  showArabic = false,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-sm', badge: 'text-[9px]' },
    md: { box: 'w-9 h-9', text: 'text-base', badge: 'text-[10px]' },
    lg: { box: 'w-12 h-12', text: 'text-xl', badge: 'text-xs' },
    xl: { box: 'w-20 h-20', text: 'text-2xl', badge: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className}`}
    >
      {/* Tok Fxe Emblem Icon */}
      <div className={`relative ${currentSize.box} shrink-0 rounded-xl bg-[#05070B] p-1 border border-[#00D9FF]/40 shadow-[0_0_15px_rgba(0,217,255,0.35)] flex items-center justify-center overflow-hidden group`}>
        {/* Ambient Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/20 via-[#8A2BFF]/20 to-[#FF00A8]/20 group-hover:opacity-100 transition-opacity" />
        
        {/* Tok Fxe Original Kinetic FX Play Vector */}
        <svg
          viewBox="0 0 108 108"
          className="w-full h-full relative z-10 drop-shadow-[0_0_6px_rgba(0,217,255,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tf_grad_main" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D9FF" />
              <stop offset="50%" stopColor="#8A2BFF" />
              <stop offset="100%" stopColor="#FF00A8" />
            </linearGradient>
            <linearGradient id="tf_grad_play" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D9FF" />
              <stop offset="60%" stopColor="#FF00A8" />
              <stop offset="100%" stopColor="#FF00A8" />
            </linearGradient>
          </defs>

          {/* Top Kinetic Wave */}
          <path
            d="M33 32 C41 27 49 25 58 25 C68 25 74 28 78 33"
            stroke="#00D9FF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Vertical Stem of "F" */}
          <path
            d="M36 32 H44 C46.2 32 48 33.8 48 36 V72 C48 74.2 46.2 76 44 76 H36 C33.8 76 32 74.2 32 72 V36 C32 33.8 33.8 32 36 32 Z"
            fill="url(#tf_grad_main)"
          />

          {/* Top Arm of "F" */}
          <path
            d="M48 32 H68 C70.5 32 72.5 34 72.5 36.5 V40.5 C72.5 43 70.5 45 68 45 H48 V32 Z"
            fill="#00D9FF"
          />

          {/* Middle Bar */}
          <path
            d="M48 49 H62 C64 49 65.5 50.5 65.5 52.5 V55.5 C65.5 57.5 64 59 62 59 H48 V49 Z"
            fill="#8A2BFF"
          />

          {/* Diagonal "X" Leg */}
          <path
            d="M42 75 L56 54 L76 75 H67 L51.5 58 L46 65 V75 H42 Z"
            fill="#FF00A8"
          />

          {/* Central Video Play Triangle */}
          <path
            d="M56 43.5 C56 41.8 57.8 40.8 59.3 41.7 L75.5 52.2 C76.8 53 76.8 55 75.5 55.8 L59.3 66.3 C57.8 67.2 56 66.2 56 64.5 Z"
            fill="url(#tf_grad_play)"
          />

          {/* Sharp High-Contrast Inner Play Triangle */}
          <polygon points="60,48 60,60 70,54" fill="#FFFFFF" />

          {/* Kinetic Digital Sparks */}
          <rect x="76" y="38" width="5" height="2" rx="1" fill="#00D9FF" />
          <rect x="78" y="45" width="6" height="2" rx="1" fill="#FF00A8" />

          {/* Bottom Wave Arc */}
          <path
            d="M34 80 C44 85 54 86 64 84 C70 82 75 79 78 76"
            stroke="url(#tf_grad_main)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-tight font-heading font-black">
            <span className={`${currentSize.text} text-white`}>Tok</span>
            <span className={`${currentSize.text} text-[#00D9FF] ml-1 drop-shadow-[0_0_8px_rgba(0,217,255,0.7)]`}>
              Fxe
            </span>
          </div>
          {showArabic && (
            <span className={`${currentSize.badge} text-slate-400 font-bold tracking-wider mt-0.5`}>
              توك فيكس
            </span>
          )}
        </div>
      )}
    </div>
  );
};
