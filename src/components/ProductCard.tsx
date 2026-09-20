import React from 'react';
import { Product } from '../types';
import { PlayCircle, ShoppingCart, Sparkles, Box, Zap, Clock, Video, FileCode, MapPin } from 'lucide-react';
import { sfx } from '../utils/audio';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenPreview3D?: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenPreview3D,
  onSelectProduct
}) => {
  const isPorqueSi = product.category === 'porquesi';
  const isVirtual = product.productType === 'virtual' || product.category === 'virtuales';
  const isPhysical = product.productType === 'fisico' || product.category === 'fisicos';

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playClick();
    if (product.id === 'boton-panico-miau') {
      sfx.playMeow(Math.floor(Math.random() * 4));
    }
    onAddToCart(product);
  };

  return (
    <article
      onClick={() => onSelectProduct(product)}
      className="group relative rounded-2xl bg-[#191b23]/70 backdrop-blur-md shadow-lg p-4 flex flex-col justify-between hover:shadow-2xl hover:border-white/15 transition-all duration-300 transform hover:-translate-y-1 border border-white/5 cursor-pointer"
      id={`product-card-${product.id}`}
    >
      <div>
        {/* Product Image Container */}
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-[#272a32] mb-3">
          <img
            src={product.imageUrl}
            alt={product.altText}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Badges Top-Left */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            {isVirtual && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-display font-bold bg-[#03b5d3]/90 text-[#001f26] backdrop-blur-md flex items-center gap-1 shadow-sm">
                <Zap className="w-3 h-3 text-[#001f26]" /> {product.badgeLabel}
              </span>
            )}
            {isPhysical && !isPorqueSi && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-display font-bold bg-[#32353d]/90 text-[#4cd7f6] backdrop-blur-md flex items-center gap-1 shadow-sm border border-white/5">
                <Box className="w-3 h-3 text-[#4cd7f6]" /> {product.badgeLabel}
              </span>
            )}
            {isPorqueSi && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-display font-bold bg-[#ffb2b7] text-[#67001b] backdrop-blur-md flex items-center gap-1 shadow-md -rotate-2">
                <Sparkles className="w-3 h-3 text-[#67001b]" /> {product.badgeLabel}
              </span>
            )}

            {product.discountBadge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-bold bg-[#c81a42] text-[#ffdedf] shadow-sm w-max">
                {product.discountBadge}
              </span>
            )}
            {product.secondaryBadge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-semibold bg-[#272a32]/90 text-[#e1e2ec] shadow-sm border border-white/5 w-max">
                {product.secondaryBadge}
              </span>
            )}

            {product.videoUrl && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-semibold bg-[#7c3aed]/90 text-white shadow-sm flex items-center gap-1 w-max">
                <Video className="w-2.5 h-2.5" /> Video
              </span>
            )}

            {product.downloadFile && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-semibold bg-emerald-600/90 text-white shadow-sm flex items-center gap-1 w-max">
                <FileCode className="w-2.5 h-2.5" /> {product.downloadFile.isHtml ? 'Página HTML' : 'Descargable'}
              </span>
            )}
          </div>

          {/* 3D Preview Button */}
          {product.has3DPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sfx.playChime();
                if (onOpenPreview3D) onOpenPreview3D();
              }}
              className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#0b0e15]/85 backdrop-blur-md text-[#e1e2ec] hover:text-white hover:bg-[#7c3aed] text-xs font-semibold flex items-center gap-1.5 shadow-md border border-white/10 transition-colors"
              id="preview-3d-btn"
            >
              <PlayCircle className="w-3.5 h-3.5 text-[#d2bbff]" />
              <span>Preview 3D</span>
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-display text-base sm:text-lg font-semibold mb-1 transition-colors leading-snug ${
          isPorqueSi 
            ? 'text-[#ffb2b7] group-hover:text-white' 
            : isVirtual
            ? 'text-[#e1e2ec] group-hover:text-[#d2bbff]'
            : 'text-[#e1e2ec] group-hover:text-[#4cd7f6]'
        }`}>
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-[#ccc3d8] mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Footer / Price & Add */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-display text-xl font-bold ${
              isPorqueSi ? 'text-[#ffb2b7]' : 'text-[#e1e2ec]'
            }`}>
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#958da1] line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#4cd7f6] font-medium flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {product.deliveryInfo}
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAdd}
          className={`px-3.5 py-2 rounded-xl font-display text-xs font-bold flex items-center gap-1.5 shadow-md transition-all transform active:scale-95 ${
            isPorqueSi
              ? 'bg-[#ffb2b7] hover:bg-white text-[#67001b] shadow-[#ffb2b7]/20'
              : isVirtual
              ? 'bg-[#7c3aed] hover:bg-[#732ee4] text-[#ede0ff] shadow-[#7c3aed]/30'
              : 'bg-[#32353d] hover:bg-[#7c3aed] text-[#e1e2ec] hover:text-white'
          }`}
          id={`add-btn-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{isPorqueSi ? '¡Lo Quiero!' : 'Añadir'}</span>
        </button>
      </div>
    </article>
  );
};
