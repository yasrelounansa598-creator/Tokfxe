import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TokFxeLogo } from '../Common/TokFxeLogo';
import { getMissingFirebaseKeys } from '../../firebase/config';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginUser,
    signupUser,
    sendPasswordReset,
    isFirebaseConfigured,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  if (!isAuthModalOpen) return null;

  const missingKeys = getMissingFirebaseKeys();

  // Real-time Password Security Criteria & Strength Evaluation
  const evaluatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9\s]/.test(pass);
    const hasMixedCase = (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) || (hasLetters && hasSpecial);

    let score = 0;
    if (pass.length >= 6) score += 1;
    if (minLength) score += 1;
    if (hasLetters && hasNumbers) score += 1;
    if (hasSpecial || hasMixedCase) score += 1;

    let text = 'يرجى إدخال كلمة مرور قوية';
    let color = 'bg-slate-700';
    let textColor = 'text-slate-400';
    let label = 'غير محدد';

    if (pass.length > 0) {
      if (score <= 1) {
        text = 'ضعيفة جداً - غير آمنة';
        color = 'bg-red-500';
        textColor = 'text-red-400';
        label = 'ضعيفة جداً';
      } else if (score === 2) {
        text = 'مقبولة - تحتاج إلى أرقام ورموز';
        color = 'bg-amber-400';
        textColor = 'text-amber-400';
        label = 'مقبولة';
      } else if (score === 3) {
        text = 'جيدة - تفي بمتطلبات الأمان';
        color = 'bg-[#00D9FF]';
        textColor = 'text-[#00D9FF]';
        label = 'جيدة ومناسبة';
      } else {
        text = 'قوية ومحمية بنجاح ✨';
        color = 'bg-emerald-400';
        textColor = 'text-emerald-400';
        label = 'قوية وآمنة جداً';
      }
    }

    return {
      score,
      text,
      label,
      color,
      textColor,
      criteria: {
        minLength,
        hasLetters,
        hasNumbers,
        hasSpecial,
      },
      isSecureEnough: minLength && hasLetters && hasNumbers,
    };
  };

  const passwordEval = evaluatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isFirebaseConfigured) {
      setErrorMessage(
        'خدمة Firebase غير مهيأة بعد. يرجى إدخال مفاتيح المشروع (VITE_FIREBASE_*) في ملف البيئة .env لتفعيل المصادقة الحقيقية.'
      );
      setShowConfigHelp(true);
      return;
    }

    // Pre-flight Security Verification for Signup
    if (authModalMode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('يرجى كتابة الاسم الكامل.');
        return;
      }
      if (!username.trim()) {
        setErrorMessage('يرجى كتابة اسم المستخدم.');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('يجب أن تتكون كلمة المرور من 8 خانات أو رموز على الأقل.');
        return;
      }
      if (!passwordEval.isSecureEnough) {
        setErrorMessage('كلمة المرور لا تستوفي شروط الأمان. يجب أن تحتوي على 8 خانات على الأقل وتجمع بين الحروف والأرقام.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (authModalMode === 'login') {
        const res = await loginUser(email, password);
        if (!res.success && res.error) {
          setErrorMessage(res.error);
        }
      } else if (authModalMode === 'signup') {
        const res = await signupUser(name, username, email, password);
        if (!res.success && res.error) {
          setErrorMessage(res.error);
        }
      } else {
        const res = await sendPasswordReset(email);
        if (res.success) {
          setAuthModalMode('login');
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0E1424] border border-[#00D9FF]/40 rounded-3xl p-6 shadow-neon-glow text-right animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <TokFxeLogo size="sm" showArabic={false} />
            <ShieldCheck className="w-4 h-4 text-[#00D9FF]" />
          </div>
        </div>

        {/* Firebase Configuration Warning Banner if unconfigured */}
        {!isFirebaseConfigured && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-[11px] leading-tight">
                  بانتظار إدخال إعدادات Firebase الحقيقية
                </p>
                <p className="text-[10px] text-amber-300/80 mt-1 leading-relaxed">
                  تم تجهيز كود المصادقة الحقيقي عبر Firebase SDK. يرجى تزويد متغيرات البيئة في ملف <code className="text-amber-100 font-mono">.env</code> لتفعيل التسجيل الفعلي.
                </p>
                <button
                  type="button"
                  onClick={() => setShowConfigHelp(!showConfigHelp)}
                  className="text-[10px] text-[#00D9FF] hover:underline font-bold mt-1 block"
                >
                  {showConfigHelp ? 'إخفاء المتغيرات المطلوبة ▲' : 'عرض المتغيرات المطلوبة ▼'}
                </button>
                {showConfigHelp && (
                  <ul className="mt-2 space-y-1 font-mono text-[9px] text-slate-300 bg-black/40 p-2 rounded-lg border border-white/10">
                    {missingKeys.map((key) => (
                      <li key={key} className="flex items-center gap-1 text-red-300">
                        <span>•</span> {key}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Titles */}
        <h3 className="text-base font-extrabold text-white mb-1 font-heading">
          {authModalMode === 'login' && 'تسجيل الدخول إلى حسابك'}
          {authModalMode === 'signup' && 'إنشاء حساب جديد في Tok Fxe'}
          {authModalMode === 'forgot' && 'استعادة كلمة المرور'}
        </h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          {authModalMode === 'login' && 'سجّل دخولك لمتابعة صانعي المحتوى والتفاعل مع الفيديوهات والبث المباشر.'}
          {authModalMode === 'signup' && 'انضم إلى مجتمع توك فيكس وشارك إبداعاتك ومواهبك للعالم بحساب حقيقي موثق.'}
          {authModalMode === 'forgot' && 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً عبر Firebase لتعيين كلمة مرور جديدة.'}
        </p>

        {/* Inline Error Message */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-[11px] flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="flex-1 leading-snug">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalMode === 'signup' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">الاسم الكامل</label>
                <div className="flex items-center bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 focus-within:border-[#00D9FF]">
                  <User className="w-4 h-4 text-slate-400 ml-2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: ياسر العنزي"
                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">اسم المستخدم (@)</label>
                <div className="flex items-center bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 focus-within:border-[#00D9FF]">
                  <span className="text-slate-400 font-mono text-xs ml-1">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yaser_tech"
                    className="w-full bg-transparent text-xs text-white font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">البريد الإلكتروني</label>
            <div className="flex items-center bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 focus-within:border-[#00D9FF]">
              <Mail className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent text-xs text-white focus:outline-none"
                required
              />
            </div>
          </div>

          {authModalMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300">كلمة المرور</label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setAuthModalMode('forgot');
                    }}
                    className="text-[10px] text-[#00D9FF] hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="flex items-center bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 focus-within:border-[#00D9FF]">
                <Lock className="w-4 h-4 text-slate-400 ml-2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (6 أحرف على الأقل)"
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Real-time Password Strength Meter & Security Checklist */}
              {authModalMode === 'signup' && (
                <div className="mt-2.5 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 animate-in fade-in">
                  {/* Multi-segment Meter & Label */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-slate-400 font-bold">مستوى الأمان:</span>
                      <span className={`font-black text-[10px] px-2 py-0.5 rounded-full ${passwordEval.textColor} bg-white/5 border border-white/10`}>
                        {password ? passwordEval.label : 'بانتظار الإدخال'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordEval.score >= 1 ? passwordEval.color : 'bg-transparent'
                        }`}
                        style={{ width: '25%' }}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordEval.score >= 2 ? passwordEval.color : 'bg-transparent'
                        }`}
                        style={{ width: '25%' }}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordEval.score >= 3 ? passwordEval.color : 'bg-transparent'
                        }`}
                        style={{ width: '25%' }}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordEval.score >= 4 ? passwordEval.color : 'bg-transparent'
                        }`}
                        style={{ width: '25%' }}
                      />
                    </div>
                  </div>

                  {/* Real-time Criteria Checklist */}
                  <div className="pt-1.5 border-t border-white/10 grid grid-cols-2 gap-1 text-[10px]">
                    <div className={`flex items-center gap-1 transition-colors ${passwordEval.criteria.minLength ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${passwordEval.criteria.minLength ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'border-slate-600 bg-white/5'}`}>
                        {passwordEval.criteria.minLength ? '✓' : '•'}
                      </div>
                      <span>8 خانات فأكثر</span>
                    </div>

                    <div className={`flex items-center gap-1 transition-colors ${passwordEval.criteria.hasLetters ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${passwordEval.criteria.hasLetters ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'border-slate-600 bg-white/5'}`}>
                        {passwordEval.criteria.hasLetters ? '✓' : '•'}
                      </div>
                      <span>حروف أبجدية</span>
                    </div>

                    <div className={`flex items-center gap-1 transition-colors ${passwordEval.criteria.hasNumbers ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${passwordEval.criteria.hasNumbers ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'border-slate-600 bg-white/5'}`}>
                        {passwordEval.criteria.hasNumbers ? '✓' : '•'}
                      </div>
                      <span>أرقام (0-9)</span>
                    </div>

                    <div className={`flex items-center gap-1 transition-colors ${passwordEval.criteria.hasSpecial ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${passwordEval.criteria.hasSpecial ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'border-slate-600 bg-white/5'}`}>
                        {passwordEval.criteria.hasSpecial ? '✓' : '•'}
                      </div>
                      <span>رمز خاص (!@#$)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-tokfxe-gradient text-white text-xs font-extrabold shadow-neon-glow active:scale-98 transition-all cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جارِ المعالجة في Firebase...</span>
              </>
            ) : (
              <>
                {authModalMode === 'login' && 'تسجيل الدخول'}
                {authModalMode === 'signup' && 'إنشاء الحساب الآن'}
                {authModalMode === 'forgot' && 'إرسال رابط الاستعادة'}
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
          {authModalMode === 'login' ? (
            <p>
              ليس لديك حساب؟{' '}
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setAuthModalMode('signup');
                }}
                className="text-[#00D9FF] font-bold hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </p>
          ) : (
            <p>
              لديك حساب بالفعل؟{' '}
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setAuthModalMode('login');
                }}
                className="text-[#00D9FF] font-bold hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
