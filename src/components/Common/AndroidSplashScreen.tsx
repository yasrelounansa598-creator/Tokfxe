import React, { useEffect, useState } from 'react';
import { TokFxeLogo } from './TokFxeLogo';

interface AndroidSplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const AndroidSplashScreen: React.FC<AndroidSplashScreenProps> = ({
  onFinish,
  durationMs = 900,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, durationMs - 250);

    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-100 bg-[#05070B] flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none select-none ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient Neon Glow Nebula */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-[#00D9FF]/25 via-[#8A2BFF]/20 to-[#FF00A8]/20 blur-3xl pointer-events-none animate-pulse" />

      {/* Main Centerpiece: Tok Fxe Logo Mark & Typography */}
      <div className="relative z-10 flex flex-col items-center gap-4 animate-scale-up">
        <TokFxeLogo size="xl" showText={false} />
        
        <div className="text-center mt-1">
          <h1 className="text-2xl font-black font-heading tracking-widest text-white flex items-center justify-center gap-1">
            <span>TOK</span>
            <span className="text-[#00D9FF] drop-shadow-[0_0_12px_rgba(0,217,255,0.7)]">FXE</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 tracking-wider">توك فيكس</p>
        </div>
      </div>

      {/* Bottom Android Brand Loader Bar */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-[#00D9FF] via-[#8A2BFF] to-[#FF00A8] animate-pulse" />
        </div>
        <span className="text-[10px] text-slate-500 font-bold tracking-widest">ANDROID ED.</span>
      </div>
    </div>
  );
};
