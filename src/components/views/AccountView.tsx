import React from 'react';
import { Order, AppView, User, ProductDownloadFile } from '../../types';
import { 
  User as UserIcon, Download, Package, ExternalLink, ShieldCheck, LogOut, FileCode, Sparkles,
  MessageCircle, MapPin, Zap, Box
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
        <div className="w-16 h-16 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-[#d2bbff] mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#e1e2ec] mb-2">
          Accede a Tu Cuenta
        </h1>
        <p className="text-sm text-[#ccc3d8] mb-6 leading-relaxed">
          Crea una cuenta o inicia sesión para ver tus descargas digitales, archivos HTML comprados y el estado de tus envíos. Tu cuenta se guarda de forma permanente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            type="button"
            onClick={() => onOpenAuthModal('login')}
            className="px-6 py-3 rounded-xl bg-[#7c3aed] text-white font-display text-xs font-bold shadow-lg hover:bg-[#732ee4] transition-all"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => onOpenAuthModal('register')}
            className="px-6 py-3 rounded-xl bg-[#272a32] hover:bg-[#32353d] text-white font-display text-xs font-bold transition-all border border-white/10"
          >
            Crear Cuenta Nueva
          </button>
        </div>
      </div>
    );
  }

  const isCreator = currentUser.role === 'creator';

  // Extract all digital downloads from all completed orders + default virtuals
  const purchasedDownloads: { title: string; file?: ProductDownloadFile; is3D?: boolean; date: string }[] = [
    {
      title: 'Cuponera de Amor & Carta Digital 3D',
      is3D: true,
      date: '2026-09-18'
    }
  ];

  // Scan user's orders for digital items with downloadable files
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.product.downloadFile) {
        purchasedDownloads.push({
          title: item.product.name,
          file: item.product.downloadFile,
          date: order.date
        });
      } else if (item.product.category === 'virtuales' && item.product.id !== 'cuponera-amor-3d') {
        purchasedDownloads.push({
          title: item.product.name,
          date: order.date
        });
      }
    });
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-6 flex flex-col gap-8">
      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#191b23]/80 border border-white/5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold font-display shadow-lg ${
            isCreator ? 'bg-[#c81a42] text-[#ffdedf]' : 'bg-[#7c3aed] text-[#ede0ff]'
          }`}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1 bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> {isCreator ? 'Cuenta Maestro Creador' : 'Cuenta Permanente Guardada'}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#e1e2ec]">
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
              className="px-4 py-2 rounded-xl bg-[#c81a42] hover:bg-[#a61536] text-xs font-bold text-[#ffdedf] transition-all flex items-center gap-1.5 shadow-md"
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
            className="px-3.5 py-2 rounded-xl bg-[#272a32] hover:bg-red-950/40 text-xs font-semibold text-[#ccc3d8] hover:text-red-400 transition-colors border border-white/5 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Instant Digital Downloads Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#191b23]/80 border border-white/5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#e1e2ec] flex items-center gap-2">
              <Download className="w-5 h-5 text-[#4cd7f6]" />
              Tus Descargas &amp; Archivos Comprados
            </h2>
            <p className="text-xs text-[#958da1]">
              Acceso vitalicio 24/7 sin límite de descargas.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#03b5d3]/20 text-[#4cd7f6] text-xs font-bold">
            {purchasedDownloads.length} {purchasedDownloads.length === 1 ? 'Producto' : 'Productos'}
          </span>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {purchasedDownloads.map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#272a32]/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10131a] flex items-center justify-center text-[#4cd7f6] shrink-0 border border-white/5">
                  {item.file?.isHtml ? <FileCode className="w-5 h-5 text-[#ffb2b7]" /> : <Download className="w-5 h-5 text-[#4cd7f6]" />}
                </div>
                <div>
                  <span className="text-[10px] text-[#958da1] block uppercase font-mono">
                    Registrado el {item.date}
                  </span>
                  <h3 className="font-display text-sm font-semibold text-[#e1e2ec]">
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
                    className="px-3 py-1.5 rounded-xl bg-[#7c3aed] hover:bg-[#732ee4] text-[#ede0ff] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir Carta 3D
                  </button>
                ) : item.file ? (
                  <div className="flex items-center gap-1.5">
                    {item.file.isHtml && (
                      <button
                        type="button"
                        onClick={() => {
                          const w = window.open();
                          if (w) {
                            w.document.write(atob(item.file!.dataUrl.split(',')[1] || ''));
                            w.document.close();
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#272a32] hover:bg-[#32353d] text-[#e1e2ec] text-xs font-semibold transition-colors border border-white/5"
                        title="Ver en navegador"
                      >
                        Abrir Web
                      </button>
                    )}
                    <a
                      href={item.file.dataUrl}
                      download={item.file.name}
                      onClick={() => sfx.playChime()}
                      className="px-3.5 py-1.5 rounded-xl bg-[#03b5d3] hover:bg-[#4cd7f6] text-[#001f26] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar {item.file.isHtml ? 'HTML' : 'Archivo'}
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      alert('Descargando archivo ZIP con recursos...');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#03b5d3] hover:bg-[#4cd7f6] text-[#001f26] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar ZIP
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders History */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#191b23]/80 border border-white/5 shadow-xl flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-[#e1e2ec] flex items-center gap-2">
          <Package className="w-5 h-5 text-[#d2bbff]" />
          Historial de Pedidos
        </h2>

        {orders.length === 0 ? (
          <p className="text-xs text-[#958da1] py-4 text-center">
            No tienes pedidos registrados todavía.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((ord) => {
              const hasPhysical = ord.items.some(
                it => it.product.productType === 'fisico' || it.product.category === 'fisicos' || it.product.category === 'porquesi'
              );
              const physicalProductsText = ord.items
                .filter(it => it.product.productType === 'fisico' || it.product.category === 'fisicos' || it.product.category === 'porquesi')
                .map(it => `${it.product.name} (x${it.quantity})`)
                .join(', ');

              const waMessage = `¡Hola Marcelo y Angely! Consulta sobre mi pedido #${ord.id} en Gift Corner Lab.\n📦 Productos: ${physicalProductsText || 'Pedido'}\n📍 Punto de recogida: ${ord.pickupLocation || 'Coordinación'}\n👤 Cliente: ${ord.customerName}\nTotal: $${ord.total.toFixed(2)}`;
              const waUrl = `https://wa.me/51921617882?text=${encodeURIComponent(waMessage)}`;

              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-[#272a32]/40 border border-white/5 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#d2bbff] font-semibold">{ord.id}</span>
                      {hasPhysical ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#03b5d3]/20 text-[#4cd7f6] flex items-center gap-1">
                          <Box className="w-3 h-3" /> Físico
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#7c3aed]/20 text-[#d2bbff] flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Virtual
                        </span>
                      )}
                    </div>
                    <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10">
                      {ord.status}
                    </span>
                  </div>

                  <div className="text-xs text-[#ccc3d8]">
                    {ord.items.map((it) => `${it.product.name} (x${it.quantity})`).join(', ')}
                  </div>

                  {/* Physical order extra info & WhatsApp CTA */}
                  {hasPhysical && (
                    <div className="p-3 rounded-xl bg-[#10131a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2 text-[#4cd7f6]">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>
                          <strong className="text-white">Punto de Recogida:</strong> {ord.pickupLocation || ord.shippingAddress || 'Plaza Central / Parque Principal'}
                        </span>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Coordinar por WhatsApp</span>
                      </a>
                    </div>
                  )}

                  <div className="text-xs text-[#958da1] flex items-center justify-between pt-1 border-t border-white/5">
                    <span>{ord.date}</span>
                    <span className="font-bold text-[#e1e2ec] font-display text-sm">
                      ${ord.total.toFixed(2)}
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
