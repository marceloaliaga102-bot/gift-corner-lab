import React from 'react';
import { ArrowRight, Sparkles, HeartHandshake } from 'lucide-react';
import { AppView } from '../types';

interface CreatorBannerProps {
  onNavigate: (view: AppView) => void;
}

export const CreatorBanner: React.FC<CreatorBannerProps> = ({ onNavigate }) => {
  return (
    <section className="w-full rounded-3xl bg-[#191b23]/60 backdrop-blur-2xl p-6 sm:p-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-white/5 relative overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#7c3aed]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-4 z-10">
        <div className="w-16 h-16 rounded-2xl bg-[#272a32]/80 flex items-center justify-center text-[#d2bbff] shadow-inner shrink-0 border border-white/5">
          <HeartHandshake className="w-8 h-8 text-[#d2bbff]" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7c3aed]/30 text-[#d2bbff] text-[11px] font-display font-semibold uppercase tracking-wider mb-1.5 border border-[#7c3aed]/20">
            Boutique con alma
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#e1e2ec] leading-tight">
            Hecho a mano y con código por Marcelo &amp; Angely
          </h3>
          <p className="text-sm text-[#ccc3d8] max-w-xl mt-1 leading-relaxed">
            Combinamos carpintería, diseño 3D, desarrollo web y un sentido del humor ligeramente peculiar para crear regalos inolvidables.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
        <button
          type="button"
          onClick={() => onNavigate('nosotros')}
          className="px-4 py-2.5 rounded-xl bg-[#272a32] hover:bg-[#32353d] text-[#e1e2ec] hover:text-white font-display text-xs font-semibold transition-all flex items-center gap-2 shadow-md border border-white/5"
          id="banner-nosotros-btn"
        >
          <span>Conocer Nuestra Historia</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('porque-si')}
          className="px-4 py-2.5 rounded-xl bg-[#c81a42]/70 hover:bg-[#c81a42] text-[#ffdedf] font-display text-xs font-bold transition-all flex items-center gap-1.5 shadow-md border border-[#ffb2b7]/30"
          id="banner-porquesi-btn"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>🦄 Explorar 'Porque Sí'</span>
        </button>
      </div>
    </section>
  );
};
