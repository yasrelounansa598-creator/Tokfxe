import React from 'react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
      <div className="bg-[#0E131F]/90 backdrop-blur-md border border-[#00F2FE]/40 text-white text-xs font-bold px-4 py-2 rounded-full shadow-neon-glow flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-ping" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
