import React from 'react';
import { Product } from '../../types';
import { 
  X, ShoppingCart, Check, PlayCircle, Clock, Box, Zap, Sparkles, Video, FileCode, ExternalLink,
  MapPin, MessageCircle
} from 'lucide-react';
import { sfx } from '../../utils/audio';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onOpenPreview3D?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenPreview3D
}) => {
  if (!product) return null;

  const isVirtual = product.productType === 'virtual' || product.category === 'virtuales';
  const isPhysical = product.productType === 'fisico' || product.category === 'fisicos' || product.category === 'porquesi';
  const isPorqueSi = product.category === 'porquesi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#191b23] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#272a32] text-[#e1e2ec] hover:bg-[#32353d] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Image & Badges */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-[#272a32] border border-white/5">
              <img
                src={product.imageUrl}
                alt={product.altText}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {product.has3DPreview && (
                <button
                  type="button"
                  onClick={() => {
                    sfx.playChime();
                    if (onOpenPreview3D) onOpenPreview3D();
                  }}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#0b0e15]/90 backdrop-blur-md text-[#e1e2ec] hover:text-white hover:bg-[#7c3aed] text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-white/10 transition-colors"
                >
                  <PlayCircle className="w-4 h-4 text-[#d2bbff]" />
                  <span>Probar Preview 3D</span>
                </button>
              )}
            </div>
          </div>

          {/* Details & Specs */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-black/80 text-[#4cd7f6] border border-[#4cd7f6]/50 font-mono text-xs font-bold">
                  COD: {product.code || `GCL-${product.id.slice(0, 4).toUpperCase()}`}
                </span>
                {isVirtual && (
                  <span className="px-2 py-0.5 rounded text-[9px] pixel-badge bg-[#03b5d3] text-[#001f26] flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> {product.badgeLabel}
                  </span>
                )}
                {product.category === 'fisicos' && (
                  <span className="px-2 py-0.5 rounded text-[9px] pixel-badge bg-[#272a32] text-[#4cd7f6] flex items-center gap-1 border border-[#4cd7f6]/40">
                    <Box className="w-2.5 h-2.5" /> {product.badgeLabel}
                  </span>
                )}
                {isPorqueSi && (
                  <span className="px-2 py-0.5 rounded text-[9px] pixel-badge bg-[#ffb2b7] text-[#67001b] flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> {product.badgeLabel}
                  </span>
                )}
                {product.secondaryBadge && (
                  <span className="px-2 py-0.5 rounded text-[9px] pixel-badge bg-[#272a32] text-[#ccc3d8]">
                    {product.secondaryBadge}
                  </span>
                )}
              </div>

              <h2 className="font-display text-base sm:text-xl font-bold text-white leading-tight">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-2 mt-2">
                <span className={`font-display text-xl sm:text-2xl font-extrabold ${
                  isPorqueSi ? 'text-[#ffb2b7]' : 'text-white'
                }`}>
                  S/. {product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-[#958da1] line-through font-mono">
                    S/. {product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-[#4cd7f6] flex items-center gap-1 ml-2 font-mono">
                  <Clock className="w-3 h-3" /> {product.deliveryInfo}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#ccc3d8] leading-relaxed">
              {product.fullDetails}
            </p>

            {/* Video Preview if available */}
            {product.videoUrl && (
              <div className="p-3.5 rounded-2xl bg-[#10131a] border border-[#7c3aed]/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#d2bbff] flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#d2bbff]" /> Video Demostrativo
                  </span>
                  <a
                    href={product.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#4cd7f6] hover:underline flex items-center gap-1"
                  >
                    <span>Ver en fuente</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={product.videoUrl.replace('watch?v=', 'embed/')}
                      title={product.name}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a
                    href={product.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-[#272a32] text-xs text-[#e1e2ec] flex items-center justify-center gap-2 hover:bg-[#32353d]"
                  >
                    <PlayCircle className="w-4 h-4 text-[#d2bbff]" />
                    <span>Reproducir Video en Nueva Pestaña</span>
                  </a>
                )}
              </div>
            )}

            {/* Downloadable Attachment Notice if available (Virtual) */}
            {product.downloadFile && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">
                      Entrega Digital Instantánea ({product.downloadFile.name})
                    </span>
                    <span className="text-[10px] text-emerald-300">
                      Podrás descargarlo directamente en tu cuenta tras confirmar el pago.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  {(product.downloadFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}

            {/* Physical Pickup Locations & WhatsApp coordination notice */}
            {isPhysical && (
              <div className="p-3.5 rounded-xl bg-[#03b5d3]/10 border border-[#03b5d3]/30 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4cd7f6] flex items-center gap-1.5 font-mono">
                    <MapPin className="w-4 h-4 text-[#4cd7f6]" /> Entrega Física Coordinada
                  </span>
                  <span className="text-[9px] pixel-badge px-2 py-0.5 rounded bg-[#03b5d3]/20 text-[#4cd7f6]">
                    Presencial
                  </span>
                </div>
                
                <p className="text-[11px] text-[#ccc3d8] leading-tight">
                  Se coordina por WhatsApp indicando el código único: <strong className="text-[#4cd7f6] font-mono">{product.code}</strong>. Puntos de encuentro disponibles:
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(product.pickupLocations && product.pickupLocations.length > 0
                    ? product.pickupLocations
                    : ['Plaza Central / Parque Principal', 'Estación Central / Tren', 'Taller Gift Corner Lab']
                  ).map((loc, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#191b23] border border-white/10 text-white text-[11px] flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-[#4cd7f6]" /> {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features List */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
              <span className="text-xs font-display font-bold text-[#e1e2ec]">
                Características &amp; Beneficios:
              </span>
              {product.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#ccc3d8]">
                  <Check className="w-3.5 h-3.5 text-[#4cd7f6] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onAddToCart(product);
                  onClose();
                }}
                className={`w-full flex-1 py-3 px-4 rounded-xl font-display text-xs font-bold pixel-btn flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isPorqueSi
                    ? 'bg-[#ffb2b7] hover:bg-white text-[#67001b]'
                    : isVirtual
                    ? 'bg-[#7c3aed] hover:bg-[#732ee4] text-[#ede0ff]'
                    : 'bg-[#03b5d3] hover:bg-[#4cd7f6] text-[#001f26]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isPorqueSi ? '¡Lo Quiero!' : 'Añadir al Carrito'}</span>
              </button>

              {isPhysical && (
                <a
                  href={`https://wa.me/51921617882?text=${encodeURIComponent(`¡Hola! Quiero pedir el siguiente producto:\n📦 ${product.name}\n🏷️ Código: ${product.code}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sfx.playChime()}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white font-display text-xs font-bold pixel-btn flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Pedir por WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
