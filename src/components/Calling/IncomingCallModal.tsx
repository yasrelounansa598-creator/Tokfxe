import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IncomingCallModal: React.FC = () => {
  const { incomingCall, answerCall, rejectCall } = useApp();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0E1424] border border-[#00F2FE]/40 rounded-3xl p-6 shadow-neon-glow text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="relative w-24 h-24 rounded-full p-1 bg-neon-gradient shadow-neon-glow mx-auto animate-bounce">
          <img
            src={incomingCall.partner.avatar}
            alt={incomingCall.partner.name}
            className="w-full h-full rounded-full object-cover border-2 border-[#0E1424]"
          />
        </div>

        <div>
          <h3 className="text-lg font-black text-white font-heading">{incomingCall.partner.name}</h3>
          <span className="text-xs text-slate-400 font-mono">@{incomingCall.partner.username}</span>
          <p className="text-xs text-[#00F2FE] font-bold mt-2 animate-pulse flex items-center justify-center gap-1.5">
            {incomingCall.callType === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            <span>مكالمة {incomingCall.callType === 'video' ? 'فيديو' : 'صوتية'} واردة...</span>
          </p>
        </div>

        {/* Buttons: Accept / Decline */}
        <div className="flex items-center justify-around pt-4">
          <button
            onClick={rejectCall}
            className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
            title="رفض"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          <button
            onClick={answerCall}
            className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.6)] active:scale-90 transition-transform cursor-pointer animate-pulse"
            title="رد"
          >
            <Phone className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
