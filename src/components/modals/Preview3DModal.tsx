import React, { useState } from 'react';
import { X, Heart, Sparkles, Volume2, CheckCircle } from 'lucide-react';
import { sfx } from '../../utils/audio';

interface Preview3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
}

export const Preview3DModal: React.FC<Preview3DModalProps> = ({
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<number | null>(null);

  if (!isOpen) return null;

  const coupons = [
    { title: '💆‍♂️ Masaje Relajante de 30 min', desc: 'Canjeable en cualquier momento, incluye aceites aromáticos.' },
    { title: '🍝 Cena Romántica Especial', desc: 'Tú eliges el restaurante o cocino tu plato favorito.' },
    { title: '🍿 Noche de Cine & Snacks Infinitos', desc: 'Tú tienes el control remoto total durante toda la velada.' },
  ];

  const handleOpenEnvelope = () => {
    sfx.playChime();
    setIsOpened(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#191b23] border border-[#7c3aed]/40 p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col items-center text-center">
        
        {/* Ambient Backlight */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#7c3aed]/30 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#272a32] text-[#e1e2ec] hover:bg-[#32353d] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#4cd7f6]" />
          Simulador 3D en Vivo
        </div>
        <h2 className="font-display text-2xl font-bold text-[#e1e2ec] mb-1">
          Cuponera de Amor Interactiva &amp; Carta 3D
        </h2>
        <p className="text-xs text-[#ccc3d8] max-w-md mb-6">
          Así es exactamente como tu persona especial experimentará el enlace interactivo desde su teléfono o computador.
        </p>

        {/* The Envelope / 3D Stage */}
        <div className="w-full max-w-md min-h-[300px] flex flex-col items-center justify-center relative p-6 bg-[#0b0e15]/90 rounded-2xl border border-white/10 shadow-inner">
          {!isOpened ? (
            <div className="flex flex-col items-center gap-4 animate-bounce-short">
              {/* Closed Envelope Mockup */}
              <div
                onClick={handleOpenEnvelope}
                className="w-48 h-32 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#3f008e] shadow-2xl flex flex-col items-center justify-center cursor-pointer border border-white/20 hover:scale-105 transition-transform relative group"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-1">
                  <Heart className="w-6 h-6 fill-rose-400 text-rose-400 animate-pulse" />
                </div>
                <span className="font-display text-xs font-bold text-white tracking-wide">
                  Para ti con amor ❤️
                </span>
                <span className="text-[10px] text-[#d2bbff] mt-1 group-hover:underline">
                  Haz clic para abrir el sobre
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpenEnvelope}
                className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold font-display shadow-lg hover:bg-[#732ee4] transition-all"
              >
                Abrir Sobre 3D
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-4 animate-fadeIn">
              {/* Unfolded Letter */}
              <div className="w-full p-4 rounded-xl bg-[#191b23] border border-[#ffb2b7]/30 text-left shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="font-display text-xs font-bold text-[#ffb2b7] flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-[#ffb2b7]" /> Carta Dedicatoria
                  </span>
                  <span className="text-[10px] text-[#958da1] flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-[#4cd7f6]" /> Música activa
                  </span>
                </div>
                <p className="text-xs text-[#e1e2ec] italic leading-relaxed">
                  "Gracias por cada risa, cada paseo y por estar siempre ahí. Estos cupones son solo una excusa para seguir coleccionando momentos juntos..."
                </p>
              </div>

              {/* Coupons Picker */}
              <div className="w-full flex flex-col gap-2">
                <span className="text-[11px] text-[#958da1] text-left block font-semibold">
                  Cupones Interactivos Canjeables (Haz clic para probar):
                </span>
                {coupons.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      sfx.playClick();
                      setSelectedCoupon(selectedCoupon === i ? null : i);
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedCoupon === i
                        ? 'bg-[#7c3aed]/30 border-[#7c3aed] text-white'
                        : 'bg-[#272a32]/60 border-white/5 text-[#ccc3d8] hover:bg-[#272a32]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{c.title}</span>
                      {selectedCoupon === i && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    {selectedCoupon === i && (
                      <p className="text-[10px] text-[#d2bbff] mt-1">{c.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal CTA */}
        <div className="flex items-center gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#272a32] text-xs font-semibold text-[#ccc3d8] hover:text-white"
          >
            Cerrar Vista Previa
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.playChime();
              onAddToCart();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#732ee4] text-white font-display text-xs font-bold shadow-lg"
          >
            Añadir al Carrito ($9.99)
          </button>
        </div>
      </div>
    </div>
  );
};
