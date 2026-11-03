import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileText,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TokFxeLogo } from '../Common/TokFxeLogo';

interface AuthPageProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  onSuccess?: () => void;
  showGuestButton?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  showGuestButton = true,
}) => {
  const {
    loginUser,
    signupUser,
    sendPasswordReset,
    isAuthenticated,
    currentUser,
    setCurrentTab,
    showToast,
    isFirebaseConfigured,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect to feed immediately
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (onSuccess) {
        onSuccess();
      } else {
        setCurrentTab('feed');
      }
    }
  }, [isAuthenticated, currentUser, setCurrentTab, onSuccess]);

  // Reset errors when mode changes
  const switchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Real-time Password Security Criteria & Strength Evaluation
  const evaluatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9\s]/.test(pass);
    const hasMixedCase = (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) || (hasLetters && hasSpecial);

    // Calculate score (0 to 4)
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (minLength) score += 1;
    if (hasLetters && hasNumbers) score += 1;
    if (hasSpecial || hasMixedCase) score += 1;

    let text = 'أدخل كلمة مرور قوية لحماية حسابك';
    let color = 'bg-slate-700';
    let textColor = 'text-slate-400';
    let label = 'غير محدد';

    if (pass.length > 0) {
      if (score <= 1) {
        text = 'ضعيفة - لا تفي بالحد الأدنى للأمان';
        color = 'bg-red-500';
        textColor = 'text-red-400';
        label = 'ضعيفة جداً';
      } else if (score === 2) {
        text = 'مقبولة - أضف أرقاماً ورموزاً لتقويتها';
        color = 'bg-amber-400';
        textColor = 'text-amber-400';
        label = 'مقبولة';
      } else if (score === 3) {
        text = 'جيدة - تفي بمتطلبات الأمان الأساسية';
        color = 'bg-[#00D9FF]';
        textColor = 'text-[#00D9FF]';
        label = 'جيدة ومناسبة';
      } else {
        text = 'قوية وممتازة - حسابك محمي بأعلى معايير التشفير ✨';
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
      // Security Requirement: at least 8 chars, must contain letters and numbers
      isSecureEnough: minLength && hasLetters && hasNumbers,
    };
  };

  const passwordEval = evaluatePassword(password);

  // Form Validation
  const validateForm = (): boolean => {
    setErrorMessage(null);

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('يرجى إدخال عنوان بريد إلكتروني صالح.');
      return false;
    }

    // Login validation
    if (mode === 'login') {
      if (!password) {
        setErrorMessage('يرجى إدخال كلمة المرور.');
        return false;
      }
      return true;
    }

    // Forgot password validation
    if (mode === 'forgot') {
      return true;
    }

    // Signup validation
    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('يرجى كتابة الاسم الكامل.');
        return false;
      }
      if (!username.trim()) {
        setErrorMessage('يرجى كتابة اسم المستخدم.');
        return false;
      }
      if (password.length < 8) {
        setErrorMessage('يجب أن تتكون كلمة المرور من 8 خانات أو رموز على الأقل لضمان أمان حسابك.');
        return false;
      }
      if (!passwordEval.isSecureEnough) {
        setErrorMessage('كلمة المرور لا تستوفي شروط الأمان. يجب أن تحتوي على 8 خانات على الأقل وتجمع بين الحروف والأرقام.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMessage('كلمتا المرور غير متطابقتين. يرجى إعادة التحقق.');
        return false;
      }
      if (!agreeTerms) {
        setErrorMessage('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password);
        if (res.success) {
          showToast('تم تسجيل الدخول بنجاح! مرحباً بك 🚀');
          if (onSuccess) {
            onSuccess();
          } else {
            setCurrentTab('feed');
          }
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      } else if (mode === 'signup') {
        const res = await signupUser(name, username, email, password);
        if (res.success) {
          showToast('تم إنشاء حسابك وتوثيقه بنجاح عبر Firebase! 🎉');
          if (onSuccess) {
            onSuccess();
          } else {
            setCurrentTab('feed');
          }
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      } else if (mode === 'forgot') {
        const res = await sendPasswordReset(email);
        if (res.success) {
          setSuccessMessage(
            `تم إرسال رابط آمن لإعادة تعيين كلمة المرور إلى البريد (${email}). يرجى فحص صندوق الوارد أو البريد غير المرغوب به.`
          );
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#05070B] text-white flex flex-col justify-between overflow-y-auto no-scrollbar font-arabic select-none px-4 py-6 sm:py-10">
      {/* Ambient Neon Atmosphere Glow */}
      <div className="fixed top-0 right-1/4 w-96 h-96 rounded-full bg-[#00D9FF]/15 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#FF00A8]/15 blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#8A2BFF]/15 blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-lg mx-auto w-full flex items-center justify-between pb-4">
        {/* Tok Fxe Brand Logo */}
        <div className="flex items-center gap-2">
          <TokFxeLogo size="md" showArabic={true} />
        </div>

        {/* Guest Skip Option */}
        {showGuestButton && (
          <button
            onClick={() => setCurrentTab('feed')}
            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="تصفح الفيديوهات العامة كزائر"
          >
            <span>تصفح كزائر</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        )}
      </header>

      {/* Main Auth Card Container */}
      <main className="relative z-10 max-w-md mx-auto w-full my-auto">
        <div className="bg-[#0E1424]/90 backdrop-blur-2xl border border-[#00D9FF]/35 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,217,255,0.2)] text-right animate-in zoom-in-95 duration-200">
          
          {/* Subheader Title & Description */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF] text-[11px] font-bold mb-3 shadow-[0_0_12px_rgba(0,217,255,0.3)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مصادقة سحابية موثقة عبر Firebase</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide">
              {mode === 'login' && 'تسجيل الدخول إلى Tok Fxe'}
              {mode === 'signup' && 'إنشاء حساب جديد في Tok Fxe'}
              {mode === 'forgot' && 'استعادة كلمة المرور'}
            </h1>

            <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              {mode === 'login' && 'سجّل دخولك لمتابعة صانعي المحتوى والتفاعل مع الفيديوهات والبث المباشر.'}
              {mode === 'signup' && 'انضم إلى منصة الفيديوهات والبثوث المباشرة وتفاعل مع مجتمع Tok Fxe.'}
              {mode === 'forgot' && 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور فوراً.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="flex rounded-2xl bg-black/40 p-1 border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-[#00D9FF]/20 to-[#8A2BFF]/20 text-white border border-[#00D9FF]/50 shadow-[0_0_15px_rgba(0,217,255,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-[#8A2BFF]/20 to-[#FF00A8]/20 text-white border border-[#FF00A8]/50 shadow-[0_0_15px_rgba(255,0,168,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                حساب جديد
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sign Up Fields: Name & Username */}
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    الاسم الكامل <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center bg-white/5 border border-white/15 rounded-2xl px-3.5 py-3 focus-within:border-[#00D9FF] focus-within:shadow-[0_0_10px_rgba(0,217,255,0.3)] transition-all">
                    <User className="w-4 h-4 text-slate-400 ml-2.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: ياسر العنزي"
                      className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    اسم المستخدم <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center bg-white/5 border border-white/15 rounded-2xl px-3.5 py-3 focus-within:border-[#00D9FF] focus-within:shadow-[0_0_10px_rgba(0,217,255,0.3)] transition-all">
                    <span className="text-slate-400 font-mono text-xs ml-1.5 font-bold">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="yaser_fex"
                      className="w-full bg-transparent text-xs text-white font-mono focus:outline-none placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                البريد الإلكتروني <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center bg-white/5 border border-white/15 rounded-2xl px-3.5 py-3 focus-within:border-[#00D9FF] focus-within:shadow-[0_0_10px_rgba(0,217,255,0.3)] transition-all">
                <Mail className="w-4 h-4 text-slate-400 ml-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500 text-right"
                  required
                />
              </div>
            </div>

            {/* Password Field (Login & Signup) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-300">
                    كلمة المرور <span className="text-red-400">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] text-[#00D9FF] hover:underline font-bold transition-colors cursor-pointer"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>

                <div className="flex items-center bg-white/5 border border-white/15 rounded-2xl px-3.5 py-3 focus-within:border-[#00D9FF] focus-within:shadow-[0_0_10px_rgba(0,217,255,0.3)] transition-all">
                  <Lock className="w-4 h-4 text-slate-400 ml-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (6 خانات على الأقل)"
                    dir="ltr"
                    className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500 text-right"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Real-time Password Strength Meter & Security Checklist */}
                {mode === 'signup' && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 animate-in fade-in">
                    {/* Multi-segment Meter & Label */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-400 font-bold">مستوى أمان كلمة المرور:</span>
                        <span className={`font-black text-[10px] px-2 py-0.5 rounded-full ${passwordEval.textColor} bg-white/5 border border-white/10`}>
                          {password ? passwordEval.label : 'بانتظار الإدخال'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex gap-1 p-0.5">
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
                    <div className="pt-1.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                      <div className={`flex items-center gap-1.5 transition-colors ${passwordEval.criteria.minLength ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${passwordEval.criteria.minLength ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'border-slate-600 bg-white/5'}`}>
                          {passwordEval.criteria.minLength ? '✓' : '•'}
                        </div>
                        <span>8 خانات أو أكثر</span>
                      </div>

                      <div className={`flex items-center gap-1.5 transition-colors ${passwordEval.criteria.hasLetters ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${passwordEval.criteria.hasLetters ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'border-slate-600 bg-white/5'}`}>
                          {passwordEval.criteria.hasLetters ? '✓' : '•'}
                        </div>
                        <span>أحرف أبجدية (A-Z أو عربي)</span>
                      </div>

                      <div className={`flex items-center gap-1.5 transition-colors ${passwordEval.criteria.hasNumbers ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${passwordEval.criteria.hasNumbers ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'border-slate-600 bg-white/5'}`}>
                          {passwordEval.criteria.hasNumbers ? '✓' : '•'}
                        </div>
                        <span>أرقام (0-9)</span>
                      </div>

                      <div className={`flex items-center gap-1.5 transition-colors ${passwordEval.criteria.hasSpecial ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${passwordEval.criteria.hasSpecial ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'border-slate-600 bg-white/5'}`}>
                          {passwordEval.criteria.hasSpecial ? '✓' : '•'}
                        </div>
                        <span>رمز خاص اختياري (!@#$)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  تأكيد كلمة المرور <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center bg-white/5 border border-white/15 rounded-2xl px-3.5 py-3 focus-within:border-[#00D9FF] focus-within:shadow-[0_0_10px_rgba(0,217,255,0.3)] transition-all">
                  <KeyRound className="w-4 h-4 text-slate-400 ml-2.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    dir="ltr"
                    className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500 text-right"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Match Status */}
                {confirmPassword.length > 0 && (
                  <span
                    className={`text-[10px] mt-1 block font-bold ${
                      password === confirmPassword ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {password === confirmPassword ? '✓ كلمتا المرور متطابقتان' : '✗ كلمتا المرور غير متطابقتين'}
                  </span>
                )}
              </div>
            )}

            {/* Terms of Service Checkbox (Signup only) */}
            {mode === 'signup' && (
              <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-[#00D9FF] cursor-pointer shrink-0"
                  required
                />
                <span className="text-[11px] leading-relaxed text-slate-400">
                  أوافق على <span className="text-white font-bold hover:underline">شروط الاستخدام</span> و{' '}
                  <span className="text-white font-bold hover:underline">سياسة الخصوصية</span> الخاصة بمنصة Tok Fxe.
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#8A2BFF] to-[#FF00A8] text-white text-xs font-black shadow-[0_0_25px_rgba(0,217,255,0.4)] active:scale-98 transition-all cursor-pointer mt-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارِ الاتصال بـ Firebase...</span>
                </>
              ) : (
                <>
                  {mode === 'login' && 'تسجيل الدخول'}
                  {mode === 'signup' && 'إنشاء الحساب الآن'}
                  {mode === 'forgot' && 'إرسال رابط استعادة كلمة المرور'}
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher Footer */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-slate-400">
            {mode === 'login' && (
              <p>
                ليس لديك حساب؟{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-[#00D9FF] font-bold hover:underline transition-colors cursor-pointer"
                >
                  إنشاء حساب جديد
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#00D9FF] font-bold hover:underline transition-colors cursor-pointer"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p>
                تذكرت كلمة المرور؟{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#00D9FF] font-bold hover:underline transition-colors cursor-pointer"
                >
                  العودة لتسجيل الدخول
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 max-w-lg mx-auto w-full text-center pt-6 text-[11px] text-slate-500">
        <p>© 2026 Tok Fxe - منصة التواصل الاجتماعي والفيديوهات القصيرة</p>
      </footer>
    </div>
  );
};
