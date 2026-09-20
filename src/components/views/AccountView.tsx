import React from 'react';
import { Order, AppView, User, ProductDownloadFile } from '../../types';
import { 
  User as UserIcon, Download, Package, ExternalLink, ShieldCheck, LogOut, FileCode,
  MessageCircle, MapPin, Zap, Box, Lock, CheckCircle
} from 'lucide-react';
import { sfx } from '../../utils/audio';

interface AccountViewProps {
  orders: Order[];
  currentUser: User | null;
  onNavigate: (view: AppView) => void;
  onOpenPreview3D: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  orders,
  currentUser,
  onNavigate,
  onOpenPreview3D,
  onOpenAuthModal,
  onLogout
}) => {
  if (!currentUser) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/40 flex items-center justify-center text-[#d2bbff] mb-4 pixel-border">
          <UserIcon className="w-8 h-8" />
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
          Accede a Tu Cuenta
        </h1>
        <p className="text-xs text-[#ccc3d8] mb-6 leading-relaxed">
          Inicia sesión o regístrate para descargar tus productos virtuales liberados y consultar tus pedidos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            type="button"
            onClick={() => onOpenAuthModal('login')}
            className="px-6 py-3 rounded-xl bg-[#7c3aed] text-white font-display text-xs font-bold pixel-btn shadow-lg hover:bg-[#732ee4] transition-all"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => onOpenAuthModal('register')}
            className="px-6 py-3 rounded-xl bg-[#272a32] hover:bg-[#32353d] text-white font-display text-xs font-bold pixel-btn transition-all border border-white/10"
          >
            Crear Cuenta Nueva
          </button>
        </div>
      </div>
    );
  }

  const isCreator = currentUser.role === 'creator';

  // Extract all digital downloads from all completed orders + default virtuals
  const purchasedDownloads: { 
    title: string; 
    code?: string;
    file?: ProductDownloadFile; 
    is3D?: boolean; 
    date: string;
    isPaid: boolean;
    orderId?: string;
  }[] = [
    {
      title: 'Cuponera de Amor & Carta Digital 3D',
      code: 'GCL-VIR-01',
      is3D: true,
      date: '2026-09-18',
      isPaid: true
    }
  ];

  // Scan user's orders for digital items with downloadable files
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const isPaid = order.paymentStatus === 'aprobado' || !order.paymentStatus;
      if (item.product.downloadFile) {
        purchasedDownloads.push({
          title: item.product.name,
          code: item.product.code,
          file: item.product.downloadFile,
          date: order.date,
          isPaid,
          orderId: order.id
        });
      } else if (item.product.category === 'virtuales' && item.product.id !== 'cuponera-amor-3d') {
        purchasedDownloads.push({
          title: item.product.name,
          code: item.product.code,
          date: order.date,
          isPaid,
          orderId: order.id
        });
      }
    });
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-6 flex flex-col gap-6">
      {/* Header Profile Card */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[#191b23]/90 border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 pixel-border">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold font-display shadow-lg border border-white/15 ${
            isCreator ? 'bg-[#c81a42] text-[#ffdedf]' : 'bg-[#7c3aed] text-[#ede0ff]'
          }`}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] pixel-badge uppercase mb-1 bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> {isCreator ? 'Maestro Creador' : 'Cuenta Registrada'}
            </div>
            <h1 className="font-display text-base sm:text-lg font-bold text-white">
              {currentUser.name}
            </h1>
            <p className="text-xs text-[#958da1] font-mono">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isCreator && (
            <button
              type="button"
              onClick={() => onNavigate('admin-panel')}
              className="px-4 py-2 rounded-lg bg-[#c81a42] hover:bg-[#a61536] text-xs font-display font-bold text-white pixel-btn transition-all flex items-center gap-1.5 shadow-md"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Panel Admin</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onLogout();
            }}
            className="px-3.5 py-2 rounded-lg bg-[#272a32] hover:bg-red-950/50 text-xs font-display font-bold text-[#ccc3d8] hover:text-red-400 pixel-btn transition-colors border border-white/10 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Instant Digital Downloads Section */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[#191b23]/90 border border-white/10 shadow-xl flex flex-col gap-4 pixel-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-[#4cd7f6]" />
              Descargas &amp; Archivos Virtuales
            </h2>
            <p className="text-xs text-[#958da1]">
              Acceso vitalicio. Los archivos se liberan una vez confirmado el pago en Soles.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#03b5d3]/20 text-[#4cd7f6] text-[9px] pixel-badge">
            {purchasedDownloads.length} {purchasedDownloads.length === 1 ? 'Producto' : 'Productos'}
          </span>
        </div>

        <div className="flex flex-col gap-3 pt-1">
          {purchasedDownloads.map((item, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#272a32]/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#10131a] flex items-center justify-center text-[#4cd7f6] shrink-0 border border-white/10">
                  {item.file?.isHtml ? <FileCode className="w-5 h-5 text-[#ffb2b7]" /> : <Download className="w-5 h-5 text-[#4cd7f6]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    {item.code && (
                      <span className="text-[9px] pixel-badge px-1.5 py-0.5 rounded bg-black/70 text-[#4cd7f6] border border-[#4cd7f6]/40">
                        {item.code}
                      </span>
                    )}
                    <span className="text-[10px] text-[#958da1] uppercase font-mono">
                      {item.date}
                    </span>
                    <span className={`text-[8px] pixel-badge px-1.5 py-0.2 rounded ${
                      item.isPaid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.isPaid ? 'Liberado' : 'Retenido'}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  {item.file && (
                    <span className="text-[11px] text-[#ccc3d8] font-mono">
                      Archivo: {item.file.name} ({(item.file.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.is3D ? (
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playChime();
                      onOpenPreview3D();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#732ee4] text-white text-xs font-display font-bold pixel-btn flex items-center gap-1.5 shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir Carta 3D
                  </button>
                ) : !item.isPaid ? (
                  <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Retenido hasta confirmación
                  </span>
                ) : item.file ? (
                  <div className="flex items-center gap-1.5">
                    {item.file.isHtml && (
                      <button
                        type="button"
                        onClick={() => {
                          const w = window.open();
                          if (w) {
                            w.document.write(decodeURIComponent(item.file!.dataUrl.replace('data:text/html;charset=utf-8,', '')));
                            w.document.close();
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#272a32] hover:bg-[#32353d] text-white text-xs font-bold pixel-btn border border-white/10"
                        title="Ver en navegador"
                      >
                        Abrir Web
                      </button>
                    )}
                    <a
                      href={item.file.dataUrl}
                      download={item.file.name}
                      onClick={() => sfx.playChime()}
                      className="px-3.5 py-1.5 rounded-lg bg-[#03b5d3] hover:bg-[#4cd7f6] text-[#001f26] text-xs font-display font-bold pixel-btn flex items-center gap-1.5 shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar {item.file.isHtml ? 'HTML' : 'Archivo'}
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      alert('Descargando archivo digital...');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#03b5d3] hover:bg-[#4cd7f6] text-[#001f26] text-xs font-display font-bold pixel-btn flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders History */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[#191b23]/90 border border-white/10 shadow-xl flex flex-col gap-4 pixel-border">
        <h2 className="font-display text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-[#d2bbff]" />
          Historial de Pedidos
        </h2>

        {orders.length === 0 ? (
          <p className="text-xs text-[#958da1] py-4 text-center font-mono">
            No tienes pedidos registrados todavía.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((ord) => {
              const hasPhysical = ord.items.some(
                it => it.product.productType === 'fisico' || it.product.category === 'fisicos' || it.product.category === 'porquesi'
              );
              const physicalProductsList = ord.items
                .filter(it => it.product.productType === 'fisico' || it.product.category === 'fisicos' || it.product.category === 'porquesi')
                .map(it => `• ${it.product.name} (Código: ${it.product.code || 'GCL-00'}) x${it.quantity}`)
                .join('\n');

              const waMessage = `¡Hola! Quiero pedir el siguiente producto:\n${physicalProductsList || 'Pedido'}`;
              const waUrl = `https://wa.me/51921617882?text=${encodeURIComponent(waMessage)}`;

              return (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-xl bg-[#272a32]/50 border border-white/10 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#d2bbff] font-semibold">{ord.id}</span>
                      {hasPhysical ? (
                        <span className="px-2 py-0.5 rounded text-[8px] pixel-badge bg-[#03b5d3]/20 text-[#4cd7f6] flex items-center gap-1">
                          <Box className="w-2.5 h-2.5" /> Físico
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] pixel-badge bg-[#7c3aed]/20 text-[#d2bbff] flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" /> Virtual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] pixel-badge ${
                        ord.paymentStatus === 'aprobado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {ord.paymentStatus === 'aprobado' ? 'Pago Verificado' : 'Pago Pendiente'}
                      </span>
                      <span className="text-[#ccc3d8] font-mono text-[11px]">
                        {ord.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#ccc3d8]">
                    {ord.items.map((it) => `${it.product.name} [${it.product.code || 'GCL-00'}] (x${it.quantity})`).join(', ')}
                  </div>

                  {/* Physical order WhatsApp CTA (Only product and code) */}
                  {hasPhysical && (
                    <div className="p-2.5 rounded-lg bg-[#10131a] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-[#4cd7f6]">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px]">
                          Punto: {ord.pickupLocation || ord.shippingAddress || 'Plaza Central'}
                        </span>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold pixel-btn flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Pedir por WhatsApp</span>
                      </a>
                    </div>
                  )}

                  <div className="text-xs text-[#958da1] flex items-center justify-between pt-1 border-t border-white/10 font-mono">
                    <span>{ord.date}</span>
                    <span className="font-bold text-white font-display text-sm">
                      S/. {ord.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
