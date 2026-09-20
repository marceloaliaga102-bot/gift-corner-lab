import React from 'react';
import { ProductCategory } from '../types';
import { Truck, Zap, ShieldCheck } from 'lucide-react';

interface HeroProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onNavigateToPorqueSi: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  selectedCategory,
  onSelectCategory,
  onNavigateToPorqueSi
}) => {
  return (
    <section className="relative w-full py-10 lg:py-14 overflow-hidden rounded-3xl bg-[#0b0e15]/60 backdrop-blur-3xl border border-white/5 shadow-2xl mt-4 mb-8">
      {/* Liquid Frosted Ambient Glow Blurs */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#7c3aed]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-24 right-10 w-96 h-96 bg-[#4cd7f6]/15 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#c81a42]/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
        {/* Micro Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#272a32]/80 backdrop-blur-md border border-white/10 shadow-sm mb-5">
          <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse"></span>
          <span className="font-display text-[11px] text-[#4cd7f6] tracking-widest uppercase font-bold">
            Experiencia Mixta: Físico + Digital
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#e1e2ec] tracking-tight mb-4 leading-tight">
          Regalos que conectan, inspiran y divierten
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-[#ccc3d8] max-w-2xl mb-8 leading-relaxed font-normal">
          Encuentra detalles físicos tangibles con envío seguro o productos virtuales de entrega inmediata. Y si buscas lo inesperado, déjate atrapar por nuestra sección{' '}
          <button
            type="button"
            onClick={onNavigateToPorqueSi}
            className="text-[#ffb2b7] font-semibold underline decoration-[#ffb2b7]/50 underline-offset-4 hover:text-white transition-colors"
          >
            'PORQUE SÍ'
          </button>
          .
        </p>

        {/* Quick Action Pills Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          <button
            type="button"
            onClick={() => onSelectCategory('todos')}
            className={`px-4 py-2 rounded-full font-display text-xs font-bold transition-all transform hover:scale-105 shadow-md ${
              selectedCategory === 'todos'
                ? 'bg-[#d2bbff] text-[#3f008e] shadow-[#d2bbff]/20'
                : 'bg-[#272a32]/80 text-[#e1e2ec] hover:bg-[#32353d] border border-white/5'
            }`}
            id="hero-filter-todos"
          >
            Ver Todo
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory('fisicos')}
            className={`px-4 py-2 rounded-full font-display text-xs font-bold transition-all transform hover:scale-105 shadow-md ${
              selectedCategory === 'fisicos'
                ? 'bg-[#03b5d3] text-[#001f26]'
                : 'bg-[#272a32]/80 text-[#e1e2ec] hover:bg-[#32353d] border border-white/5'
            }`}
            id="hero-filter-fisicos"
          >
            📦 Cajas Físicas &amp; Kits
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory('virtuales')}
            className={`px-4 py-2 rounded-full font-display text-xs font-bold transition-all transform hover:scale-105 shadow-md ${
              selectedCategory === 'virtuales'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-[#272a32]/80 text-[#e1e2ec] hover:bg-[#32353d] border border-white/5'
            }`}
            id="hero-filter-virtuales"
          >
            ⚡ Descargas &amp; Cuponeras Digitales
          </button>
          <button
            type="button"
            onClick={onNavigateToPorqueSi}
            className={`px-4 py-2 rounded-full font-display text-xs font-bold transition-all transform hover:scale-105 shadow-md ${
              selectedCategory === 'porquesi'
                ? 'bg-[#c81a42] text-[#ffdedf]'
                : 'bg-[#c81a42]/80 text-[#ffdedf] hover:bg-[#c81a42] border border-[#ffb2b7]/30'
            }`}
            id="hero-filter-porquesi"
          >
            🦄 Colección PORQUE SÍ
          </button>
        </div>

        {/* Trust Glass Micro-Cards Bento Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-2">
          {/* Card 1 */}
          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#272a32]/40 backdrop-blur-md border border-white/5 shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-[#03b5d3]/20 flex items-center justify-center shrink-0">
              <Truck className="text-[#4cd7f6] w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-xs sm:text-sm font-semibold text-[#e1e2ec]">
                Envíos a todo el país
              </p>
              <p className="text-xs text-[#958da1]">Seguimiento en vivo 48-72h</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#272a32]/40 backdrop-blur-md border border-white/5 shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/30 flex items-center justify-center shrink-0">
              <Zap className="text-[#d2bbff] w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-xs sm:text-sm font-semibold text-[#e1e2ec]">
                Descarga instantánea 24/7
              </p>
              <p className="text-xs text-[#958da1]">En tu correo en 1 segundo</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#272a32]/40 backdrop-blur-md border border-white/5 shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-[#c81a42]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-[#ffb2b7] w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-xs sm:text-sm font-semibold text-[#e1e2ec]">
                Pago 100% Protegido
              </p>
              <p className="text-xs text-[#958da1]">Cifrado de extremo a extremo</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
