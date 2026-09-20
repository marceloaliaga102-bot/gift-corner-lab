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
  
  const shippingCost = items.length === 0 ? 0 : hasPhysical ? 3.50 : 0.00;
  const discountAmount = couponApplied && items.length > 0 ? 5.00 : 0.00;
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
      <div className="rounded-3xl bg-[#191b23]/85 backdrop-blur-2xl shadow-2xl p-4 sm:p-6 flex flex-col gap-4 relative overflow-hidden border border-white/10">
        
        {/* Cart Ambient Backlight */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#7c3aed]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-[#ede0ff] shadow-md">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#e1e2ec] leading-tight">
                Tu Carrito
              </h2>
              <span className="text-[11px] text-[#958da1]">
                {totalCount} {totalCount === 1 ? 'producto seleccionado' : 'productos seleccionados'}
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
              className="text-xs text-[#ffb2b7] hover:underline flex items-center gap-1 transition-colors"
              id="clear-cart-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          )}
        </div>

        {/* Multi-Item Mixed Notification Banner */}
        {hasPhysical && hasVirtual && (
          <div className="p-2.5 rounded-xl bg-[#272a32]/60 backdrop-blur-md flex items-start gap-2 border border-white/5 shadow-inner">
            <Sparkles className="w-4 h-4 text-[#4cd7f6] shrink-0 mt-0.5" />
            <p className="text-xs text-[#ccc3d8] leading-snug">
              ¡Combinación perfecta! Llevas productos físicos y descargas digitales en la misma orden.
            </p>
          </div>
        )}

        {/* Items List */}
        {items.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center gap-2 text-[#958da1]">
            <ShoppingBag className="w-10 h-10 text-[#958da1]/50 mb-1" />
            <p className="text-sm text-[#e1e2ec] font-medium">Tu carrito está vacío.</p>
            <p className="text-xs text-[#958da1]">Explora nuestros regalos físicos y virtuales.</p>
            <button
              type="button"
              onClick={onExploreCatalog}
              className="mt-2 px-3 py-1.5 rounded-lg bg-[#7c3aed]/30 hover:bg-[#7c3aed] text-xs font-semibold text-[#d2bbff] hover:text-white transition-colors"
            >
              Explorar Catálogo
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
                  className="cart-row flex items-center justify-between p-2.5 rounded-2xl bg-[#272a32]/40 backdrop-blur-sm gap-2.5 shadow-sm border border-white/5"
                  id={`cart-row-${product.id}`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#32353d]">
                    <img
                      src={product.thumbnailUrl || product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      {isVirtual && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-display font-bold bg-[#03b5d3]/30 text-[#4cd7f6]">
                          ⚡ Virtual
                        </span>
                      )}
                      {product.category === 'fisicos' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-display font-bold bg-[#32353d] text-[#4cd7f6]">
                          📦 Físico
                        </span>
                      )}
                      {isPorqueSi && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-display font-bold bg-[#ffb2b7]/20 text-[#ffb2b7]">
                          🦄 Porque Sí
                        </span>
                      )}
                    </div>
                    <h4 className="font-display text-xs font-semibold text-[#e1e2ec] truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#4cd7f6]">
                      ${(product.price * quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex items-center gap-1 shrink-0 bg-[#32353d]/80 rounded-xl px-1.5 py-1 border border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        onUpdateQty(product.id, -1);
                      }}
                      className="w-5 h-5 rounded-lg flex items-center justify-center text-[#e1e2ec] hover:bg-[#1d1f27] text-xs font-bold transition-colors"
                      id={`qty-minus-${product.id}`}
                    >
                      -
                    </button>
                    <span className="font-display text-xs font-bold text-[#e1e2ec] px-1 min-w-3 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        onUpdateQty(product.id, 1);
                      }}
                      className="w-5 h-5 rounded-lg flex items-center justify-center text-[#e1e2ec] hover:bg-[#1d1f27] text-xs font-bold transition-colors"
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
        <div className="p-4 rounded-2xl bg-[#272a32]/50 backdrop-blur-md shadow-md flex flex-col gap-2.5 border border-white/5">
          <div className="flex items-center justify-between text-xs text-[#ccc3d8]">
            <span>Subtotal</span>
            <span className="text-[#e1e2ec] font-semibold">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#ccc3d8]">
            <span className="flex items-center gap-1">
              Envío Físico <span className="text-[10px] text-[#4cd7f6]">(Virtuales $0)</span>
            </span>
            <span className="text-[#e1e2ec] font-semibold">${shippingCost.toFixed(2)}</span>
          </div>

          {/* Coupon Row */}
          <div className="flex items-center justify-between text-xs text-[#ffb2b7]">
            <span className="flex items-center gap-1 font-medium">
              <Tag className="w-3.5 h-3.5" /> Cupón: {couponApplied ? 'BIENVENIDOLAB' : 'Ninguno'}
            </span>
            <span className="font-bold">
              {couponApplied && items.length > 0 ? `-$${discountAmount.toFixed(2)}` : '$0.00'}
            </span>
          </div>

          {/* Coupon Code Input Pill */}
          <div className="pt-1 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Código de descuento"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="bg-[#10131a] text-xs text-[#e1e2ec] px-2.5 py-1 rounded-lg border border-white/10 focus:outline-none focus:border-[#7c3aed] flex-1"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="px-2.5 py-1 bg-[#32353d] hover:bg-[#7c3aed] text-xs font-semibold text-[#e1e2ec] rounded-lg transition-colors"
            >
              {couponApplied ? <Check className="w-3 h-3 text-emerald-400 inline" /> : 'Aplicar'}
            </button>
          </div>
          {couponError && <p className="text-[10px] text-red-400">{couponError}</p>}

          {/* Total Due */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="font-display text-sm font-bold text-[#e1e2ec] leading-none">
                Total a Pagar
              </p>
              <span className="text-[11px] text-[#958da1]">Impuestos incluidos</span>
            </div>
            <span className="font-display text-2xl font-extrabold text-[#d2bbff] leading-none">
              ${total.toFixed(2)}
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
          className={`w-full py-3.5 px-4 rounded-2xl font-display text-sm font-bold flex items-center justify-center gap-2 shadow-xl transition-all transform ${
            items.length > 0
              ? 'bg-gradient-to-r from-[#7c3aed] via-[#732ee4] to-[#03b5d3] text-[#ede0ff] hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              : 'bg-[#272a32] text-[#958da1] cursor-not-allowed opacity-60'
          }`}
          id="checkout-cta-btn"
        >
          <Lock className="w-4 h-4" />
          <span>Proceder al Pago Seguro</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Account Notice Micro-copy */}
        <p className="text-xs text-[#958da1] text-center px-1 leading-relaxed">
          Puedes comprar productos físicos y virtuales en un solo pedido. Guarda tu compra iniciando sesión o regístrate en el checkout.
        </p>
      </div>
    </aside>
  );
};
