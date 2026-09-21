import React, { useState } from 'react';
import { Sparkles, Gift, ArrowRight } from 'lucide-react';
import { sfx } from '../utils/audio';

interface GiftIntroOverlayProps {
  hasUser: boolean;
  onOpenRegister: () => void;
  onGiftOpened?: () => void;
}

export const GiftIntroOverlay: React.FC<GiftIntroOverlayProps> = ({
  hasUser,
  onOpenRegister,
  onGiftOpened
}) => {
  // Always visible on page load/reload as requested
  const [isVisible, setIsVisible] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);

  if (!isVisible) return null;

  const handleOpenGift = () => {
    if (isOpening || isOpened) return;
    setIsOpening(true);
    sfx.playChime();

    // Trigger open state
    setTimeout(() => {
      setIsOpened(true);
    }, 450);

    // After animation, reveal the page and trigger account modal if guest
    setTimeout(() => {
      setIsVisible(false);
      if (onGiftOpened) onGiftOpened();
      if (!hasUser) {
        onOpenRegister();
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fadeIn select-none">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c3aed]/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c81a42]/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-[#4cd7f6]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg flex flex-col items-center text-center z-10">
        {/* Header Tags */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7c3aed]/30 text-[#d2bbff] text-xs font-display font-bold uppercase tracking-wider border border-[#7c3aed]/40 mb-4 shadow-[0_0_20px_rgba(124,58,237,0.4)] animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#ffb2b7] animate-spin" />
          ¡Sorpresa Exclusiva de Bienvenida!
        </div>

        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
          ¡Bienvenido a <span className="bg-gradient-to-r from-[#d2bbff] via-[#ffb2b7] to-[#4cd7f6] bg-clip-text text-transparent">Gift Corner Lab</span>!
        </h2>

        <p className="text-xs sm:text-sm text-[#ccc3d8] max-w-md mb-8 leading-relaxed">
          Para ingresar a la tienda y descubrir todos nuestros productos y detalles, toca el regalo sorpresa.
        </p>

        {/* ======================================================= */}
        {/* INTERACTIVE GIFT BOX                                     */}
        {/* ======================================================= */}
        <div
          onClick={handleOpenGift}
          className="relative group cursor-pointer select-none my-4 flex flex-col items-center justify-center"
          title="¡Haz clic para abrir el regalo y entrar a la tienda!"
        >
          {/* Glowing Aura */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#7c3aed] via-[#c81a42] to-[#4cd7f6] rounded-3xl opacity-60 blur-xl group-hover:opacity-95 transition duration-500 animate-pulse pointer-events-none" />

          {/* Floating Confetti / Particles on open */}
          {isOpening && (
            <div className="absolute -top-14 z-30 flex items-center justify-center gap-3 animate-ping pointer-events-none">
              <span className="text-3xl">✨</span>
              <span className="text-4xl">🎉</span>
              <span className="text-3xl">⭐</span>
              <span className="text-4xl">💖</span>
              <span className="text-3xl">✨</span>
            </div>
          )}

          {/* Gift Container */}
          <div className={`relative w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-end ${!isOpening ? 'animate-gift-bounce hover-gift-wiggle' : ''}`}>
            
            {/* GIFT LID */}
            <div className={`relative z-20 w-52 sm:w-60 h-14 rounded-2xl bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#7c3aed] border-2 border-white/40 shadow-2xl flex items-center justify-center transition-all ${
              isOpening ? 'animate-gift-lid-open' : 'group-hover:scale-105'
            }`}>
              {/* Ribbon Bow on Lid */}
              <div className="absolute -top-7 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-amber-400 border border-white/60 shadow-md -mr-1.5 transform -rotate-12" />
                <div className="w-6 h-6 rounded-full bg-amber-300 border border-white/60 shadow-md z-10" />
                <div className="w-8 h-8 rounded-full bg-amber-400 border border-white/60 shadow-md -ml-1.5 transform rotate-12" />
              </div>

              {/* Vertical ribbon on lid */}
              <div className="w-7 h-full bg-amber-400/90 border-x border-amber-200/60 shadow-inner" />
            </div>

            {/* GIFT BOX BODY */}
            <div className="relative z-10 w-48 sm:w-56 h-36 sm:h-40 -mt-2 rounded-b-2xl bg-gradient-to-b from-[#6b21a8] via-[#7c3aed] to-[#4c1d95] border-2 border-white/30 shadow-[0_20px_60px_rgba(124,58,237,0.6)] overflow-hidden flex items-center justify-center group-hover:shadow-[0_25px_70px_rgba(200,26,66,0.7)] transition-all">
              {/* Vertical Ribbon */}
              <div className="w-7 h-full bg-amber-400/90 border-x border-amber-200/60 shadow-md flex items-center justify-center">
                <Gift className="w-4 h-4 text-amber-900 animate-pulse" />
              </div>

              {/* Horizontal Ribbon */}
              <div className="absolute inset-x-0 h-7 bg-amber-400/90 border-y border-amber-200/60 shadow-md pointer-events-none" />

              {/* Inner glow on open */}
              {isOpening && (
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-300/50 to-white/90 animate-pulse pointer-events-none" />
              )}
            </div>

            {/* Platform Shadow */}
            <div className="w-40 h-4 bg-black/70 rounded-full blur-sm mt-1" />
          </div>
        </div>

        {/* Dynamic CTA status */}
        <div className="mt-4 flex flex-col items-center gap-2">
          {isOpening ? (
            <div className="flex flex-col items-center gap-1.5 animate-fadeIn">
              <span className="text-lg sm:text-xl font-bold text-amber-300 font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                ¡Bienvenido a Gift Corner Lab!
              </span>
              <p className="text-xs text-[#d2bbff]">
                Cargando tu experiencia interactiva...
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleOpenGift}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c81a42] hover:opacity-95 text-white text-xs sm:text-sm font-bold font-display shadow-lg hover:shadow-[#7c3aed]/50 transition-all flex items-center gap-2 group-hover:scale-105 cursor-pointer"
              >
                <span>¡Haz clic en el regalo para ingresar!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-[#958da1]">
                Toca la caja de regalo para descubrir la boutique.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
