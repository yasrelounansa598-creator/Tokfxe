import React, { useState } from 'react';
import { X, Gem, Coins, ShoppingBag, History, ShieldCheck, CheckCircle2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COIN_PACKAGES } from '../../data/mockData';
import { CoinPackage } from '../../types';

export const WalletModal: React.FC = () => {
  const { isWalletModalOpen, setIsWalletModalOpen, userProfile, walletTransactions, buyCoins } = useApp();
  const [activeTab, setActiveTab] = useState<'store' | 'history'>('store');
  const [selectedPkg, setSelectedPkg] = useState<CoinPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isWalletModalOpen) return null;

  const handlePurchase = (pkg: CoinPackage) => {
    setSelectedPkg(pkg);
    setIsProcessing(true);
    setTimeout(() => {
      buyCoins(pkg);
      setIsProcessing(false);
      setSelectedPkg(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0E1424] border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-right animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 shrink-0">
          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white font-heading">محفظة العملات والهدايا</h3>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {/* Current Balance Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 mb-4 shrink-0 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-300 font-bold block mb-0.5">رصيدك الحالي</span>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-400" />
              <span className="text-2xl font-black text-white font-mono">{userProfile.coinsBalance}</span>
              <span className="text-xs text-slate-300 font-bold">عملة</span>
            </div>
          </div>
          <div className="text-left text-[10px] text-slate-400">
            <span className="text-emerald-400 font-bold block">✓ محفظة آمنة</span>
            <span>Google Play Billing</span>
          </div>
        </div>

        {/* Tab switch: متجر العملات / سجل المعاملات */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-3 shrink-0">
          <button
            onClick={() => setActiveTab('store')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'store' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>شحن العملات</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل المعاملات</span>
          </button>
        </div>

        {/* Tab 1: Store Packages */}
        {activeTab === 'store' ? (
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 no-scrollbar">
            {COIN_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-white font-mono">{pkg.coins}</span>
                      <span className="text-xs text-slate-300 font-bold">عملة</span>
                      {pkg.bonusCoins && (
                        <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                          +{pkg.bonusCoins} مجاناً
                        </span>
                      )}
                    </div>
                    {pkg.popular && (
                      <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                        ⭐ الباقة الأكثر طلباً
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs shadow-md active:scale-95 transition-transform flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span>{pkg.priceUSD}$</span>
                </button>
              </div>
            ))}

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-400 flex items-center gap-2 mt-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>يتم الدفع بأمان وسرية عبر منصة Google Play المعتمدة بنقرة واحدة.</span>
            </div>
          </div>
        ) : (
          /* Tab 2: Transaction History */
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 no-scrollbar">
            {walletTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-right"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{tx.description}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{tx.timestamp}</span>
                  </div>
                </div>

                <span
                  className={`text-xs font-black font-mono tabular-nums ${
                    tx.amount > 0 ? 'text-emerald-400' : 'text-[#FE2C55]'
                  }`}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
