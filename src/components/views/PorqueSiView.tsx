import React, { useState } from 'react';
import { Product } from '../../types';
import { Sparkles, ShoppingCart, Volume2, Award, Heart, CheckCircle2 } from 'lucide-react';
import { sfx } from '../../utils/audio';

interface PorqueSiViewProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const PorqueSiView: React.FC<PorqueSiViewProps> = ({
  products,
  onAddToCart,
  onSelectProduct
}) => {
  const porqueSiProducts = products.filter((p) => p.category === 'porquesi');

  // Interactive Panic Button state
  const [meowCount, setMeowCount] = useState(0);
  const [lastMeowType, setLastMeowType] = useState('Miau Clásico');
  const [isButtonActive, setIsButtonActive] = useState(false);

  // Interactive Pet Rock Certificate state
  const [rockName, setRockName] = useState('Piedrín');
  const [adopterName, setAdopterName] = useState('Humano Afortunado');
  const [hatColor, setHatColor] = useState('Gorro de Mago Azul');
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  const meowTypes = [
    'Miau con Reverb de Catedral',
    'Miau Dramático de Telenovela',
    'Miau Gatito Sorprendido',
    'Miau Operístico Cósmico'
  ];

  const handlePressMiauButton = () => {
    setIsButtonActive(true);
    const variant = meowCount % 4;
    sfx.playMeow(variant);
    setLastMeowType(meowTypes[variant]);
    setMeowCount((prev) => prev + 1);

    setTimeout(() => {
      setIsButtonActive(false);
    }, 200);
  };

  const panicBtnProduct = porqueSiProducts.find((p) => p.id === 'boton-panico-miau');
  const petRockProduct = porqueSiProducts.find((p) => p.id === 'piedra-mascota-sombrerito');

  return (
    <div className="w-full flex flex-col gap-10 py-4">
      {/* Header Banner */}
      <section className="relative w-full rounded-3xl bg-gradient-to-br from-[#c81a42]/30 via-[#10131a] to-[#7c3aed]/20 p-8 sm:p-12 border border-[#ffb2b7]/20 shadow-2xl overflow-hidden text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c81a42]/40 text-[#ffdedf] text-xs font-display font-bold uppercase tracking-wider mb-4 border border-[#ffb2b7]/30">
          <Sparkles className="w-3.5 h-3.5 text-[#ffb2b7]" />
          La Colección Más Extraña &amp; Adorable de Internet
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#e1e2ec] mb-4">
          Colección <span className="text-[#ffb2b7] underline decoration-[#ffb2b7]/40">PORQUE SÍ</span>
        </h1>

        <p className="text-base sm:text-lg text-[#ccc3d8] max-w-2xl leading-relaxed">
          Objetos sin ningún propósito útil evidente, diseñados para arrancarte una sonrisa honesta, romper el hielo o regalarle un momento absurdo a alguien que lo necesita.
        </p>

        <div className="mt-6 flex items-center gap-6 text-xs text-[#ffb2b7] font-semibold">
          <span>✨ 100% Cero Utilidad Práctica</span>
          <span>•</span>
          <span>😂 100% Garantía de Risas</span>
          <span>•</span>
          <span>🎁 Envío Seguro en Caja Rígida</span>
        </div>
      </section>

      {/* Interactive Feature 1: The Panic Button Simulator */}
      <section className="rounded-3xl bg-[#191b23]/70 backdrop-blur-xl p-6 sm:p-10 border border-[#ffb2b7]/20 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffb2b7]/15 text-[#ffb2b7] text-xs font-bold w-max">
            <Volume2 className="w-3.5 h-3.5" /> Simulador Interactivo
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#e1e2ec]">
            Botón de Pánico que solo dice 'Miau'
          </h2>

          <p className="text-sm text-[#ccc3d8] leading-relaxed">
            "Totalmente innecesario. Cómpralo ya." Emite 12 variantes de maullidos con reverb de catedral y eco dramático estéreo. ¡Pruébalo aquí mismo haciendo clic en el pulsador!
          </p>

          <div className="flex items-center gap-4 py-2">
            <div className="px-3.5 py-2 rounded-xl bg-[#272a32] border border-white/5 text-xs">
              <span className="text-[#958da1]">Maullidos activados: </span>
              <span className="font-bold text-[#ffb2b7] font-display text-sm">{meowCount}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-[#272a32] border border-white/5 text-xs truncate">
              <span className="text-[#958da1]">Último modo: </span>
              <span className="font-bold text-[#4cd7f6]">{lastMeowType}</span>
            </div>
          </div>

          {panicBtnProduct && (
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-[#ffb2b7]">
                  ${panicBtnProduct.price.toFixed(2)}
                </span>
                <span className="text-xs text-[#958da1]">Baterías AAA incluidas</span>
              </div>
              <button
                type="button"
                onClick={() => onAddToCart(panicBtnProduct)}
                className="px-5 py-2.5 rounded-xl bg-[#ffb2b7] hover:bg-white text-[#67001b] font-display text-xs font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>¡Lo Quiero Real!</span>
              </button>
            </div>
          )}
        </div>

        {/* Interactive Big Button Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-[#0b0e15]/80 rounded-2xl border border-white/5 relative">
          <p className="text-xs text-[#958da1] mb-6 tracking-wide uppercase font-semibold">
            Haz clic en el botón físico
          </p>

          <button
            type="button"
            onClick={handlePressMiauButton}
            className={`w-40 h-40 rounded-full bg-gradient-to-b from-[#ff8da1] via-[#c81a42] to-[#800020] shadow-[0_15px_35px_rgba(200,26,66,0.6),inset_0_4px_8px_rgba(255,255,255,0.4)] border-4 border-[#ffb2b7]/60 flex flex-col items-center justify-center text-white font-display font-black text-2xl tracking-wider transition-all transform select-none cursor-pointer ${
              isButtonActive ? 'scale-95 translate-y-2 shadow-[0_5px_15px_rgba(200,26,66,0.8)]' : 'hover:scale-105'
            }`}
            id="interactive-panic-miau-button"
            title="Presiona para escuchar el maullido"
          >
            <span className="drop-shadow-md">MIAU</span>
            <span className="text-[10px] tracking-normal font-normal opacity-90 mt-1">EMERGENCIA</span>
          </button>

          <p className="text-[11px] text-[#ccc3d8] mt-6 text-center">
            🔊 Presiona para escuchar el audio sintetizado en vivo
          </p>
        </div>
      </section>

      {/* Interactive Feature 2: Pet Rock & Custom Certificate Generator */}
      <section className="rounded-3xl bg-[#191b23]/70 backdrop-blur-xl p-6 sm:p-10 border border-[#ffb2b7]/20 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] text-xs font-bold w-max">
            <Award className="w-3.5 h-3.5" /> Adopción Notariada
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#e1e2ec]">
            Piedra Mascota con Sombrerito
          </h2>

          <p className="text-sm text-[#ccc3d8] leading-relaxed">
            Cada piedra es única, suave al tacto y viene con sombrerito tejido a crochet por Angely. Personaliza el nombre y sombrerito para ver cómo se verá su certificado oficial de nacimiento:
          </p>

          <div className="flex flex-col gap-3 py-2">
            <div>
              <label className="text-xs text-[#958da1] block mb-1">Nombre de la Piedra:</label>
              <input
                type="text"
                value={rockName}
                onChange={(e) => setRockName(e.target.value)}
                className="w-full bg-[#272a32] px-3.5 py-2 rounded-xl text-xs text-[#e1e2ec] border border-white/10 focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-xs text-[#958da1] block mb-1">Nombre del Humano Adoptante:</label>
              <input
                type="text"
                value={adopterName}
                onChange={(e) => setAdopterName(e.target.value)}
                className="w-full bg-[#272a32] px-3.5 py-2 rounded-xl text-xs text-[#e1e2ec] border border-white/10 focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-xs text-[#958da1] block mb-1">Estilo de Sombrerito:</label>
              <select
                value={hatColor}
                onChange={(e) => setHatColor(e.target.value)}
                className="w-full bg-[#272a32] px-3.5 py-2 rounded-xl text-xs text-[#e1e2ec] border border-white/10 focus:outline-none"
              >
                <option value="Gorro de Mago Azul">🧙‍♂️ Gorro de Mago Estrellado</option>
                <option value="Boina Francesa Roja">🎨 Boina de Artista Bohemia</option>
                <option value="Corona Real Dorada">👑 Corona Real de Su Majestad</option>
                <option value="Sombrero Pirata Mini">🏴‍☠️ Sombrero Corsario Pirata</option>
              </select>
            </div>
          </div>

          {petRockProduct && (
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-[#ffb2b7]">
                  ${petRockProduct.price.toFixed(2)}
                </span>
                <span className="text-xs text-[#958da1]">Garantía de risas</span>
              </div>
              <button
                type="button"
                onClick={() => onAddToCart(petRockProduct)}
                className="px-5 py-2.5 rounded-xl bg-[#ffb2b7] hover:bg-white text-[#67001b] font-display text-xs font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Heart className="w-4 h-4" />
                <span>Adoptar Piedra Mascota</span>
              </button>
            </div>
          )}
        </div>

        {/* Certificate Mockup Preview Card */}
        <div className="lg:col-span-6 bg-[#272a32]/80 p-6 rounded-2xl border-2 border-dashed border-[#ffb2b7]/40 relative shadow-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#ffb2b7]/20 flex items-center justify-center text-[#ffb2b7] mb-2">
            <Award className="w-6 h-6" />
          </div>

          <h3 className="font-display text-xs tracking-widest uppercase font-bold text-[#ffb2b7]">
            Certificado Oficial de Nacimiento
          </h3>
          <p className="text-[10px] text-[#958da1] tracking-wider mb-4">
            REGISTRO CIVIL DE PIEDRAS DE COMPAÑÍA #GC-{Math.abs(rockName.length * 4234)}
          </p>

          <div className="w-full bg-[#10131a] p-4 rounded-xl text-left border border-white/5 flex flex-col gap-2 text-xs">
            <p className="text-[#ccc3d8]">
              <strong className="text-[#e1e2ec]">Nombre Asignado:</strong>{' '}
              <span className="text-[#d2bbff] font-bold">{rockName || 'Piedrín'}</span>
            </p>
            <p className="text-[#ccc3d8]">
              <strong className="text-[#e1e2ec]">Humano Tutor:</strong>{' '}
              <span className="text-[#4cd7f6]">{adopterName || 'Tú'}</span>
            </p>
            <p className="text-[#ccc3d8]">
              <strong className="text-[#e1e2ec]">Atuendo Registrado:</strong> {hatColor}
            </p>
            <p className="text-[#ccc3d8]">
              <strong className="text-[#e1e2ec]">Dieta Recomendada:</strong> Miradas de afecto y cero agua después de medianoche.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Firma Notarial: Marcelo &amp; Angely (Gift Corner Lab)</span>
          </div>
        </div>
      </section>
    </div>
  );
};
