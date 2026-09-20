import React, { useState } from 'react';
import { CartItem } from '../types';
import { ShoppingBag, Trash2, ArrowRight, Lock, Tag, Check, Sparkles } from 'lucide-react';
import { sfx } from '../utils/audio';

interface CartSidebarProps {
  items: CartItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onClearCart: () => void;
  onProceedCheckout: () => void;
  onExploreCatalog: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  items,
  onUpdateQty,
  onClearCart,
  onProceedCheckout,
  onExploreCatalog
}) => {
  const [couponCode, setCouponCode] = useState('BIENVENIDOLAB');
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponError, setCouponError] = useState('');

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  const hasPhysical = items.some(item => item.product.category === 'fisicos' || item.product.category === 'porquesi');
  const hasVirtual = items.some(item => item.product.category === 'virtuales');
  
  const shippingCost = items.length === 0 ? 0 : hasPhysical ? 10.00 : 0.00;
  const discountAmount = couponApplied && items.length > 0 ? 15.00 : 0.00;
  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'BIENVENIDOLAB' || code === 'BIENVENIDOLAP' || code === 'MARCELOYANGELY') {
      setCouponApplied(true);
      setCouponError('');
      sfx.playChime();
    } else {
      setCouponError('Cupón inválido. Prueba: BIENVENIDOLAB');
    }
  };

  return (
    <aside className="sticky top-24 w-full" id="cart-sidebar-container">
      <div className="rounded-2xl bg-[#191b23]/90 backdrop-blur-2xl shadow-2xl p-4 sm:p-5 flex flex-col gap-4 relative overflow-hidden pixel-border border-white/10">
        
        {/* Cart Ambient Backlight */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#7c3aed]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center text-[#ede0ff] shadow-md border border-white/10">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold text-white leading-tight">
                Tu Carrito
              </h2>
              <span className="text-[10px] text-[#958da1] font-mono">
                {totalCount} {totalCount === 1 ? 'ítem en orden' : 'ítems en orden'}
              </span>
            </div>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onClearCart();
              }}
              className="text-[11px] text-[#ffb2b7] hover:underline flex items-center gap-1 transition-colors font-mono"
              id="clear-cart-btn"
            >
              <Trash2 className="w-3 h-3" />
              <span>Vaciar</span>
            </button>
          )}
        </div>

        {/* Multi-Item Mixed Notification Banner */}
        {hasPhysical && hasVirtual && (
          <div className="p-2.5 rounded-xl bg-[#272a32]/80 backdrop-blur-md flex items-start gap-2 border border-[#4cd7f6]/30 shadow-inner">
            <Sparkles className="w-4 h-4 text-[#4cd7f6] shrink-0 mt-0.5" />
            <p className="text-xs text-[#ccc3d8] leading-snug">
              ¡Llevas productos físicos y descargas digitales en la misma orden!
            </p>
          </div>
        )}

        {/* Items List */}
        {items.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center gap-2 text-[#958da1]">
            <ShoppingBag className="w-10 h-10 text-[#958da1]/50 mb-1" />
            <p className="text-sm text-white font-medium">Tu carrito está vacío.</p>
            <p className="text-xs text-[#958da1]">Explora nuestros regalos físicos y virtuales.</p>
            <button
              type="button"
              onClick={onExploreCatalog}
              className="mt-2 px-3 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#732ee4] text-xs font-display font-bold text-white pixel-btn transition-colors"
            >
              Ver Catálogo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => {
              const isVirtual = product.category === 'virtuales';
              const isPorqueSi = product.category === 'porquesi';

              return (
                <div
                  key={product.id}
                  className="cart-row flex items-center justify-between p-2.5 rounded-xl bg-[#272a32]/60 backdrop-blur-sm gap-2.5 shadow-sm border border-white/10"
                  id={`cart-row-${product.id}`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#32353d] border border-white/10">
                    <img
                      src={product.thumbnailUrl || product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="px-1 py-0.2 rounded text-[8px] pixel-badge bg-black/70 text-[#4cd7f6] border border-[#4cd7f6]/40">
                        {product.code || 'GCL-00'}
                      </span>
                      {isVirtual && (
                        <span className="px-1 py-0.2 rounded text-[8px] pixel-badge bg-[#03b5d3]/30 text-[#4cd7f6]">
                          Virtual
                        </span>
                      )}
                      {product.category === 'fisicos' && (
                        <span className="px-1 py-0.2 rounded text-[8px] pixel-badge bg-[#32353d] text-[#4cd7f6]">
                          Físico
                        </span>
                      )}
                      {isPorqueSi && (
                        <span className="px-1 py-0.2 rounded text-[8px] pixel-badge bg-[#ffb2b7]/20 text-[#ffb2b7]">
                          Porque Sí
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-white truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs font-bold text-[#4cd7f6] font-mono">
                      S/. {(product.price * quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex items-center gap-1 shrink-0 bg-[#191b23] rounded-lg px-1.5 py-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        onUpdateQty(product.id, -1);
                      }}
                      className="w-5 h-5 rounded flex items-center justify-center text-white hover:bg-[#7c3aed] text-xs font-bold transition-colors"
                      id={`qty-minus-${product.id}`}
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold text-white px-1 min-w-3 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        onUpdateQty(product.id, 1);
                      }}
                      className="w-5 h-5 rounded flex items-center justify-center text-white hover:bg-[#7c3aed] text-xs font-bold transition-colors"
                      id={`qty-plus-${product.id}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Financial Summary */}
        <div className="p-3.5 rounded-xl bg-[#272a32]/60 backdrop-blur-md shadow-md flex flex-col gap-2 border border-white/10">
          <div className="flex items-center justify-between text-xs text-[#ccc3d8]">
            <span>Subtotal</span>
            <span className="text-white font-mono font-semibold">S/. {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#ccc3d8]">
            <span className="flex items-center gap-1">
              Envío Físico <span className="text-[10px] text-[#4cd7f6]">(Virtuales S/. 0.00)</span>
            </span>
            <span className="text-white font-mono font-semibold">
              {shippingCost === 0 ? 'GRATIS' : `S/. ${shippingCost.toFixed(2)}`}
            </span>
          </div>

          {/* Coupon Row */}
          <div className="flex items-center justify-between text-xs text-[#ffb2b7]">
            <span className="flex items-center gap-1 font-medium">
              <Tag className="w-3 h-3" /> Cupón: {couponApplied ? 'BIENVENIDOLAB' : 'Ninguno'}
            </span>
            <span className="font-mono font-bold">
              {couponApplied && items.length > 0 ? `-S/. ${discountAmount.toFixed(2)}` : 'S/. 0.00'}
            </span>
          </div>

          {/* Coupon Code Input Pill */}
          <div className="pt-1 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="CÓDIGO DE CUPÓN"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="bg-[#10131a] text-xs text-white px-2.5 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#7c3aed] flex-1 font-mono uppercase"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="px-2.5 py-1.5 bg-[#32353d] hover:bg-[#7c3aed] text-xs font-bold text-white rounded-lg transition-colors pixel-btn"
            >
              {couponApplied ? <Check className="w-3.5 h-3.5 text-emerald-400 inline" /> : 'Aplicar'}
            </button>
          </div>
          {couponError && <p className="text-[10px] text-red-400 font-mono">{couponError}</p>}

          {/* Total Due */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="font-display text-xs font-bold text-white leading-none">
                Total a Pagar
              </p>
              <span className="text-[10px] text-[#958da1]">Moneda: Soles (PEN)</span>
            </div>
            <span className="font-display text-lg sm:text-xl font-extrabold text-[#d2bbff] leading-none">
              S/. {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Checkout Action Button */}
        <button
          type="button"
          disabled={items.length === 0}
          onClick={() => {
            sfx.playChime();
            onProceedCheckout();
          }}
          className={`w-full py-3 px-4 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-2 shadow-xl pixel-btn transition-all ${
            items.length > 0
              ? 'bg-gradient-to-r from-[#7c3aed] via-[#732ee4] to-[#03b5d3] text-white hover:opacity-95 cursor-pointer'
              : 'bg-[#272a32] text-[#958da1] cursor-not-allowed opacity-60'
          }`}
          id="checkout-cta-btn"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Proceder al Pago</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Account Notice Micro-copy */}
        <p className="text-[11px] text-[#958da1] text-center px-1 leading-relaxed">
          Los productos virtuales se desbloquean inmediatamente tras confirmar el pago.
        </p>
      </div>
    </aside>
  );
};
