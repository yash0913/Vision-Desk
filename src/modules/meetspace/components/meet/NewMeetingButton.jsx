import React from 'react';
import { Video } from 'lucide-react';

export default function NewMeetingButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-44 w-44 flex-col items-center justify-center gap-3 overflow-hidden rounded-[2rem] 
                 bg-gradient-to-br from-orange-400 via-orange-600 to-rose-700 
                 p-1 transition-all duration-300 hover:scale-[1.05] active:scale-95
                 border-t border-white/30 shadow-[0_20px_40px_-15px_rgba(234,88,12,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)]"
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
        <Video className="h-9 w-9 text-white filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
      </div>

      <div className="relative z-10 text-center">
        <span className="block text-lg font-bold tracking-tight text-white leading-tight">New meeting</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-orange-100/60 font-medium">instant room</span>
      </div>
    </button>
  );
}