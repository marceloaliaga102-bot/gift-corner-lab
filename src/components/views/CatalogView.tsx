import React, { useMemo } from 'react';
import { Product, ProductCategory, AppView } from '../../types';
import { ProductCard } from '../ProductCard';
import { Hero } from '../Hero';
import { CreatorBanner } from '../CreatorBanner';
import { Search } from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onAddToCart: (product: Product) => void;
  onOpenPreview3D: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: AppView) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onAddToCart,
  onOpenPreview3D,
  onSelectProduct,
  onNavigate
}) => {
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter: porquesi products only appear in the 'Porque Sí' view
    if (selectedCategory === 'todos') {
      list = list.filter((p) => p.category !== 'porquesi');
    } else {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'precio-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'precio-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'novedades') {
      list.reverse();
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="w-full flex flex-col">
      {/* Hero Banner with Ambient Frosted Backdrop */}
      <Hero
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        onNavigateToPorqueSi={() => onNavigate('porque-si')}
      />

      {/* Filter Bar & Controls */}
      <div className="p-4 rounded-2xl bg-[#191b23]/70 backdrop-blur-xl shadow-lg flex flex-col gap-4 border border-white/5 mb-6">
        
        {/* Category Switcher Row */}
        <div className="flex flex-wrap gap-2 items-center" id="category-switcher">
          <button
            type="button"
            onClick={() => onSelectCategory('todos')}
            className={`px-4 py-2 rounded-xl font-display text-xs font-bold transition-all ${
              selectedCategory === 'todos'
                ? 'bg-[#7c3aed] text-[#ede0ff] shadow-md'
                : 'bg-[#272a32]/70 text-[#ccc3d8] hover:text-[#e1e2ec] hover:bg-[#32353d]'
            }`}
          >
            Todos los Regalos <span className="ml-1 opacity-70">({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectCategory('fisicos')}
            className={`px-4 py-2 rounded-xl font-display text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'fisicos'
                ? 'bg-[#03b5d3] text-[#001f26] font-bold shadow-md'
                : 'bg-[#272a32]/70 text-[#ccc3d8] hover:text-[#e1e2ec] hover:bg-[#32353d]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
            📦 Físicos
          </button>

          <button
            type="button"
            onClick={() => onSelectCategory('virtuales')}
            className={`px-4 py-2 rounded-xl font-display text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'virtuales'
                ? 'bg-[#7c3aed] text-white font-bold shadow-md'
                : 'bg-[#272a32]/70 text-[#ccc3d8] hover:text-[#e1e2ec] hover:bg-[#32353d]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#d2bbff]"></span>
            ⚡ Virtuales
          </button>

          <button
            type="button"
            onClick={() => onSelectCategory('porquesi')}
            className={`px-4 py-2 rounded-xl font-display text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'porquesi'
                ? 'bg-[#c81a42] text-[#ffdedf] shadow-md'
                : 'bg-[#272a32]/70 text-[#ffb2b7] hover:bg-[#c81a42]/30 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ffb2b7] animate-pulse"></span>
            🦄 PORQUE SÍ
          </button>
        </div>

        {/* Controls Sub-row: Search, Sort and Live Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1]" />
            <input
              type="text"
              placeholder="Filtrar por nombre..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#32353d]/60 pl-9 pr-3 py-1.5 rounded-xl text-xs text-[#e1e2ec] placeholder:text-[#958da1] focus:outline-none focus:bg-[#32353d] border border-white/5"
              id="catalog-search-inline"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label htmlFor="sort-select-input" className="text-xs text-[#958da1] shrink-0">
              Ordenar por:
            </label>
            <select
              id="sort-select-input"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-[#32353d]/80 text-[#e1e2ec] font-display text-xs px-3 py-1.5 rounded-xl focus:outline-none border border-white/5 cursor-pointer"
            >
              <option value="populares">Más populares</option>
              <option value="novedades">Novedades</option>
              <option value="precio-asc">Menor a Mayor Precio</option>
              <option value="precio-desc">Mayor a Menor Precio</option>
            </select>
          </div>
        </div>

      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-[#191b23]/50 rounded-2xl border border-white/5 p-8">
          <p className="font-display text-lg text-[#e1e2ec] mb-2">
            No se encontraron regalos con este filtro.
          </p>
          <p className="text-sm text-[#958da1] mb-4">
            Intenta buscando otra palabra o restableciendo los filtros de categoría.
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('todos');
              onSearchChange('');
            }}
            className="px-4 py-2 bg-[#7c3aed] text-[#ede0ff] font-display text-xs font-bold rounded-xl"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8" id="product-grid">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onAddToCart={onAddToCart}
              onOpenPreview3D={onOpenPreview3D}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}

      {/* Creator Teaser Section */}
      <CreatorBanner onNavigate={onNavigate} />
    </div>
  );
};
