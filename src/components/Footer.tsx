import React from 'react';
import { LOGO_URL } from '../data/products';
import { AppView, ProductCategory } from '../types';
import { Share2, MessageCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  onFilterCategory: (category: ProductCategory) => void;
  onOpenWhatsApp: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onFilterCategory,
  onOpenWhatsApp
}) => {
  return (
    <footer className="w-full mt-14 bg-[#0b0e15]/90 backdrop-blur-2xl border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('catalogo')}>
              <img
                src={LOGO_URL}
                alt="Gift Corner Lab Logo"
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-semibold text-lg text-[#e1e2ec]">
                Gift Corner Lab
              </span>
            </div>
            <p className="text-sm text-[#ccc3d8] max-w-sm leading-relaxed">
              Detalles físicos y digitales con magia y propósito (o sin él).
            </p>
            <p className="text-xs text-[#d2bbff] font-semibold">
              Creado con pasión por Marcelo y Angely
            </p>
          </div>

          {/* Column 2: Explorar */}
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-xs font-bold text-[#e1e2ec] uppercase tracking-wider">
              Explorar
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-[#ccc3d8]">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onFilterCategory('todos');
                    onNavigate('catalogo');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Catálogo Completo
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onFilterCategory('virtuales');
                    onNavigate('catalogo');
                  }}
                  className="hover:text-[#4cd7f6] transition-colors"
                >
                  Productos Virtuales
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onFilterCategory('fisicos');
                    onNavigate('catalogo');
                  }}
                  className="hover:text-[#4cd7f6] transition-colors"
                >
                  Productos Físicos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('porque-si')}
                  className="text-[#ffb2b7] hover:text-white font-semibold transition-colors"
                >
                  Colección PORQUE SÍ
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Soporte & Confianza */}
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-xs font-bold text-[#e1e2ec] uppercase tracking-wider">
              Soporte &amp; Confianza
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-[#ccc3d8]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('preguntas-faq')}
                  className="hover:text-white transition-colors"
                >
                  Preguntas Frecuentes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('politicas')}
                  className="hover:text-white transition-colors"
                >
                  Políticas de Devolución &amp; Envíos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('mi-cuenta')}
                  className="hover:text-[#4cd7f6] transition-colors"
                >
                  Descargas Digitales
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin-panel')}
                  className="text-[#958da1] hover:text-white transition-colors"
                >
                  Panel de Administración
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Conecta con Nosotros */}
          <div className="flex flex-col gap-3.5">
            <h3 className="font-display text-xs font-bold text-[#e1e2ec] uppercase tracking-wider">
              Conecta con Nosotros
            </h3>
            <div className="flex flex-col gap-2.5 text-xs text-[#ccc3d8]">
              <a
                href="#social"
                onClick={(e) => {
                  e.preventDefault();
                  alert('¡Síguenos en @giftcornerlab en Instagram y TikTok para ver las creaciones del taller!');
                }}
                className="flex items-center gap-2 hover:text-[#4cd7f6] transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#958da1]" />
                <span>TikTok e Instagram @giftcornerlab</span>
              </a>

              <button
                type="button"
                onClick={onOpenWhatsApp}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#272a32]/80 hover:bg-[#32353d] text-[#e1e2ec] transition-all max-w-fit shadow-md border border-white/5"
              >
                <MessageCircle className="w-4 h-4 text-[#4cd7f6]" />
                <span className="font-display text-xs font-semibold">WhatsApp Personalizado</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-[#958da1]">
          <p>© 2025 Gift Corner Lab. Todos los derechos reservados.</p>
          <p className="font-display text-xs text-[#ccc3d8]">
            Fundadores: <span className="font-semibold text-[#e1e2ec]">Marcelo &amp; Angely</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
