import { Phone, PhoneOff } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function FakeCallModal({ onClose }) {
  const audioRef = useRef(null);

  useEffect(() => {
    // Attempt to auto-play the audio when modal mounts
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(err => console.log('Audio autoplay blocked by browser', err));
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Hidden audio element for the ringtone */}
      <audio 
        ref={audioRef} 
        loop 
        // Using a generic public domain/royalty-free ringtone placeholder
        src="https://actions.google.com/sounds/v1/alarms/phone_ringing.ogg" 
      />

      <div className="w-full h-full sm:w-[400px] sm:h-[850px] sm:max-h-[90vh] bg-gradient-to-b from-[#1C1C1E] to-[#000000] sm:rounded-[50px] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col pt-20 pb-12 sm:border-[8px] border-[#333333]">
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-3xl"></div>

        <div className="flex flex-col items-center mt-6 px-6 text-center animate-in slide-in-from-top-8 duration-500">
          <h2 className="text-white text-[42px] font-light tracking-wide">Mom</h2>
          <p className="text-slate-400 text-[18px] mt-1 font-normal">mobile</p>
        </div>

        <div className="flex justify-between px-16 mt-auto mb-20 text-white text-[15px] font-medium">
          <div className="flex flex-col items-center gap-3 cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
            <ClockIcon />
            <span>Remind Me</span>
          </div>
          <div className="flex flex-col items-center gap-3 cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
            <MessageIcon />
            <span>Message</span>
          </div>
        </div>

        <div className="flex justify-between px-14 mb-10 animate-in slide-in-from-bottom-10 duration-500 delay-150">
          <button onClick={onClose} className="flex flex-col items-center gap-4 group">
            <div className="w-[76px] h-[76px] rounded-full bg-[#FF3B30] flex items-center justify-center transition-all active:scale-95 hover:brightness-110 shadow-lg shadow-red-500/20">
              <PhoneOff size={36} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-white text-[17px] font-medium">Decline</span>
          </button>

          <button onClick={onClose} className="flex flex-col items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-[-20px] bg-[#34C759] rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-[-10px] bg-[#34C759] rounded-full animate-pulse opacity-40"></div>
              <div className="relative w-[76px] h-[76px] rounded-full bg-[#34C759] flex items-center justify-center transition-all active:scale-95 hover:brightness-110 shadow-lg shadow-green-500/20">
                <Phone size={36} className="text-white fill-current" strokeWidth={1} />
              </div>
            </div>
            <span className="text-white text-[17px] font-medium">Accept</span>
          </button>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/30 rounded-full"></div>
      </div>
    </div>
  );
}

const ClockIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MessageIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
