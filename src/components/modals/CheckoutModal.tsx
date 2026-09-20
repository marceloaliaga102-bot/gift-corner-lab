import React, { useState, useEffect } from 'react';
import { CartItem, Order, ProductDownloadFile, PaymentConfig } from '../../types';
import { 
  X, Lock, CheckCircle, ShieldCheck, Mail, MapPin, CreditCard, Sparkles, 
  Download, MessageCircle, AlertTriangle, ArrowRight, ExternalLink, Zap, Box, Check,
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
  const [customerName, setCustomerName] = useState('Marcelo Aliaga');
  const [customerEmail, setCustomerEmail] = useState('marceloaliaga102@gmail.com');
  const [customerPhone, setCustomerPhone] = useState('+51 921 617 882');
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<string>('');
  
  // Payment methods: yape, card, mercadopago, transfer
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'card' | 'mercadopago' | 'transfer'>('yape');
  
  // Yape Operation Number input
  const [yapeOpNumber, setYapeOpNumber] = useState('');

  // Card Form Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('Marcelo Aliaga');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Pre-payment physical notice state
  const [showPhysicalNoticeModal, setShowPhysicalNoticeModal] = useState(false);
  const [hasConfirmedPhysicalNotice, setHasConfirmedPhysicalNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaymentConfig(getPaymentConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Separate virtual and physical items
  const physicalItems = items.filter(
    item => item.product.productType === 'fisico' || item.product.category === 'fisicos' || item.product.category === 'porquesi'
  );
  const virtualItems = items.filter(
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

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = items.length > 0 ? 5.00 : 0.00;
  const shipping = 0.00;
  const total = Math.max(0, subtotal + shipping - discount);
  const totalPen = (total * 3.75).toFixed(2); // Approximate PEN currency conversion

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

    setTimeout(() => {
      sfx.playChime();
      const newOrder: Order = {
        id: `GC-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
        customerName,
        customerEmail,
        customerPhone: hasPhysical ? customerPhone : undefined,
        pickupLocation: hasPhysical ? currentPickup : undefined,
        items: [...items],
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
    }, 1200);
  };

  // Generate WhatsApp link for physical products
  const generateWhatsAppUrl = (order: Order) => {
    const physicalItemNames = order.items
      .filter(it => it.product.productType === 'fisico' || it.product.category === 'fisicos' || it.product.category === 'porquesi')
      .map(it => `${it.product.name} (x${it.quantity})`)
      .join(', ');

    const text = `¡Hola Marcelo y Angely! 👋
Acabo de pagar mi pedido #${order.id} en Gift Corner Lab.

📦 *Producto(s) Físico(s)*: ${physicalItemNames}
💰 *Total pagado*: $${order.total.toFixed(2)} (${totalPen} PEN)
💳 *Método de pago*: ${paymentMethod.toUpperCase()} ${order.yapeOpNumber ? `(Op: ${order.yapeOpNumber})` : ''}
👤 *Cliente*: ${order.customerName}
📞 *Mi teléfono*: ${customerPhone}
📍 *Punto de recogida de referencia*: ${currentPickup}

Escribo para coordinar la entrega y acordar el día y la hora exacta en el punto de encuentro. ¡Muchas gracias!`;

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
<style>body{background:#111827;color:#fff;font-family:sans-serif;text-align:center;padding:50px;}</style>
</head>
<body>
<h1>✨ ${prodName || 'Tu Producto Virtual'}</h1>
<p>¡Gracias por tu compra en Gift Corner Lab! Este es tu archivo digital verificado.</p>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#191b23] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#272a32] text-[#e1e2ec] hover:bg-[#32353d] transition-colors"
          id="checkout-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {!completedOrder ? (
          <form onSubmit={handleProceedPayment} className="flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] text-xs font-bold uppercase mb-2">
                <Lock className="w-3.5 h-3.5 text-[#4cd7f6]" /> Pasarela Cifrada &amp; Verificación Inmediata
              </div>
              <h2 className="font-display text-2xl font-bold text-[#e1e2ec]">
                Finalizar Compra Segura
              </h2>
              <p className="text-xs text-[#ccc3d8]">
                Elige tu método de pago preferido. Si compras productos virtuales, tus descargas se desbloquearán de inmediato.
              </p>
            </div>

            {/* Modalidad Badge Banner */}
            <div className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs border ${
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
                      Acordarás la entrega presencial directamente con Marcelo &amp; Angely.
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Datos Personales */}
            <div className="p-4 rounded-2xl bg-[#272a32]/60 border border-white/5 flex flex-col gap-3">
              <h3 className="font-display text-xs font-bold text-[#4cd7f6] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Datos de Contacto y Facturación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#958da1] block mb-1">Nombre Completo: *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#958da1] block mb-1">Correo Electrónico: *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>
            </div>

            {/* Si es FÍSICO: Teléfono / WhatsApp y Punto de Recogida */}
            {hasPhysical && (
              <div className="p-4 rounded-2xl bg-[#272a32]/60 border border-[#03b5d3]/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xs font-bold text-[#4cd7f6] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#4cd7f6]" /> Coordinación y Punto de Recogida
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#03b5d3]/20 text-[#4cd7f6] font-semibold">
                    📦 Obligatorio para Físicos
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#958da1] block mb-1">Teléfono / WhatsApp: *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+51 921 617 882"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#03b5d3]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#958da1] block mb-1">Punto de Recogida de Referencia: *</label>
                    <select
                      value={currentPickup}
                      onChange={(e) => setSelectedPickupLocation(e.target.value)}
                      className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#03b5d3] cursor-pointer"
                    >
                      {allPickupLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          📍 {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Selector (Yape, Tarjeta, Mercado Pago, Transferencia) */}
            <div className="flex flex-col gap-3">
              <label className="text-xs text-[#958da1] font-semibold">Selecciona Método de Pago:</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('yape'); sfx.playClick(); }}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'yape'
                      ? 'bg-[#7c3aed]/25 border-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20'
                      : 'bg-[#272a32] border-white/5 text-[#ccc3d8] hover:border-white/20'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#d2bbff]" />
                  <span>YAPE (Perú)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('card'); sfx.playClick(); }}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-[#7c3aed]/25 border-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20'
                      : 'bg-[#272a32] border-white/5 text-[#ccc3d8] hover:border-white/20'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('mercadopago'); sfx.playClick(); }}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'mercadopago'
                      ? 'bg-[#03b5d3]/25 border-[#03b5d3] text-[#4cd7f6] shadow-lg shadow-[#03b5d3]/20'
                      : 'bg-[#272a32] border-white/5 text-[#ccc3d8] hover:border-white/20'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-[#4cd7f6]" />
                  <span>Mercado Pago</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('transfer'); sfx.playClick(); }}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'transfer'
                      ? 'bg-[#c81a42]/25 border-[#c81a42] text-[#ffdedf] shadow-lg'
                      : 'bg-[#272a32] border-white/5 text-[#ccc3d8] hover:border-white/20'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-[#ffb2b7]" />
                  <span>Transferencia</span>
                </button>
              </div>

              {/* YAPE PAYMENT DETAILS BOX */}
              {paymentMethod === 'yape' && (
                <div className="p-4 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/40 flex flex-col sm:flex-row items-center gap-4 text-xs animate-fadeIn">
                  <div className="w-32 h-32 rounded-xl bg-white p-2 shrink-0 flex items-center justify-center shadow-md">
                    <img src={paymentConfig.yapeQrUrl} alt="Yape QR Code" className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-1 flex flex-col gap-2 text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7c3aed]/30 text-[#d2bbff] text-[10px] font-bold uppercase w-fit">
                      📱 Escanea o Yapea Directo
                    </div>

                    <div className="text-[#ccc3d8] leading-tight">
                      <p><strong className="text-white">Titular:</strong> {paymentConfig.yapeName}</p>
                      <p><strong className="text-white">Número de Yape:</strong> <span className="text-[#d2bbff] font-mono font-bold text-sm">{paymentConfig.yapePhone}</span></p>
                      <p><strong className="text-white">Monto equivalente:</strong> <span className="text-emerald-400 font-bold">S/. {totalPen} PEN</span> (${total.toFixed(2)} USD)</p>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#d2bbff] font-bold block mb-1">
                        Ingresa el Número de Operación de Yape: *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 84920194"
                        value={yapeOpNumber}
                        onChange={(e) => setYapeOpNumber(e.target.value)}
                        className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-xl border border-[#7c3aed] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* REAL CARD FORM BOX */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-[#10131a] border border-emerald-500/30 flex flex-col gap-3 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" /> Tarjeta de Débito o Crédito (Visa, Mastercard, AMEX)
                    </span>
                    <span className="text-[10px] text-emerald-300">Cifrado SSL 256-bit</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#958da1] block mb-1">Número de Tarjeta: *</label>
                      <input
                        type="text"
                        required
                        placeholder="4532 •••• •••• 8892"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#191b23] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#958da1] block mb-1">Nombre del Titular: *</label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-[#191b23] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#958da1] block mb-1">Expiración (MM/AA): *</label>
                      <input
                        type="text"
                        required
                        placeholder="08/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-[#191b23] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#958da1] block mb-1">CVC / CVV: *</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="•••"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-[#191b23] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MERCADO PAGO BOX */}
              {paymentMethod === 'mercadopago' && (
                <div className="p-4 rounded-2xl bg-[#03b5d3]/15 border border-[#03b5d3]/40 flex flex-col gap-2 text-xs text-[#ccc3d8] animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#4cd7f6]" />
                    <strong className="text-white font-semibold">Mercado Pago Checkout Oficial</strong>
                  </div>
                  <p className="text-[11px]">
                    Pagos procesados directamente a través de Mercado Pago con soporte para Yape, Tarjeta de Crédito, Débito y PagoEfectivo.
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-[#10131a] border border-white/5 flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-[#ccc3d8]">
                <span>Subtotal ({items.length} productos):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#ccc3d8]">
                <span>{hasPhysical ? 'Entrega en Punto de Recogida:' : 'Entrega Digital Inmediata:'}</span>
                <span className="text-emerald-400 font-semibold">GRATIS</span>
              </div>
              <div className="flex justify-between text-[#ffb2b7]">
                <span>Cupón BIENVENIDOLAB:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#e1e2ec] pt-2 border-t border-white/10">
                <span>Total a Pagar:</span>
                <span className="text-[#d2bbff]">${total.toFixed(2)} <span className="text-xs font-normal text-[#ccc3d8]">(S/. {totalPen} PEN)</span></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] via-[#732ee4] to-[#03b5d3] text-white font-display text-sm font-bold shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="pay-button"
            >
              <Lock className="w-4 h-4" />
              {isProcessing ? 'Verificando y Procesando Pago...' : `Pagar Ahora $${total.toFixed(2)} (S/. ${totalPen} PEN)`}
            </button>
          </form>
        ) : (
          /* ================= ORDER CONFIRMATION & POST-PAYMENT SCREEN ================= */
          <div className="flex flex-col items-center text-center py-4 gap-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase mb-2">
                <Check className="w-3.5 h-3.5" /> Pago Verificado &amp; Producto Liberado
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#e1e2ec]">
                ¡Gracias por tu compra en Gift Corner Lab!
              </h2>
              <p className="text-xs text-[#958da1] font-mono mt-1">
                Orden verificada: <strong className="text-[#d2bbff]">{completedOrder.id}</strong> • Método: <strong className="text-white uppercase">{completedOrder.paymentMethod}</strong>
              </p>
            </div>

            {/* VIRTUAL PRODUCTS SECTION: IMMEDIATE DOWNLOAD */}
            {virtualItems.length > 0 && (
              <div className="w-full p-5 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-left flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#d2bbff]" />
                    <h3 className="font-display text-sm font-bold text-white">
                      Descarga de Productos Virtuales
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7c3aed]/30 text-[#ede0ff] font-semibold">
                    Pago Aprobado
                  </span>
                </div>

                <p className="text-xs text-[#ccc3d8] leading-relaxed">
                  Tu pago ha sido verificado. Puedes descargar tu archivo digital directamente ahora mismo o abrir tu página HTML en el navegador. También está guardado en tu panel <strong>"Mi Cuenta"</strong>.
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  {virtualItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3.5 rounded-xl bg-[#10131a] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {item.product.name}
                        </span>
                        <span className="text-[11px] text-[#958da1] font-mono">
                          {item.product.downloadFile 
                            ? `${item.product.downloadFile.name} (${(item.product.downloadFile.size / 1024).toFixed(1)} KB)`
                            : 'Archivo HTML interactivo listo'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.product.downloadFile?.isHtml && (
                          <button
                            type="button"
                            onClick={() => handleOpenHtmlPreview(item.product.downloadFile)}
                            className="px-3 py-1.5 rounded-lg bg-[#272a32] hover:bg-[#32353d] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#4cd7f6]" /> Abrir Web
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownloadFile(item.product.downloadFile, item.product.name)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#03b5d3] hover:bg-[#4cd7f6] text-[#001f26] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                        >
                          <Download className="w-3.5 h-3.5" /> Descargar Producto
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHYSICAL PRODUCTS SECTION: WHATSAPP REDIRECTION */}
            {hasPhysical && (
              <div className="w-full p-5 rounded-2xl bg-[#03b5d3]/15 border border-[#03b5d3]/40 text-left flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#4cd7f6]" />
                    <h3 className="font-display text-sm font-bold text-white">
                      Coordinación de Entrega Física por WhatsApp
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#03b5d3]/30 text-[#4cd7f6] font-semibold">
                    Pago Verificado
                  </span>
                </div>

                <a
                  href={generateWhatsAppUrl(completedOrder)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sfx.playChime()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white font-display text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
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
              className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white font-display text-xs font-bold shadow-md hover:bg-[#732ee4] transition-colors"
            >
              Volver a la Tienda
            </button>
          </div>
        )}

        {/* PRE-PAYMENT PHYSICAL NOTICE MODAL */}
        {showPhysicalNoticeModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-lg rounded-3xl bg-[#191b23] border border-[#03b5d3]/50 p-6 sm:p-7 shadow-2xl flex flex-col gap-4 text-left relative">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-[#03b5d3]/20 text-[#4cd7f6] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4cd7f6] block">
                    Aviso Previo al Pago
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">
                    Coordinación de Entrega por WhatsApp
                  </h3>
                </div>
              </div>

              <div className="text-xs text-[#ccc3d8] leading-relaxed flex flex-col gap-2.5">
                <p>
                  Punto de recogida seleccionado: <strong className="text-[#4cd7f6]">{currentPickup}</strong>. Tras pagar, se abrirá WhatsApp con los datos de tu pedido para acordar el encuentro.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhysicalNoticeModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#272a32] text-xs font-semibold text-[#ccc3d8] hover:text-white flex-1"
                >
                  Modificar Punto
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHasConfirmedPhysicalNotice(true);
                    executePayment();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#03b5d3] text-[#001f26] font-display text-xs font-bold shadow-lg flex items-center justify-center gap-2 flex-1"
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
