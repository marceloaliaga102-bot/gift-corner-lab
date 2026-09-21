import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, ArrowRight, X } from 'lucide-react';
import { sfx } from '../utils/audio';

interface GiftIntroOverlayProps {
  hasUser: boolean;
  onOpenRegister: () => void;
}

export const GiftIntroOverlay: React.FC<GiftIntroOverlayProps> = ({
  hasUser,
  onOpenRegister
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    // Only show if user is NOT logged in and hasn't seen the intro in this session
    if (hasUser) return;
    const seen = sessionStorage.getItem('gc_gift_intro_dismissed');
    if (!seen) {
      setIsVisible(true);
    }
  }, [hasUser]);

  if (!isVisible || hasUser) return null;

  const handleOpenGift = () => {
    if (isOpening || isOpened) return;
    setIsOpening(true);
    sfx.playChime();

    // After animation triggers
    setTimeout(() => {
      setIsOpened(true);
    }, 500);

    // Transition to registration modal after celebratory animation
    setTimeout(() => {
      sessionStorage.setItem('gc_gift_intro_dismissed', 'true');
      setIsVisible(false);
      onOpenRegister();
    }, 1500);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('gc_gift_intro_dismissed', 'true');
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fadeIn">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#7c3aed]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#c81a42]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-[#4cd7f6]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Skip Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-5 right-5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#ccc3d8] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all z-20 backdrop-blur-md"
      >
        <span>Saltar</span>
        <X className="w-4 h-4" />
      </button>

      <div className="relative w-full max-w-lg flex flex-col items-center text-center z-10">
        {/* Header Tags */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7c3aed]/30 text-[#d2bbff] text-xs font-display font-bold uppercase tracking-wider border border-[#7c3aed]/40 mb-4 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#ffb2b7]" />
          ¡Sorpresa Exclusiva para ti!
        </div>

        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
          ¡Bienvenido a <span className="bg-gradient-to-r from-[#d2bbff] via-[#ffb2b7] to-[#4cd7f6] bg-clip-text text-transparent">Gift Corner Lab</span>!
        </h2>

        <p className="text-xs sm:text-sm text-[#ccc3d8] max-w-md mb-8">
          Hemos preparado una sorpresa interactiva para darte la bienvenida. Haz clic sobre el regalo para abrirlo.
        </p>

        {/* ======================================================= */}
        {/* INTERACTIVE GIFT BOX                                     */}
        {/* ======================================================= */}
        <div
          onClick={handleOpenGift}
          className="relative group cursor-pointer select-none my-4 flex flex-col items-center justify-center"
          title="¡Haz clic para abrir el regalo!"
        >
          {/* Glowing Aura */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#7c3aed] via-[#c81a42] to-[#4cd7f6] rounded-3xl opacity-50 blur-xl group-hover:opacity-80 transition duration-500 animate-pulse pointer-events-none" />

          {/* Floating Confetti / Particles on open */}
          {isOpening && (
            <div className="absolute -top-12 z-30 flex items-center justify-center gap-3 animate-ping pointer-events-none">
              <span className="text-2xl">✨</span>
              <span className="text-3xl">🎉</span>
              <span className="text-2xl">⭐</span>
              <span className="text-3xl">💖</span>
              <span className="text-2xl">✨</span>
            </div>
          )}

          {/* Gift Container */}
          <div className={`relative w-44 h-44 sm:w-52 sm:h-52 flex flex-col items-center justify-end ${!isOpening ? 'animate-gift-bounce hover-gift-wiggle' : ''}`}>
            
            {/* GIFT LID */}
            <div className={`relative z-20 w-48 sm:w-56 h-12 rounded-2xl bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#7c3aed] border-2 border-white/30 shadow-2xl flex items-center justify-center transition-all ${
              isOpening ? 'animate-gift-lid-open' : 'group-hover:scale-105'
            }`}>
              {/* Ribbon Bow on Lid */}
              <div className="absolute -top-6 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-amber-400 border border-white/60 shadow-md -mr-1 transform -rotate-12" />
                <div className="w-5 h-5 rounded-full bg-amber-300 border border-white/60 shadow-md z-10" />
                <div className="w-7 h-7 rounded-full bg-amber-400 border border-white/60 shadow-md -ml-1 transform rotate-12" />
              </div>

              {/* Vertical ribbon on lid */}
              <div className="w-6 h-full bg-amber-400/90 border-x border-amber-200/50 shadow-inner" />
            </div>

            {/* GIFT BOX BODY */}
            <div className="relative z-10 w-44 sm:w-52 h-32 sm:h-36 -mt-2 rounded-b-2xl bg-gradient-to-b from-[#6b21a8] via-[#7c3aed] to-[#4c1d95] border-2 border-white/20 shadow-[0_20px_50px_rgba(124,58,237,0.5)] overflow-hidden flex items-center justify-center group-hover:shadow-[0_25px_60px_rgba(200,26,66,0.6)] transition-all">
              {/* Vertical Ribbon */}
              <div className="w-6 h-full bg-amber-400/90 border-x border-amber-200/50 shadow-md flex items-center justify-center">
                <Gift className="w-3.5 h-3.5 text-amber-900" />
              </div>

              {/* Horizontal Ribbon */}
              <div className="absolute inset-x-0 h-6 bg-amber-400/90 border-y border-amber-200/50 shadow-md pointer-events-none" />

              {/* Inner glow on open */}
              {isOpening && (
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-300/40 to-white/70 animate-pulse pointer-events-none" />
              )}
            </div>

            {/* Platform Shadow */}
            <div className="w-36 h-4 bg-black/60 rounded-full blur-sm mt-1" />
          </div>
        </div>

        {/* Dynamic CTA status */}
        <div className="mt-4 flex flex-col items-center gap-2">
          {isOpening ? (
            <div className="flex flex-col items-center gap-1.5 animate-fadeIn">
              <span className="text-base sm:text-lg font-bold text-amber-300 font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                ¡Sorpresa Desbloqueada!
              </span>
              <p className="text-xs text-[#d2bbff]">
                Creando tu acceso exclusivo en Gift Corner Lab...
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleOpenGift}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c81a42] hover:opacity-95 text-white text-xs sm:text-sm font-bold font-display shadow-lg hover:shadow-[#7c3aed]/50 transition-all flex items-center gap-2 group-hover:scale-105"
              >
                <span>¡Toca aquí para abrir el regalo!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-[#958da1]">
                Al abrirlo podrás crearte tu cuenta y recibir beneficios especiales.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
