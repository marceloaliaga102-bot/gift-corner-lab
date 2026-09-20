import React, { useState, useEffect } from 'react';
import { CartItem, Order, ProductDownloadFile, PaymentConfig } from '../../types';
import { 
  X, Lock, CheckCircle, ShieldCheck, Mail, MapPin, CreditCard, Sparkles, 
  Download, MessageCircle, ArrowRight, ExternalLink, Zap, Box, Check,
  QrCode, RefreshCw
} from 'lucide-react';
import { sfx } from '../../utils/audio';
import { getPaymentConfig } from '../../utils/database';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess
}) => {
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => getPaymentConfig());
  const [customerName, setCustomerName] = useState('Cliente');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<string>('');
  
  // Payment methods: yape, card, mercadopago, transfer
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'card' | 'mercadopago' | 'transfer'>('yape');
  
  // Yape Operation Number input
  const [yapeOpNumber, setYapeOpNumber] = useState('');

  // Card Form Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [activeItemsSnapshot, setActiveItemsSnapshot] = useState<CartItem[]>([]);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Pre-payment physical notice state
  const [showPhysicalNoticeModal, setShowPhysicalNoticeModal] = useState(false);
  const [hasConfirmedPhysicalNotice, setHasConfirmedPhysicalNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaymentConfig(getPaymentConfig());
      if (items.length > 0) {
        setActiveItemsSnapshot([...items]);
      }
    } else {
      setCompletedOrder(null);
      setHasConfirmedPhysicalNotice(false);
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  // Items source: use active items snapshot if cart gets cleared on order success
  const currentItems = completedOrder ? completedOrder.items : (items.length > 0 ? items : activeItemsSnapshot);

  // Separate virtual and physical items
  const physicalItems = currentItems.filter(
    item => item.product.productType === 'fisico' || item.product.category === 'fisicos' || item.product.category === 'porquesi'
  );
  const virtualItems = currentItems.filter(
    item => item.product.productType === 'virtual' || item.product.category === 'virtuales' || Boolean(item.product.downloadFile)
  );

  const hasPhysical = physicalItems.length > 0;
  const hasVirtual = virtualItems.length > 0;

  // Pickup Locations list
  const allPickupLocations = Array.from(
    new Set(
      physicalItems.flatMap(i => 
        i.product.pickupLocations && i.product.pickupLocations.length > 0 
          ? i.product.pickupLocations 
          : ['Plaza Central / Parque Principal', 'Estación Central / Tren', 'Taller Gift Corner Lab']
      )
    )
  );

  const currentPickup = selectedPickupLocation || allPickupLocations[0] || 'Plaza Central / Parque Principal';

  const subtotal = currentItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = currentItems.length > 0 ? 15.00 : 0.00;
  const shipping = hasPhysical ? 10.00 : 0.00;
  const total = Math.max(0, subtotal + shipping - discount);

  // Trigger payment submission
  const handleProceedPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (paymentMethod === 'yape' && !yapeOpNumber.trim()) {
      alert('Por favor ingresa el número de operación de tu comprobante de Yape.');
      return;
    }

    if (hasPhysical && !hasConfirmedPhysicalNotice) {
      sfx.playClick();
      setShowPhysicalNoticeModal(true);
      return;
    }

    executePayment();
  };

  const executePayment = () => {
    setIsProcessing(true);
    setShowPhysicalNoticeModal(false);

    // Save snapshot of current items before cart clears
    const orderItems = [...currentItems];

    setTimeout(() => {
      sfx.playChime();
      const newOrder: Order = {
        id: `GC-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
        customerName,
        customerEmail,
        customerPhone: hasPhysical ? customerPhone : undefined,
        pickupLocation: hasPhysical ? currentPickup : undefined,
        items: orderItems,
        subtotal,
        shipping,
        discount,
        total,
        status: hasPhysical ? 'En preparación' : 'Completado',
        paymentMethod,
        yapeOpNumber: paymentMethod === 'yape' ? yapeOpNumber.trim() : undefined,
        paymentStatus: 'aprobado',
        shippingAddress: hasPhysical ? `Punto de Recogida: ${currentPickup}` : undefined
      };

      setCompletedOrder(newOrder);
      onOrderSuccess(newOrder);
      setIsProcessing(false);
      // Scroll modal to top so user sees confirmation immediately
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }, 1200);
  };

  // Generate WhatsApp link for physical products (ONLY requested products with their unique code, no sensitive data)
  const generateWhatsAppUrl = (order: Order) => {
    const physicalItemsList = (order.items || [])
      .filter(it => it.product.productType === 'fisico' || it.product.category === 'fisicos' || it.product.category === 'porquesi')
      .map(it => `• ${it.product.name} (Código: ${it.product.code || 'GCL-00'})${it.quantity > 1 ? ` x${it.quantity}` : ''}`)
      .join('\n');

    const text = `¡Hola! Quiero pedir el siguiente producto:\n${physicalItemsList}`;
    const waPhoneClean = paymentConfig.yapePhone.replace(/\D/g, '') || '51921617882';
    return `https://wa.me/${waPhoneClean}?text=${encodeURIComponent(text)}`;
  };

  // Helper to trigger direct download of a virtual file
  const handleDownloadFile = (file?: ProductDownloadFile, prodName?: string) => {
    sfx.playChime();
    if (!file) {
      const sampleHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${prodName || 'Producto Digital'} - Gift Corner Lab</title>
<style>body{background:#0b0e15;color:#fff;font-family:'Pixelify Sans',sans-serif;text-align:center;padding:50px;}</style>
</head>
<body>
<h1>✨ ${prodName || 'Tu Producto Virtual'}</h1>
<p>¡Gracias por tu compra en Gift Corner Lab! Este es tu archivo digital verificado y liberado.</p>
</body>
</html>`;
      const blob = new Blob([sampleHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(prodName || 'producto').toLowerCase().replace(/\s+/g, '-')}.html`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
  };

  // Helper to open HTML in new window
  const handleOpenHtmlPreview = (file?: ProductDownloadFile) => {
    if (!file) return;
    const w = window.open();
    if (w) {
      if (file.dataUrl.startsWith('data:text/html;charset=utf-8,')) {
        w.document.write(decodeURIComponent(file.dataUrl.replace('data:text/html;charset=utf-8,', '')));
      } else if (file.dataUrl.includes('base64,')) {
        w.document.write(atob(file.dataUrl.split('base64,')[1]));
      } else {
        w.location.href = file.dataUrl;
      }
      w.document.close();
    }
  };

  // Manual payment verification toggle if pending
  const handleVerifyPendingPayment = () => {
    if (!completedOrder) return;
    sfx.playChime();
    const updated: Order = { ...completedOrder, paymentStatus: 'aprobado' };
    setCompletedOrder(updated);
    onOrderSuccess(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div ref={modalRef} className="relative w-full max-w-2xl rounded-2xl bg-[#191b23]/95 border border-white/10 p-4 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh] my-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#272a32] text-[#e1e2ec] hover:bg-[#32353d] transition-colors pixel-btn"
          id="checkout-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {!completedOrder ? (
          <form onSubmit={handleProceedPayment} className="flex flex-col gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#7c3aed]/20 text-[#d2bbff] text-[10px] pixel-badge uppercase mb-2">
                <Lock className="w-3 h-3 text-[#4cd7f6]" /> Pasarela Cifrada &amp; Verificación Inmediata
              </div>
              <h2 className="font-display text-lg sm:text-2xl font-bold text-white">
                Finalizar Compra
              </h2>
              <p className="text-xs text-[#ccc3d8] mt-1">
                Moneda oficial de pago: <strong className="text-[#4cd7f6] font-mono">Soles Peruanos (S/.)</strong>. Los productos virtuales se liberan tras verificar el pago.
              </p>
            </div>

            {/* Modalidad Badge Banner */}
            <div className={`p-3 rounded-xl flex items-center gap-3 text-xs border ${
              !hasPhysical
                ? 'bg-[#7c3aed]/15 border-[#7c3aed]/40 text-[#ede0ff]'
                : 'bg-[#03b5d3]/15 border-[#03b5d3]/40 text-[#e1f8ff]'
            }`}>
              {!hasPhysical ? (
                <>
                  <Zap className="w-5 h-5 text-[#d2bbff] shrink-0" />
                  <div>
                    <strong className="block text-white font-semibold">⚡ Compra 100% Digital</strong>
                    <span className="text-[#ccc3d8] text-[11px]">
                      Descarga tu archivo HTML/ZIP inmediatamente tras pagar.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Box className="w-5 h-5 text-[#4cd7f6] shrink-0" />
                  <div>
                    <strong className="block text-white font-semibold">📦 Entrega Física Coordinada por WhatsApp</strong>
                    <span className="text-[#ccc3d8] text-[11px]">
                      Al pagar, se enviará el pedido a WhatsApp únicamente con el producto y su código único.
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Si es FÍSICO: Punto de Recogida de Referencia */}
            {hasPhysical && (
              <div className="p-3.5 rounded-xl bg-[#272a32]/60 border border-[#03b5d3]/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xs font-bold text-[#4cd7f6] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#4cd7f6]" /> Punto de Recogida de Referencia
                  </h3>
                  <span className="text-[9px] pixel-badge px-2 py-0.5 rounded bg-[#03b5d3]/20 text-[#4cd7f6]">
                    Entrega Presencial
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-[#958da1] block mb-1 font-mono">Punto de Entrega para coordinar:</label>
                  <select
                    value={currentPickup}
                    onChange={(e) => setSelectedPickupLocation(e.target.value)}
                    className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#03b5d3]"
                  >
                    {allPickupLocations.map((loc, idx) => (
                      <option key={idx} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs text-[#958da1] font-semibold font-mono">Selecciona Método de Pago en Soles (S/.):</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('yape'); sfx.playClick(); }}
                  className={`p-2.5 rounded-lg border text-xs font-bold pixel-btn flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'yape'
                      ? 'bg-[#7c3aed]/30 border-[#7c3aed] text-white'
                      : 'bg-[#272a32] border-white/10 text-[#ccc3d8] hover:border-white/25'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#d2bbff]" />
                  <span>YAPE (Perú)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('card'); sfx.playClick(); }}
                  className={`p-2.5 rounded-lg border text-xs font-bold pixel-btn flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-[#7c3aed]/30 border-[#7c3aed] text-white'
                      : 'bg-[#272a32] border-white/10 text-[#ccc3d8] hover:border-white/25'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('mercadopago'); sfx.playClick(); }}
                  className={`p-2.5 rounded-lg border text-xs font-bold pixel-btn flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'mercadopago'
                      ? 'bg-[#03b5d3]/30 border-[#03b5d3] text-[#4cd7f6]'
                      : 'bg-[#272a32] border-white/10 text-[#ccc3d8] hover:border-white/25'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-[#4cd7f6]" />
                  <span>Mercado Pago</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('transfer'); sfx.playClick(); }}
                  className={`p-2.5 rounded-lg border text-xs font-bold pixel-btn flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'transfer'
                      ? 'bg-[#c81a42]/30 border-[#c81a42] text-[#ffdedf]'
                      : 'bg-[#272a32] border-white/10 text-[#ccc3d8] hover:border-white/25'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-[#ffb2b7]" />
                  <span>Transferencia</span>
                </button>
              </div>

              {/* YAPE PAYMENT DETAILS BOX */}
              {paymentMethod === 'yape' && (
                <div className="p-3.5 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/40 flex flex-col sm:flex-row items-center gap-4 text-xs animate-fadeIn">
                  <div className="w-28 h-28 rounded-lg bg-white p-2 shrink-0 flex items-center justify-center shadow-md">
                    <img src={paymentConfig.yapeQrUrl} alt="Yape QR Code" className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 text-left w-full">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#7c3aed]/30 text-[#d2bbff] text-[9px] pixel-badge uppercase w-fit">
                      📱 Yapear en Soles
                    </div>

                    <div className="text-[#ccc3d8] leading-tight text-[11px]">
                      <p><strong className="text-white">Titular:</strong> {paymentConfig.yapeName}</p>
                      <p><strong className="text-white">Número:</strong> <span className="text-[#d2bbff] font-mono font-bold">{paymentConfig.yapePhone}</span></p>
                      <p><strong className="text-white">Monto a Yapear:</strong> <span className="text-emerald-400 font-bold font-mono">S/. {total.toFixed(2)} PEN</span></p>
                    </div>

                    <div className="mt-1">
                      <label className="text-[11px] text-[#d2bbff] font-bold block mb-1">
                        Ingresa el Número de Operación de Yape: *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 84920194"
                        value={yapeOpNumber}
                        onChange={(e) => setYapeOpNumber(e.target.value)}
                        className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-lg border border-[#7c3aed] focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CARD FORM BOX */}
              {paymentMethod === 'card' && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-2.5 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" /> Tarjeta de Débito / Crédito
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Pasarela Segura SSL</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] text-[#958da1] block mb-1 font-mono">Titular de la Tarjeta:</label>
                      <input
                        type="text"
                        required
                        placeholder="Nombre como figura en la tarjeta"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#958da1] block mb-1 font-mono">Número de Tarjeta:</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4557 •••• •••• 1234"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#958da1] block mb-1 font-mono">Fecha Expiración (MM/AA):</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#958da1] block mb-1 font-mono">CVV / CVC:</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MERCADO PAGO BOX */}
              {paymentMethod === 'mercadopago' && (
                <div className="p-3.5 rounded-xl bg-[#03b5d3]/15 border border-[#03b5d3]/40 flex flex-col gap-2 text-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#4cd7f6]" />
                    <strong className="text-white font-semibold">Mercado Pago Perú (Acreditación Inmediata)</strong>
                  </div>
                  <p className="text-[#ccc3d8] text-[11px]">
                    Acepta tarjetas de todos los bancos en Soles, PagoEfectivo y saldo en cuenta. Al presionar pagar se validará la transacción.
                  </p>
                </div>
              )}

              {/* TRANSFER BOX */}
              {paymentMethod === 'transfer' && (
                <div className="p-3.5 rounded-xl bg-[#c81a42]/15 border border-[#c81a42]/40 flex flex-col gap-2 text-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#ffb2b7]" />
                    <strong className="text-white font-semibold">Transferencia Bancaria BCP / Interbank</strong>
                  </div>
                  <p className="text-[#ccc3d8] text-[11px] font-mono">
                    BCP Soles: 191-9482019-0-42 • CCI: 002-191-009482019042-55 (Titular: Gift Corner Lab)
                  </p>
                </div>
              )}
            </div>

            {/* Resumen de Compra en Soles */}
            <div className="p-3.5 rounded-xl bg-[#10131a] border border-white/10 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-[#ccc3d8]">
                <span>Subtotal ({currentItems.length} productos):</span>
                <span className="font-mono">S/. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#ccc3d8]">
                <span>{hasPhysical ? 'Entrega en Punto de Recogida:' : 'Entrega Digital:'}</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  {shipping === 0 ? 'GRATIS' : `S/. ${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-[#ffb2b7]">
                <span>Descuento Cupón:</span>
                <span className="font-mono">-S/. {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-white pt-2 border-t border-white/10">
                <span>Total a Pagar:</span>
                <span className="text-[#d2bbff] font-display">S/. {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c3aed] via-[#732ee4] to-[#03b5d3] text-white font-display text-xs sm:text-sm font-bold shadow-xl hover:opacity-95 pixel-btn flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="pay-button"
            >
              <Lock className="w-4 h-4" />
              {isProcessing ? 'Verificando y Procesando Pago...' : `Pagar Ahora S/. ${total.toFixed(2)} PEN`}
            </button>
          </form>
        ) : (
          /* ================= ORDER CONFIRMATION & POST-PAYMENT SCREEN ================= */
          <div className="flex flex-col items-center text-center py-2 sm:py-4 gap-3 sm:gap-4 animate-fadeIn">
            <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg ${
              completedOrder.paymentStatus === 'aprobado' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              {completedOrder.paymentStatus === 'aprobado' ? <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" /> : <Lock className="w-6 h-6 sm:w-8 sm:h-8" />}
            </div>

            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] pixel-badge uppercase mb-2 ${
                completedOrder.paymentStatus === 'aprobado' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {completedOrder.paymentStatus === 'aprobado' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Pago Verificado &amp; Producto Liberado
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Pago Pendiente • Producto Retenido
                  </>
                )}
              </div>
              <h2 className="font-display text-base sm:text-xl font-bold text-white">
                {completedOrder.paymentStatus === 'aprobado' 
                  ? '¡Gracias por tu compra en Gift Corner Lab!' 
                  : 'Pedido Registrado - Verificación en Proceso'}
              </h2>
              <p className="text-xs text-[#958da1] font-mono mt-1">
                Orden: <strong className="text-[#d2bbff]">{completedOrder.id}</strong> • Método: <strong className="text-white uppercase">{completedOrder.paymentMethod}</strong> • Total: <strong className="text-emerald-400">S/. {completedOrder.total.toFixed(2)}</strong>
              </p>
            </div>

            {/* VIRTUAL PRODUCTS SECTION: IMMEDIATE DOWNLOAD ON APPROVED, OR RETENIDO ON PENDING */}
            {virtualItems.length > 0 && (
              <div className="w-full p-4 sm:p-5 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-left flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#d2bbff]" />
                    <h3 className="font-display text-xs sm:text-sm font-bold text-white">
                      Descarga de Productos Virtuales
                    </h3>
                  </div>
                  <span className={`text-[9px] pixel-badge px-2 py-0.5 rounded ${
                    completedOrder.paymentStatus === 'aprobado' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {completedOrder.paymentStatus === 'aprobado' ? 'Liberado' : 'Retenido'}
                  </span>
                </div>

                {completedOrder.paymentStatus === 'aprobado' ? (
                  <p className="text-xs text-[#ccc3d8] leading-relaxed">
                    Tu pago ha sido verificado con éxito. Puedes descargar tu archivo digital inmediatamente abajo o abrir la página interactiva. También está guardado de forma permanente en tu panel <strong>"Mi Cuenta"</strong>.
                  </p>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex flex-col gap-2">
                    <p>
                      <strong>⚠️ Producto Virtual Retenido:</strong> El acceso a la descarga está en espera de la confirmación del pago.
                    </p>
                    <button
                      type="button"
                      onClick={handleVerifyPendingPayment}
                      className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-display font-bold pixel-btn w-fit flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verificar y Liberar Pago Ahora</span>
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  {virtualItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-lg bg-[#10131a] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white block">
                            {item.product.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#4cd7f6] bg-[#03b5d3]/10 px-1.5 py-0.5 rounded">
                            {item.product.code}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#958da1] font-mono">
                          {item.product.downloadFile 
                            ? `${item.product.downloadFile.name} (${(item.product.downloadFile.size / 1024).toFixed(1)} KB)`
                            : 'Archivo HTML interactivo listo'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {completedOrder.paymentStatus === 'aprobado' ? (
                          <>
                            {item.product.downloadFile?.isHtml && (
                              <button
                                type="button"
                                onClick={() => handleOpenHtmlPreview(item.product.downloadFile)}
                                className="px-3 py-1.5 rounded-lg bg-[#272a32] hover:bg-[#32353d] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10 pixel-btn"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-[#4cd7f6]" /> Abrir Web
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDownloadFile(item.product.downloadFile, item.product.name)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#03b5d3] hover:bg-[#4cd7f6] text-[#001f26] text-xs font-bold pixel-btn flex items-center gap-1.5 transition-colors shadow-md"
                            >
                              <Download className="w-3.5 h-3.5" /> Descargar Producto
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1.5 rounded bg-amber-500/10 text-amber-300 text-xs font-mono border border-amber-500/30 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Retenido hasta pago
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHYSICAL PRODUCTS SECTION: WHATSAPP REDIRECTION (ONLY PRODUCT & CODE) */}
            {hasPhysical && (
              <div className="w-full p-4 sm:p-5 rounded-xl bg-[#03b5d3]/15 border border-[#03b5d3]/40 text-left flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#4cd7f6]" />
                    <h3 className="font-display text-xs sm:text-sm font-bold text-white">
                      Coordinación de Entrega Física por WhatsApp
                    </h3>
                  </div>
                  <span className="text-[9px] pixel-badge px-2 py-0.5 rounded bg-[#03b5d3]/30 text-[#4cd7f6]">
                    Entrega
                  </span>
                </div>

                <p className="text-xs text-[#ccc3d8]">
                  Pulsa el botón para abrir WhatsApp. Se enviará automáticamente el mensaje solicitando tu producto con su código único:
                </p>

                <div className="p-2.5 rounded bg-[#10131a] border border-white/10 font-mono text-[11px] text-[#4cd7f6]">
                  {physicalItems.map(it => (
                    <div key={it.product.id}>
                      • {it.product.name} (Código: <strong>{it.product.code}</strong>)
                    </div>
                  ))}
                </div>

                <a
                  href={generateWhatsAppUrl(completedOrder)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sfx.playChime()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white font-display text-xs sm:text-sm font-bold pixel-btn flex items-center justify-center gap-2 shadow-lg transition-all"
                  id="whatsapp-contact-btn"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Enviar Mensaje a WhatsApp para Coordinar Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white font-display text-xs font-bold shadow-md hover:bg-[#732ee4] transition-colors"
            >
              Volver a la Tienda
            </button>
          </div>
        )}

        {/* PRE-PAYMENT PHYSICAL NOTICE MODAL */}
        {showPhysicalNoticeModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-lg rounded-2xl bg-[#191b23] border border-[#03b5d3]/50 p-6 shadow-2xl flex flex-col gap-4 text-left pixel-border">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-lg bg-[#03b5d3]/20 text-[#4cd7f6] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] pixel-badge uppercase tracking-wider text-[#4cd7f6] block">
                    Aviso Previo al Pago
                  </span>
                  <h3 className="font-display text-sm sm:text-base font-bold text-white">
                    Coordinación de Entrega por WhatsApp
                  </h3>
                </div>
              </div>

              <div className="text-xs text-[#ccc3d8] leading-relaxed flex flex-col gap-2">
                <p>
                  Punto de recogida seleccionado: <strong className="text-[#4cd7f6]">{currentPickup}</strong>.
                </p>
                <p>
                  Al pagar, se abrirá WhatsApp con el código único de tu producto para coordinar la entrega con Gift Corner Lab.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhysicalNoticeModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#272a32] text-xs font-semibold text-[#ccc3d8] hover:text-white flex-1 pixel-btn"
                >
                  Modificar Punto
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHasConfirmedPhysicalNotice(true);
                    executePayment();
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#03b5d3] text-[#001f26] font-display text-xs font-bold pixel-btn shadow-lg flex items-center justify-center gap-2 flex-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Entendido, Pagar Ahora</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
