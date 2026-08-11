import React from "react";

interface BackButtonProps {
  onClick: () => void;
}

// Exit-to-idle button, top-left of the HUD nav bar.
const BackButton: React.FC<BackButtonProps> = ({ onClick }) => (
  <div className="pointer-events-auto">
    <button
      onClick={onClick}
      className="flex items-center justify-center p-2 md:p-2.5 rounded-full bg-slate-900/90 border border-slate-700/50 backdrop-blur-md text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-xl hover:border-slate-600"
      title="Exit to main menu"
    >
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    </button>
  </div>
);

export default BackButton;
