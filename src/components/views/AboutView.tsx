import React from 'react';
import { Heart, Code, Hammer, Sparkles, MapPin, Mail, Coffee } from 'lucide-react';
import { AppView } from '../../types';

interface AboutViewProps {
  onNavigate: (view: AppView) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="w-full flex flex-col gap-10 py-6 max-w-4xl mx-auto">
      {/* Hero */}
      <section className="text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] text-xs font-display font-semibold uppercase tracking-wider mb-4 border border-[#7c3aed]/30">
          <Heart className="w-3.5 h-3.5 text-[#ffb2b7]" />
          Nuestra Historia &amp; Filosofía
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#e1e2ec] mb-4">
          Hecho a mano y con código
        </h1>
        <p className="text-base sm:text-lg text-[#ccc3d8] max-w-2xl leading-relaxed">
          Gift Corner Lab nació en la intersección entre un banco de carpintería y un editor de código, fundada por dos apasionados del detalle: Marcelo y Angely.
        </p>
      </section>

      {/* The Duo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marcelo */}
        <div className="p-6 rounded-3xl bg-[#191b23]/80 backdrop-blur-xl border border-white/5 shadow-xl flex flex-col gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#7c3aed]/20 flex items-center justify-center text-[#d2bbff]">
            <Code className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-[#4cd7f6] font-semibold uppercase tracking-wider">
              Desarrollo &amp; Experiencias 3D
            </span>
            <h2 className="font-display text-xl font-bold text-[#e1e2ec]">Marcelo</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#ccc3d8] leading-relaxed">
            Ingeniero de software y entusiasta del diseño interactivo. Marcelo programa los generadores de cartas 3D, las plataformas de cuponeras digitales y las conexiones electrónicas de nuestras lámparas LED. Obsesionado con que cada clic digital despierte emoción instantánea.
          </p>
          <div className="text-xs text-[#958da1] pt-2 border-t border-white/5 flex items-center gap-2">
            <Coffee className="w-3.5 h-3.5" /> Combustible favorito: Café filtrado sin azúcar
          </div>
        </div>

        {/* Angely */}
        <div className="p-6 rounded-3xl bg-[#191b23]/80 backdrop-blur-xl border border-white/5 shadow-xl flex flex-col gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#c81a42]/20 flex items-center justify-center text-[#ffb2b7]">
            <Hammer className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-[#ffb2b7] font-semibold uppercase tracking-wider">
              Diseño Físico &amp; Artesanía
            </span>
            <h2 className="font-display text-xl font-bold text-[#e1e2ec]">Angely</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#ccc3d8] leading-relaxed">
            Artesana y diseñadora de producto. Angely lija las bases de madera de haya a mano, selecciona los papeles fotográficos de alta densidad para las cajas explosivas, teje los mini sombreros a crochet para las piedras mascota y empaqueta cada pedido con lazos de seda.
          </p>
          <div className="text-xs text-[#958da1] pt-2 border-t border-white/5 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ffb2b7]" /> Superpoder: Lazo de regalo perfecto en 4 segundos
          </div>
        </div>
      </div>

      {/* Manifesto */}
      <section className="p-8 rounded-3xl bg-[#272a32]/40 backdrop-blur-xl border border-white/10 shadow-lg flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold text-[#e1e2ec]">
          El Manifiesto de Gift Corner Lab
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#10131a]/60 border border-white/5">
            <h3 className="font-display text-sm font-bold text-[#d2bbff] mb-1">
              1. Sin Regalos Genéricos
            </h3>
            <p className="text-xs text-[#ccc3d8]">
              Si no nos emocionaría recibirlo a nosotros o no nos saca una carcajada limpia, no entra en el catálogo.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#10131a]/60 border border-white/5">
            <h3 className="font-display text-sm font-bold text-[#4cd7f6] mb-1">
              2. Físico + Digital Juntos
            </h3>
            <p className="text-xs text-[#ccc3d8]">
              Creemos que el futuro de los regalos une la calidez de un objeto táctil con la inmediatez de la interactividad web.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#10131a]/60 border border-white/5">
            <h3 className="font-display text-sm font-bold text-[#ffb2b7] mb-1">
              3. El Humor es Salud
            </h3>
            <p className="text-xs text-[#ccc3d8]">
              Nuestra sección 'Porque Sí' existe porque el mundo necesita menos solemnidad y más piedras con sombrerito.
            </p>
          </div>
        </div>
      </section>

      {/* Contact snippet */}
      <div className="p-6 rounded-3xl bg-[#191b23] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-[#ccc3d8]">
          <MapPin className="w-4 h-4 text-[#4cd7f6]" />
          <span>Taller boutique en producción local continua</span>
          <span className="hidden sm:inline">•</span>
          <Mail className="w-4 h-4 text-[#d2bbff]" />
          <span>hola@giftcornerlab.com</span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('catalogo')}
          className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white font-display text-xs font-bold shadow-md hover:bg-[#732ee4] transition-colors"
        >
          Volver a la Tienda
        </button>
      </div>
    </div>
  );
};
