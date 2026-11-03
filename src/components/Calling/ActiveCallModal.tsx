import React, { useRef, useEffect, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, ShieldCheck, Wifi } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ActiveCallModal: React.FC = () => {
  const { activeCall, endCall, toggleCallMute, toggleCallCamera } = useApp();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  // Attach local media stream to local video element
  useEffect(() => {
    if (localVideoRef.current && activeCall?.localStream) {
      localVideoRef.current.srcObject = activeCall.localStream;
      localVideoRef.current.play().catch((e) => console.warn('[Tok Fxe] Local video play notice:', e));
    }
  }, [activeCall?.localStream]);

  // Attach remote media stream to remote video element
  useEffect(() => {
    if (remoteVideoRef.current && activeCall?.remoteStream) {
      remoteVideoRef.current.srcObject = activeCall.remoteStream;
      remoteVideoRef.current.play().catch((e) => console.warn('[Tok Fxe] Remote video play notice:', e));
      const videoTracks = activeCall.remoteStream.getVideoTracks();
      setHasRemoteVideo(videoTracks.length > 0 && videoTracks[0].enabled);
    } else {
      setHasRemoteVideo(false);
    }
  }, [activeCall?.remoteStream]);

  if (!activeCall || activeCall.isIncoming) return null;

  const mins = Math.floor(activeCall.durationSeconds / 60);
  const secs = activeCall.durationSeconds % 60;
  const timeFormatted = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#07090E] flex flex-col justify-between p-6 select-none animate-in fade-in duration-200">
      {/* Top Details & Encryption Badge */}
      <div className="flex flex-col items-center pt-4 text-center space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 font-mono">
            {timeFormatted}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] text-[10px] font-bold border border-[#00D9FF]/20">
            <ShieldCheck className="w-3 h-3" />
            <span>WebRTC P2P</span>
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-white font-heading mt-2">
          {activeCall.partner.name}
        </h3>
        <span className="text-xs text-slate-400 font-mono">@{activeCall.partner.username}</span>
        <span className="text-[11px] text-[#00D9FF] flex items-center justify-center gap-1">
          <Wifi className="w-3 h-3 animate-pulse" />
          {activeCall.isConnecting
            ? 'جارِ مصافحة WebRTC وتبادل حزم ICE... 📡'
            : activeCall.callType === 'video'
            ? 'مكالمة فيديو مشفرة مباشرة 📹'
            : 'مكالمة صوتية عالية النقاء 🎙️'}
        </span>
      </div>

      {/* Center Media View: Real WebRTC Video or Audio Visualizer */}
      <div className="flex-1 flex items-center justify-center py-4">
        {activeCall.callType === 'video' ? (
          <div className="relative w-full max-w-sm aspect-9/14 rounded-3xl overflow-hidden bg-slate-950 border border-white/20 shadow-2xl flex items-center justify-center">
            {/* Remote Peer Video Stream */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                hasRemoteVideo ? 'opacity-100' : 'opacity-0 absolute'
              }`}
            />

            {/* Placeholder if remote camera stream is pending or voice only */}
            {!hasRemoteVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0E1424] via-[#07090E] to-[#120B20] p-6 text-center">
                <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#00D9FF] to-[#8A2BFF] shadow-neon-glow mb-4">
                  <img
                    src={activeCall.partner.avatar}
                    alt={activeCall.partner.name}
                    className="w-full h-full rounded-full object-cover border-2 border-[#07090E]"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#07090E]" />
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  {activeCall.isConnecting ? 'جارِ تهيئة البث المباشر...' : activeCall.partner.name}
                </p>
                <p className="text-xs text-slate-400">
                  {activeCall.isConnecting ? 'تبادل إشارات الكاميرا والصوت...' : 'كاميرا الطرف الآخر غير مفعلة'}
                </p>
              </div>
            )}

            {/* Self Camera Floating Picture-in-Picture */}
            {!activeCall.isCameraOff && (
              <div className="absolute top-4 right-4 w-24 h-36 rounded-2xl overflow-hidden border-2 border-[#00D9FF]/70 bg-black shadow-xl z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted // Local video must be muted to avoid echo loop
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                  أنت
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Voice Call Visualizer */
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#00D9FF] via-[#8A2BFF] to-[#FE2C55] shadow-neon-glow mb-6">
              <img
                src={activeCall.partner.avatar}
                alt={activeCall.partner.name}
                className="w-full h-full rounded-full object-cover border-4 border-[#07090E]"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#07090E]" />
            </div>

            {/* Pulsing Audio Waveform */}
            <div className="flex items-center gap-1.5 h-10">
              {[40, 70, 100, 60, 90, 45, 80, 55, 95, 60].map((h, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-gradient-to-t from-[#00D9FF] to-[#8A2BFF] rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${idx * 0.15}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-6 pb-6">
        {/* Mute Mic */}
        <button
          onClick={toggleCallMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            activeCall.isMuted
              ? 'bg-[#FE2C55] border-[#FE2C55] text-white shadow-[0_0_15px_rgba(254,44,85,0.5)]'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          }`}
          title={activeCall.isMuted ? 'إلغاء كتم الميكروفون' : 'كتم الميكروفون'}
        >
          {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={endCall}
          className="w-18 h-18 rounded-full bg-red-600 border border-red-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.7)] active:scale-90 transition-transform cursor-pointer"
          title="إنهاء المكالمة"
        >
          <PhoneOff className="w-8 h-8" />
        </button>

        {/* Camera Toggle for Video */}
        {activeCall.callType === 'video' ? (
          <button
            onClick={toggleCallCamera}
            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              activeCall.isCameraOff
                ? 'bg-[#FE2C55] border-[#FE2C55] text-white shadow-[0_0_15px_rgba(254,44,85,0.5)]'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
            title="الكاميرا"
          >
            {activeCall.isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        ) : (
          <button
            className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
            title="مكبر الصوت"
          >
            <Volume2 className="w-6 h-6 text-[#00D9FF]" />
          </button>
        )}
      </div>
    </div>
  );
};
