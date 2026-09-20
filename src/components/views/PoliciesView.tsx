import React from 'react';
import { ShieldCheck, Truck, Download, RefreshCw } from 'lucide-react';

export const PoliciesView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 flex flex-col gap-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#03b5d3]/20 text-[#4cd7f6] text-xs font-display font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4" />
          Transparencia y Seguridad
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#e1e2ec] mb-3">
          Políticas de Tienda &amp; Garantía
        </h1>
        <p className="text-sm text-[#ccc3d8]">
          Garantizamos compras seguras tanto para envíos físicos como para entregas digitales instantáneas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Envíos Físicos */}
        <div className="p-6 rounded-3xl bg-[#191b23]/80 backdrop-blur-xl border border-white/5 shadow-xl flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#03b5d3]/20 flex items-center justify-center text-[#4cd7f6]">
            <Truck className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#e1e2ec]">
            1. Envíos Físicos y Embalaje de Protección
          </h2>
          <p className="text-xs text-[#ccc3d8] leading-relaxed">
            Todos nuestros productos físicos (Lámparas Spotify, Proyectores de Galaxias, Cajas Explosivas y Piedras Mascota) se despachan dentro de las 24 a 48 horas hábiles de realizada la orden. Se empacan en cajas rígidas con protección de burbuja de alta densidad para asegurar que lleguen en estado impecable.
          </p>
          <p className="text-xs text-[#958da1]">Tarifa plana nacional: $3.50 por pedido.</p>
        </div>

        {/* Descargas Virtuales */}
        <div className="p-6 rounded-3xl bg-[#191b23]/80 backdrop-blur-xl border border-white/5 shadow-xl flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 flex items-center justify-center text-[#d2bbff]">
            <Download className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#e1e2ec]">
            2. Descargas Digitales Instantáneas
          </h2>
          <p className="text-xs text-[#ccc3d8] leading-relaxed">
            Para la Cuponera de Amor 3D, Páginas Web Conmemorativas y Packs de Stickers de Instagram, la entrega es de 0 segundos tras procesar el pago. Se genera un enlace cifrado seguro y se remiten las credenciales tanto en pantalla como a tu casilla de correo electrónico.
          </p>
          <p className="text-xs text-[#958da1]">Costo de envío virtual: $0.00 siempre.</p>
        </div>

        {/* Devoluciones y Daños */}
        <div className="p-6 rounded-3xl bg-[#191b23]/80 backdrop-blur-xl border border-white/5 shadow-xl flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c81a42]/20 flex items-center justify-center text-[#ffb2b7]">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#e1e2ec]">
            3. Devoluciones &amp; Reemplazos
          </h2>
          <p className="text-xs text-[#ccc3d8] leading-relaxed">
            Si algún producto físico llegase con cualquier defecto de transporte, te enviamos una reposición nueva inmediatamente sin que debas pagar ningún flete de retorno. Tienes hasta 30 días naturales a partir de la recepción para solicitar cualquier asistencia o ajuste.
          </p>
        </div>

        {/* Privacidad de Datos */}
        <div className="p-6 rounded-3xl bg-[#191b23]/80 backdrop-blur-xl border border-white/5 shadow-xl flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#32353d] flex items-center justify-center text-[#e1e2ec]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#e1e2ec]">
            4. Privacidad de Fotografías y Mensajes
          </h2>
          <p className="text-xs text-[#ccc3d8] leading-relaxed">
            Las fotos enviadas para tus cartas 3D, páginas web conmemorativas y cajas explosivas se procesan de forma estrictamente confidencial. Nunca se comparten públicamente ni se utilizan con fines comerciales sin tu consentimiento explícito.
          </p>
        </div>
      </div>
    </div>
  );
};
