import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Music2,
  RefreshCw,
  Zap,
  Clock,
  Sparkles,
  Upload,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  FileText,
  Lock,
  Globe,
  Users,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CreateModal: React.FC = () => {
  const { setCurrentTab, addNewVideo, showToast } = useApp();

  const [createMode, setCreateMode] = useState<'video' | 'photo' | 'thought'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [timerDuration, setTimerDuration] = useState<number>(15);
  const [activeSpeed, setActiveSpeed] = useState<string>('1x');
  const [activeFilter, setActiveFilter] = useState<string>('neon');
  const [flashOn, setFlashOn] = useState(false);
  const [caption, setCaption] = useState('');
  const [thoughtText, setThoughtText] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [isReadyToPost, setIsReadyToPost] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const recordIntervalRef = useRef<number | null>(null);

  // Filter styles
  const filterStyles: Record<string, string> = {
    none: 'filter-none',
    neon: 'contrast-125 saturate-150 hue-rotate-15',
    sunset: 'sepia-40 contrast-110 saturate-125 hue-rotate-340',
    cyber: 'contrast-130 saturate-200 hue-rotate-180',
    mono: 'grayscale contrast-125',
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordProgress(0);
    const interval = 100;
    const totalMs = timerDuration * 1000;

    recordIntervalRef.current = window.setInterval(() => {
      setRecordProgress((prev) => {
        const next = prev + (interval / totalMs) * 100;
        if (next >= 100) {
          stopRecording();
          return 100;
        }
        return next;
      });
    }, interval);
  };

  const stopRecording = () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    setIsRecording(false);
    setIsReadyToPost(true);
    showToast('تم التقاط الفيديو بنجاح! جاهز للنشر');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedMediaUrl(url);
      setIsReadyToPost(true);
      showToast(`تم رفع ملف: ${file.name}`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        urls.push(URL.createObjectURL(files[i]));
      }
      setUploadedPhotos(urls);
      setUploadedMediaUrl(urls[0]);
      setIsReadyToPost(true);
      showToast(`تم اختيار ${urls.length} صور للألبوم 📸`);
    }
  };

  const handlePost = () => {
    if (createMode === 'thought') {
      if (!thoughtText.trim()) {
        showToast('يرجى كتابة نص المنشور');
        return;
      }
      addNewVideo({
        caption: thoughtText,
        textContent: thoughtText,
        mediaType: 'text',
        posterUrl: '/src/assets/images/fextok_explore_banner_1793478781984.jpg',
        musicTitle: 'خواطر نيون هادئة - Tok Fxe',
        hashtags: ['#TokFxe', '#خواطر', '#منشور'],
        privacy,
      });
      return;
    }

    if (createMode === 'photo') {
      addNewVideo({
        caption: caption || 'ألبوم صور جديد على Tok Fxe 📸✨ #TokFxe',
        mediaType: 'image',
        posterUrl: uploadedPhotos[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : [
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        ],
        musicTitle: 'أجواء تصوير احترافي - Tok Fxe',
        hashtags: ['#TokFxe', '#تصوير', '#ألبوم_صور'],
        privacy,
      });
      return;
    }

    // Video Post
    addNewVideo({
      caption: caption || 'تحدي جديد مع Tok Fxe 🚀✨ #TokFxe',
      videoUrl: uploadedMediaUrl || '/videos/fextok_cyber_city.mp4',
      posterUrl: '/posters/fextok_cyber_city.jpg',
      musicTitle: 'الصوت الأصلي - أحدث صوت ترند',
      mediaType: 'video',
      hashtags: ['#TokFxe', '#ترند', '#إبداع'],
      privacy,
    });
  };

  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between w-full h-full overflow-hidden select-none">
      {/* Viewfinder Canvas / Camera Simulation or Mode UI */}
      <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${filterStyles[activeFilter]}`}>
        {createMode === 'thought' ? (
          /* Text Post Canvas */
          <div className="w-full h-full bg-gradient-to-br from-[#07090E] via-[#0E131F] to-[#1F293D] p-6 flex flex-col items-center justify-center text-center">
            <div className="max-w-xs w-full p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-4">
              <span className="text-xs text-[#00F2FE] font-bold block">مشاركة خاطرة أو فكرة ✍️</span>
              <textarea
                value={thoughtText}
                onChange={(e) => {
                  setThoughtText(e.target.value);
                  setIsReadyToPost(Boolean(e.target.value.trim()));
                }}
                placeholder="ما الذي يجول في خاطرك اليوم؟ شارك أفكارك مع مجتمع Tok Fxe..."
                rows={5}
                className="w-full bg-black/40 border border-white/15 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F2FE] resize-none"
              />
            </div>
          </div>
        ) : uploadedMediaUrl ? (
          createMode === 'video' ? (
            <video
              ref={videoPreviewRef}
              src={uploadedMediaUrl}
              autoPlay
              loop
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={uploadedMediaUrl}
                alt="Selected preview"
                className="w-full h-full object-contain"
              />
              {uploadedPhotos.length > 1 && (
                <div className="absolute top-16 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20">
                  <Layers className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span>{uploadedPhotos.length} صور في الألبوم</span>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="relative w-full h-full bg-radial from-[#121829] via-[#07090E] to-black flex items-center justify-center">
            {/* Viewfinder Grid Guidelines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div />
            </div>

            {/* Glowing neon camera reticle */}
            <div className={`relative w-48 h-48 rounded-full border-2 border-dashed ${isRecording ? 'border-[#FE2C55] animate-pulse' : 'border-[#00F2FE]/40'} flex items-center justify-center`}>
              <Film className="w-12 h-12 text-slate-500/50" />
            </div>
          </div>
        )}

        {/* Top Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={() => setCurrentTab('feed')}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Sound Picker Pill */}
          <button
            onClick={() => showToast('اختيار نغمات وأصوات Tok Fxe')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs text-white font-bold hover:border-[#00F2FE] transition-colors cursor-pointer"
          >
            <Music2 className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>إضافة صوت وموسيقى</span>
          </button>

          <div className="w-9" />
        </div>

        {/* Right Camera Tools Rail (in video mode) */}
        {createMode === 'video' && (
          <div className="absolute top-16 left-4 z-20 flex flex-col gap-4 bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                setFlashOn(!flashOn);
                showToast(flashOn ? 'إطفاء الفلاش' : 'تشغيل الفلاش ⚡');
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${flashOn ? 'text-[#00F2FE]' : 'text-white'} cursor-pointer`}
              title="فلاش"
            >
              <Zap className="w-4 h-4" />
            </button>

            <button
              onClick={() => showToast('تبديل الكاميرا (أمامية / خلفية)')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:text-[#00F2FE] cursor-pointer"
              title="تبديل الكاميرا"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const nextTimer = timerDuration === 15 ? 60 : timerDuration === 60 ? 180 : 15;
                setTimerDuration(nextTimer);
                showToast(`مدة الفيديو: ${nextTimer} ثانية`);
              }}
              className="w-9 h-9 rounded-full flex flex-col items-center justify-center text-white cursor-pointer"
              title="مدة الفيديو"
            >
              <Clock className="w-4 h-4" />
              <span className="text-[9px] font-mono mt-0.5">{timerDuration}s</span>
            </button>

            <button
              onClick={() => {
                const filters = ['none', 'neon', 'sunset', 'cyber', 'mono'];
                const nextIdx = (filters.indexOf(activeFilter) + 1) % filters.length;
                setActiveFilter(filters[nextIdx]);
                showToast(`فلتر: ${filters[nextIdx]}`);
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:text-[#FE2C55] cursor-pointer"
              title="الفلاتر والمؤثرات"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Speed Selector (in video mode) */}
        {createMode === 'video' && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
            {['0.5x', '1x', '2x'].map((spd) => (
              <button
                key={spd}
                onClick={() => setActiveSpeed(spd)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeSpeed === spd
                    ? 'bg-white text-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>
        )}

        {/* Progress Bar during recording */}
        {isRecording && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800 z-30">
            <div
              className="h-full bg-[#FE2C55] transition-all"
              style={{ width: `${recordProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Mode Selector Tabs: فيديو | ألبوم صور | منشور نصي */}
      {!isReadyToPost && (
        <div className="bg-[#07090E]/90 border-t border-white/10 py-2 flex items-center justify-center gap-4 z-20">
          <button
            onClick={() => {
              setCreateMode('video');
              setUploadedMediaUrl(null);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              createMode === 'video'
                ? 'bg-[#FE2C55] text-white shadow-[0_0_10px_rgba(254,44,85,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>فيديو</span>
          </button>

          <button
            onClick={() => {
              setCreateMode('photo');
              photoInputRef.current?.click();
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              createMode === 'photo'
                ? 'bg-[#00F2FE] text-[#07090E] font-black shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>ألبوم صور</span>
          </button>

          <button
            onClick={() => {
              setCreateMode('thought');
              setUploadedMediaUrl(null);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              createMode === 'thought'
                ? 'bg-[#7928CA] text-white shadow-[0_0_10px_rgba(121,40,202,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>منشور نصي</span>
          </button>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Bottom Control Bar or Post Drawer */}
      <div className="bg-[#07090E] p-4 border-t border-white/10 z-20">
        {!isReadyToPost ? (
          createMode === 'video' ? (
            <div className="flex items-center justify-around">
              {/* Upload from device */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1 text-slate-300 hover:text-white min-h-[44px] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[#00F2FE]" />
                </div>
                <span className="text-[11px]">تحميل</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </button>

              {/* Big Record Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className="relative group p-1 min-h-[64px] min-w-[64px] flex items-center justify-center focus:outline-none cursor-pointer"
              >
                <div className="w-18 h-18 rounded-full border-4 border-white/40 flex items-center justify-center p-1">
                  <div
                    className={`transition-all duration-200 ${
                      isRecording
                        ? 'w-8 h-8 rounded-md bg-[#FE2C55]'
                        : 'w-14 h-14 rounded-full bg-[#FE2C55] shadow-neon-glow group-hover:scale-105'
                    }`}
                  />
                </div>
              </button>

              {/* Effects Shortcut */}
              <button
                onClick={() => showToast('المؤثرات الذكية قيد التشغيل ✨')}
                className="flex flex-col items-center gap-1 text-slate-300 hover:text-white min-h-[44px] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#FE2C55]" />
                </div>
                <span className="text-[11px]">مؤثرات</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-xs text-slate-400">
                {createMode === 'photo'
                  ? 'اضغط زر (ألبوم صور) بالأعلى لاختيار الصور من هاتفك'
                  : 'اكتب رسالتك أو خاطرتك في المربع أعلاه ثم اضغط نشر'}
              </span>
            </div>
          )
        ) : (
          /* Post Confirmation Form with Privacy Controls */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">إعدادات النشر والخصوصية</h4>
              </div>

              {/* Privacy Selector */}
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    privacy === 'public'
                      ? 'bg-[#00F2FE] text-[#07090E]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="عام"
                >
                  <Globe className="w-3 h-3" />
                  <span>عام</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacy('followers')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    privacy === 'followers'
                      ? 'bg-[#7928CA] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="المتابعون فقط"
                >
                  <Users className="w-3 h-3" />
                  <span>المتابعون</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    privacy === 'private'
                      ? 'bg-amber-500 text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="خاص بي فقط"
                >
                  <Lock className="w-3 h-3" />
                  <span>خاص</span>
                </button>
              </div>
            </div>

            {createMode !== 'thought' && (
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="اكتب وصفاً جذاباً للمحتوى... #TokFxe #ترند"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00F2FE]"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsReadyToPost(false);
                  setUploadedMediaUrl(null);
                  setUploadedPhotos([]);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-bold hover:bg-white/15 cursor-pointer"
              >
                إلغاء وإعادة
              </button>
              <button
                onClick={handlePost}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#7928CA] to-[#FE2C55] text-white text-xs font-bold shadow-neon-glow active:scale-98 cursor-pointer"
              >
                نشر الآن 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
