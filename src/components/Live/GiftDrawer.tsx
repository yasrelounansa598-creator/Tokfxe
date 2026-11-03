import React, { useState } from 'react';
import { X, Gem, Sparkles, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GIFTS_CATALOG } from '../../data/mockData';
import { LiveGift } from '../../types';

export const GiftDrawer: React.FC = () => {
  const { isGiftDrawerOpen, setIsGiftDrawerOpen, sendLiveGift } = useApp();
  const [selectedGift, setSelectedGift] = useState<LiveGift>(GIFTS_CATALOG[0]);

  if (!isGiftDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsGiftDrawerOpen(false)} />

      <div className="relative w-full max-w-lg bg-[#0E1424] border-t border-white/10 rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-250 text-right mx-auto">
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-slate-600/60 rounded-full mx-auto mb-4" />

        {/* Header with Diamonds Balance */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            <Gem className="w-4 h-4 text-[#00F2FE]" />
            <span className="text-xs font-bold text-white font-mono">1,450</span>
            <span className="text-[10px] text-slate-400">ماسة</span>
          </div>

          <h3 className="text-sm font-bold text-white font-heading">هدايا البث المباشر</h3>

          <button
            onClick={() => setIsGiftDrawerOpen(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gifts Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {GIFTS_CATALOG.map((gift) => {
            const isSelected = selectedGift.id === gift.id;
            return (
              <button
                key={gift.id}
                onClick={() => setSelectedGift(gift)}
                className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white/15 border-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.3)] scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="text-3xl mb-1 filter drop-shadow-md">{gift.icon}</span>
                <span className="text-xs font-bold text-white">{gift.nameAr}</span>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-400 font-mono">
                  <Gem className="w-3 h-3 text-[#00F2FE]" />
                  <span>{gift.diamonds}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Send Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedGift.icon}</span>
            <div>
              <span className="text-xs font-bold text-white block">{selectedGift.nameAr}</span>
              <span className="text-[10px] text-slate-400 font-mono">{selectedGift.diamonds} ماسة</span>
            </div>
          </div>

          <button
            onClick={() => sendLiveGift(selectedGift.id)}
            className="px-6 py-2.5 rounded-full bg-neon-gradient text-white text-xs font-extrabold flex items-center gap-1.5 shadow-neon-glow active:scale-95 transition-transform"
          >
            <Send className="w-3.5 h-3.5 rotate-180" />
            <span>إرسال الهدية الآن 🎁</span>
          </button>
        </div>
      </div>
    </div>
  );
};
