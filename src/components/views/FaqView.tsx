import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: 'general' | 'virtuales' | 'fisicos' | 'porquesi';
}

export const FaqView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: '¿Cómo recibo los productos virtuales tras la compra?',
      a: 'La entrega es inmediata (0 segundos). En cuanto se confirma el pago, ves tus enlaces de acceso en pantalla y los recibes automáticamente por correo electrónico. Podrás compartirlos directamente por WhatsApp, email o redes sociales con tu persona especial sin esperas.',
      category: 'virtuales'
    },
    {
      q: '¿Puedo comprar productos físicos y digitales en un mismo pedido?',
      a: '¡Sí! Es una de las ventajas de Gift Corner Lab. Nuestro carrito inteligente calcula $0 de costo de envío para las descargas virtuales y aplica la tarifa fija de $3.50 únicamente para los paquetes físicos. Recibirás de inmediato los accesos digitales y la coordinación directa de tu paquete por WhatsApp.',
      category: 'general'
    },
    {
      q: '¿Cómo funciona la Lámpara Acrílica de Spotify?',
      a: 'Grabamos con tecnología láser el código de ondas exacto de tu canción o playlist de Spotify. Cuando la persona enciende la app de Spotify en su teléfono y enfoca la cámara en la lámpara, la melodía comienza a sonar al instante. La base de madera maciza se conecta a cualquier puerto USB estándar o cargador de móvil.',
      category: 'fisicos'
    },
    {
      q: '¿Qué es exactamente la "Garantía de Risas" de la sección PORQUE SÍ?',
      a: 'Nuestros artículos de la colección PORQUE SÍ (como la Piedra Mascota con Sombrerito o el Botón de Pánico que solo dice Miau) tienen como única misión sacar una sonrisa genuina. Si al abrirlo tú o la persona que lo recibe no se ríen, escríbenos por WhatsApp y te enviamos un detalle adicional hecho a mano por nosotros sin costo alguno.',
      category: 'porquesi'
    },
    {
      q: '¿Cuánto tiempo dura la página web conmemorativa o carta 3D?',
      a: 'La carta 3D y cuponera de amor tienen un enlace permanente sin vencimiento. La página web conmemorativa incluye 1 año de hosting y dominio privado de alta velocidad, con opción de renovación simbólica anual si desean conservarla activa para siempre.',
      category: 'virtuales'
    },
    {
      q: '¿Hacen envíos a todo el país y cómo se rastrean?',
      a: 'Realizamos envíos asegurados a nivel nacional. Los paquetes tardan entre 48 y 72 horas hábiles. En cuanto el pedido sale del taller de Marcelo & Angely, te enviamos por correo y WhatsApp el número de guía con seguimiento en tiempo real.',
      category: 'fisicos'
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto py-6 flex flex-col gap-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] text-xs font-display font-semibold uppercase tracking-wider mb-3">
          <HelpCircle className="w-4 h-4 text-[#4cd7f6]" />
          Resolvemos tus dudas
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#e1e2ec] mb-3">
          Preguntas Frecuentes (FAQ)
        </h1>
        <p className="text-sm text-[#ccc3d8]">
          Todo lo que necesitas saber sobre envíos, descargas y personalización.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl bg-[#191b23]/80 backdrop-blur-md border border-white/5 overflow-hidden transition-all shadow-md"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-[#272a32]/50 transition-colors"
              >
                <span className="font-display text-sm sm:text-base font-semibold text-[#e1e2ec]">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#958da1] shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-[#d2bbff]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#ccc3d8] leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
