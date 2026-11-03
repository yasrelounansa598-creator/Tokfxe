import React, { useState } from 'react';
import { X, Smartphone, Bell, Eye, Layers, ShieldCheck, CheckCircle2, Download, Copy } from 'lucide-react';
import { TokFxeLogo } from './TokFxeLogo';

interface BrandIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandIdentityModal: React.FC<BrandIdentityModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'launcher' | 'adaptive' | 'notification' | 'splash' | 'files'>('launcher');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const androidFiles = [
    {
      category: 'Adaptive Icon (Android 8.0+ / API 26+)',
      items: [
        { path: 'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', desc: 'أيقونة الإطلاق التكيفية (خلفية + طبقة أمامية)' },
        { path: 'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml', desc: 'أيقونة الإطلاق الدائرية التكيفية' },
      ],
    },
    {
      category: 'Vector Drawables',
      items: [
        { path: 'android/app/src/main/res/drawable/ic_launcher_foreground.xml', desc: 'طبقة الشعار الأمامية لشعار FX مع مثلث التشغيل وتوهج النيون' },
        { path: 'android/app/src/main/res/drawable/ic_launcher_background.xml', desc: 'خلفية سوداء فاخرة (#05070B) مع إشعاع نيون دائري' },
        { path: 'android/app/src/main/res/drawable/ic_notification.xml', desc: 'أيقونة الإشعارات للشريط العلوي وشاشة القفل (أبيض أحادي)' },
        { path: 'android/app/src/main/res/drawable/splash_background.xml', desc: 'خلفية شاشة الترحيب (Splash Screen)' },
        { path: 'android/app/src/main/res/drawable/ic_tokfxe_logo.xml', desc: 'الشعار المتجهي الكامل بجودة فائقة' },
      ],
    },
    {
      category: 'Density Mipmaps (Legacy & Full Compatibility)',
      items: [
        { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher.xml', desc: 'كثافة متوسطة MDPI (48x48)' },
        { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher.xml', desc: 'كثافة عالية HDPI (72x72)' },
        { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.xml', desc: 'كثافة فائقة XHDPI (96x96)' },
        { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.xml', desc: 'كثافة مضاعفة XXHDPI (144x144)' },
        { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.xml', desc: 'أعلى كثافة XXXHDPI (192x192)' },
      ],
    },
    {
      category: 'Configuration & Manifest',
      items: [
        { path: 'android/app/src/main/AndroidManifest.xml', desc: 'الربط مع @mipmap/ic_launcher و @style/Theme.TokFxe' },
        { path: 'android/app/src/main/res/values/colors.xml', desc: 'ألوان النيون (#05070B, #00D9FF, #8A2BFF, #FF00A8)' },
        { path: 'android/app/src/main/res/values/strings.xml', desc: 'اسم التطبيق Tok Fxe وتوك فيكس' },
        { path: 'android/app/src/main/res/values/themes.xml', desc: 'سمة التطبيق وشاشة Splash' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#0A0E1A] border border-[#00D9FF]/40 rounded-3xl shadow-[0_0_35px_rgba(0,217,255,0.25)] flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#07090E]/80">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] font-bold border border-[#00D9FF]/40">
              Android Identity Suite
            </span>
            <h2 className="text-base font-bold text-white font-heading">
              هوية وأيقونات Tok Fxe الأصلية
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40 overflow-x-auto no-scrollbar gap-1 text-xs">
          <button
            onClick={() => setActiveTab('launcher')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'launcher'
                ? 'bg-gradient-to-r from-[#00D9FF]/30 to-[#FF00A8]/30 text-white border border-[#00D9FF]/50 shadow-[0_0_12px_rgba(0,217,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>أيقونة المشغل (Launcher)</span>
          </button>

          <button
            onClick={() => setActiveTab('adaptive')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'adaptive'
                ? 'bg-gradient-to-r from-[#00D9FF]/30 to-[#FF00A8]/30 text-white border border-[#00D9FF]/50 shadow-[0_0_12px_rgba(0,217,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#8A2BFF]" />
            <span>طبقات Adaptive Icon</span>
          </button>

          <button
            onClick={() => setActiveTab('notification')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'notification'
                ? 'bg-gradient-to-r from-[#00D9FF]/30 to-[#FF00A8]/30 text-white border border-[#00D9FF]/50 shadow-[0_0_12px_rgba(0,217,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[#FF00A8]" />
            <span>أيقونة الإشعارات</span>
          </button>

          <button
            onClick={() => setActiveTab('splash')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'splash'
                ? 'bg-gradient-to-r from-[#00D9FF]/30 to-[#FF00A8]/30 text-white border border-[#00D9FF]/50 shadow-[0_0_12px_rgba(0,217,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Splash Screen</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'bg-gradient-to-r from-[#00D9FF]/30 to-[#FF00A8]/30 text-white border border-[#00D9FF]/50 shadow-[0_0_12px_rgba(0,217,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ملفات المشروع (Android)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar space-y-4">
          {/* TAB 1: Launcher Icons */}
          {activeTab === 'launcher' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col items-center text-center">
                <p className="text-xs text-slate-300 mb-4 max-w-sm">
                  تم تصميم أيقونة <strong className="text-white">Tok Fxe</strong> بأبعاد متوافقة مع معايير Google Play وتعمل على شاشات الهواتف والأجهزة اللوحية.
                </p>

                <div className="flex items-center justify-center gap-8 my-2">
                  {/* Squircle Launcher */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[#00D9FF] via-[#8A2BFF] to-[#FF00A8] shadow-[0_0_25px_rgba(0,217,255,0.4)]">
                      <img src="/icon.svg" alt="Tok Fxe Squircle" className="w-24 h-24 rounded-2xl" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">Squircle Launcher</span>
                    <span className="text-[10px] text-slate-500 font-mono">@mipmap/ic_launcher</span>
                  </div>

                  {/* Round Launcher */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative p-1 rounded-full bg-gradient-to-br from-[#00D9FF] via-[#8A2BFF] to-[#FF00A8] shadow-[0_0_25px_rgba(255,0,168,0.4)]">
                      <img src="/icon.svg" alt="Tok Fxe Round" className="w-24 h-24 rounded-full object-cover" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">Round Launcher</span>
                    <span className="text-[10px] text-slate-500 font-mono">@mipmap/ic_launcher_round</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>تدرجات النيون المعتمدة:</span>
                  <span className="text-[#00D9FF] font-mono">#00D9FF</span>
                  <span className="text-[#8A2BFF] font-mono">#8A2BFF</span>
                  <span className="text-[#FF00A8] font-mono">#FF00A8</span>
                </div>
              </div>

              {/* Android Grid Mockup preview */}
              <div className="p-4 rounded-2xl bg-[#05070B] border border-white/10">
                <span className="text-xs font-bold text-slate-400 block mb-3">
                  محاكاة شاشة تطبيقات Android:
                </span>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="flex flex-col items-center gap-1.5 opacity-40">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800" />
                    <span className="text-[10px] text-slate-400">كاميرا</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 opacity-40">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800" />
                    <span className="text-[10px] text-slate-400">المعرض</span>
                  </div>
                  {/* Highlighted Tok Fxe */}
                  <div className="flex flex-col items-center gap-1.5 scale-110">
                    <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-br from-[#00D9FF] to-[#FF00A8] shadow-[0_0_15px_rgba(0,217,255,0.6)]">
                      <img src="/icon.svg" alt="Tok Fxe App" className="w-full h-full rounded-[14px]" />
                    </div>
                    <span className="text-[11px] font-black text-white">Tok Fxe</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 opacity-40">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800" />
                    <span className="text-[10px] text-slate-400">المتجر</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Adaptive Icon Layers */}
          {activeTab === 'adaptive' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-300">
                تدعم أجهزة Android 8.0 فما فوق نظام <strong>Adaptive Icons</strong> المقسم إلى طبقتين (خلفية + طبقة أمامية) تتيح للنظام تطبيق تأثيرات الحركة والعمق ثلاثي الأبعاد.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Foreground Layer */}
                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-[#00D9FF] mb-2">1. الطبقة الأمامية (Foreground)</span>
                  <div className="w-24 h-24 rounded-2xl bg-slate-900/80 p-2 border border-[#00D9FF]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.2)]">
                    <TokFxeLogo size="lg" showText={false} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">ic_launcher_foreground.xml</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">رمز FX ومثلث التشغيل وتأثيرات الحركة</span>
                </div>

                {/* Background Layer */}
                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-[#FF00A8] mb-2">2. طبقة الخلفية (Background)</span>
                  <div className="w-24 h-24 rounded-2xl bg-[#05070B] border border-[#FF00A8]/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(255,0,168,0.2)]">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D9FF]/30 via-[#8A2BFF]/30 to-[#FF00A8]/30 blur-sm" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">ic_launcher_background.xml</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">اللون الأسود الفاخر #05070B مع هالة نيون</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#05070B] border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">مسار تعريف الأيقونة التكيفية:</span>
                <span className="font-mono text-[11px] text-[#00D9FF]">res/mipmap-anydpi-v26/ic_launcher.xml</span>
              </div>
            </div>
          )}

          {/* TAB 3: Notification Icon */}
          {activeTab === 'notification' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-300">
                وفقاً لإرشادات تصميم Android، يجب أن تكون أيقونة الإشعارات أحادية اللون (أبيض ناصع) مع شفافية كاملة للخلفية لضمان الوضوح التام في شريط الحالة وشاشة القفل.
              </div>

              {/* Status bar mock */}
              <div className="p-4 rounded-2xl bg-[#05070B] border border-white/10">
                <div className="flex items-center justify-between text-[11px] text-slate-300 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    {/* Tok Fxe Notification Icon */}
                    <div className="w-4 h-4 bg-white/15 rounded flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                        <path d="M4 4h7c.5 0 1 .5 1 1v1c0 .5-.5 1-1 1H7v3h3c.5 0 1 .5 1 1v1c0 .5-.5 1-1 1H7v6c0 .5-.5 1-1 1H5c-.5 0-1-.5-1-1V4z" />
                        <path d="M13 8.5c0-.9 1-1.4 1.8-.9l5 3.5c.7.4.7 1.4 0 1.8l-5 3.5c-.8.5-1.8 0-1.8-.9z" />
                      </svg>
                    </div>
                    <span className="text-slate-400">الآن</span>
                  </div>
                  <span className="font-mono">10:30</span>
                </div>

                {/* Notification Card */}
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#00D9FF]/20 border border-[#00D9FF]/50 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M4 4h7c.5 0 1 .5 1 1v1c0 .5-.5 1-1 1H7v3h3c.5 0 1 .5 1 1v1c0 .5-.5 1-1 1H7v6c0 .5-.5 1-1 1H5c-.5 0-1-.5-1-1V4z" />
                      <path d="M13 8.5c0-.9 1-1.4 1.8-.9l5 3.5c.7.4.7 1.4 0 1.8l-5 3.5c-.8.5-1.8 0-1.8-.9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Tok Fxe • مباشر</span>
                      <span className="text-[10px] text-slate-400">الآن</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      بدأ سارة أحمد بثاً مباشراً جديداً وتحدي PK! انضم للمشاهدة الآن.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#05070B] border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">مسار أيقونة الإشعارات:</span>
                <span className="font-mono text-[11px] text-[#FF00A8]">res/drawable/ic_notification.xml</span>
              </div>
            </div>
          )}

          {/* TAB 4: Splash Screen */}
          {activeTab === 'splash' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-300">
                شاشة الترحيب (Splash Screen) تعمل عند تشغيل التطبيق في أجهزة Android وتملأ الشاشة بالخلفية الفاخرة مع الشعار المتوهج.
              </div>

              {/* Splash Screen Mockup */}
              <div className="relative aspect-9/16 max-h-72 mx-auto rounded-3xl bg-[#05070B] border-2 border-white/15 overflow-hidden flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                {/* Ambient glow */}
                <div className="absolute w-44 h-44 rounded-full bg-gradient-to-br from-[#00D9FF]/20 via-[#8A2BFF]/20 to-[#FF00A8]/20 blur-xl" />

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="p-1 rounded-2xl bg-gradient-to-br from-[#00D9FF] via-[#8A2BFF] to-[#FF00A8] shadow-[0_0_25px_rgba(0,217,255,0.5)]">
                    <img src="/icon.svg" alt="Tok Fxe Splash" className="w-20 h-20 rounded-2xl" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-black font-heading text-white tracking-wider">
                      Tok <span className="text-[#00D9FF]">Fxe</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">توك فيكس</p>
                  </div>
                </div>

                <div className="absolute bottom-6 flex flex-col items-center gap-1.5">
                  <div className="w-5 h-5 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-slate-500 font-bold">جاري التحميل...</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#05070B] border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">ملف شاشة البداية:</span>
                <span className="font-mono text-[11px] text-cyan-400">res/drawable/splash_background.xml</span>
              </div>
            </div>
          )}

          {/* TAB 5: File Tree */}
          {activeTab === 'files' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>جميع ملفات أيقونة وهيكلية Android تم إنشاؤها وربطها بالكامل بالمشروع.</span>
              </div>

              {androidFiles.map((group, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                  <h4 className="font-bold text-[#00D9FF] text-[11px]">{group.category}</h4>
                  <div className="space-y-1.5">
                    {group.items.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => handleCopy(item.path)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between cursor-pointer transition-colors group"
                        title="انقر لنسخ المسار"
                      >
                        <div className="flex items-center gap-1.5">
                          {copiedPath === item.path ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
                          )}
                          <span className="font-mono text-[10px] text-slate-200">{item.path}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 text-left max-w-[150px] truncate">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#07090E]/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TokFxeLogo size="sm" showArabic={true} />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#FF00A8] text-white font-bold text-xs shadow-[0_0_12px_rgba(0,217,255,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
