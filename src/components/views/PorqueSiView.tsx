import React from 'react';
import { Product } from '../../types';
import { Sparkles, PackageOpen } from 'lucide-react';
import { ProductCard } from '../ProductCard';

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

  return (
    <div className="w-full flex flex-col gap-8 py-2">
      {/* Header Banner */}
      <section className="relative w-full rounded-3xl bg-gradient-to-br from-[#c81a42]/30 via-[#10131a] to-[#7c3aed]/20 p-8 sm:p-10 border border-[#ffb2b7]/20 shadow-2xl overflow-hidden text-center flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c81a42]/40 text-[#ffdedf] text-xs font-display font-bold uppercase tracking-wider border border-[#ffb2b7]/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#ffb2b7] animate-pulse" />
            La Colección Más Extraña &amp; Adorable
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#e1e2ec] mb-4">
          Colección <span className="text-[#ffb2b7] underline decoration-[#ffb2b7]/40">PORQUE SÍ</span>
        </h1>

        <p className="text-base sm:text-lg text-[#ccc3d8] max-w-2xl leading-relaxed">
          Objetos y detalles sin ningún propósito útil evidente, diseñados exclusivamente para arrancarte una sonrisa honesta, romper el hielo o regalarle un momento absurdo a alguien especial.
        </p>

        <div className="mt-6 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs text-[#ffb2b7] font-semibold">
          <span className="flex items-center gap-1.5">✨ 100% Cero Utilidad Práctica</span>
          <span>•</span>
          <span className="flex items-center gap-1.5">😂 100% Garantía de Risas</span>
          <span>•</span>
          <span className="flex items-center gap-1.5">🎁 Diseños Exclusivos Gift Corner</span>
        </div>
      </section>

      {/* Products Grid */}
      <section className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-display font-bold text-[#e1e2ec] flex items-center gap-2">
            <span>Catálogo Exclusivo</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ffb2b7]/20 text-[#ffb2b7] border border-[#ffb2b7]/30">
              {porqueSiProducts.length} {porqueSiProducts.length === 1 ? 'artículo' : 'artículos'}
            </span>
          </h2>
        </div>

        {porqueSiProducts.length === 0 ? (
          <div className="w-full p-12 rounded-3xl bg-[#191b23]/50 border border-white/5 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#ffb2b7]/10 flex items-center justify-center text-[#ffb2b7] mb-2">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#e1e2ec]">Aún no hay productos en esta sección</h3>
            <p className="text-sm text-[#958da1] max-w-md">
              Pronto agregaremos nuevas locuras y creaciones absurdas a la sección Porque Sí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {porqueSiProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
