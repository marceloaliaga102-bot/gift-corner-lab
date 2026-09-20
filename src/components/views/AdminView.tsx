import React, { useState, useEffect } from 'react';
import { Product, Order, ProductDownloadFile, PaymentConfig } from '../../types';
import { 
  ShieldCheck, Package, DollarSign, Users, AlertCircle, Plus, Edit, Check, 
  Trash2, Video, FileCode, Upload, Image as ImageIcon, Eye, X, Lock, Sparkles, Download,
  MapPin, Zap, Box, QrCode, CreditCard, Database, RefreshCw, Save, HardDrive, CheckCircle2
} from 'lucide-react';
import { sfx } from '../../utils/audio';
import { 
  getPaymentConfig, 
  savePaymentConfig, 
  calculateDatabaseStorageUsage, 
  exportDatabaseBackup, 
  importDatabaseBackup,
  saveMediaFileToDB
} from '../../utils/database';

interface AdminViewProps {
  products: Product[];
  orders: Order[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  isCreator: boolean;
  onRequestLoginCreator: () => void;
  onLogoutCreator: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  orders,
  onUpdateStock,
  onAddProduct,
  onDeleteProduct,
  isCreator,
  onRequestLoginCreator,
  onLogoutCreator
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'payment_config' | 'database'>('products');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);

  // New Product Form State
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productModality, setProductModality] = useState<'virtual' | 'fisico'>('virtual');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'fisicos' | 'virtuales' | 'porquesi'>('virtuales');
  const [price, setPrice] = useState<string>('9.99');
  const [originalPrice, setOriginalPrice] = useState<string>('14.99');
  const [discountBadge, setDiscountBadge] = useState('-33% OFF');
  const [badgeLabel, setBadgeLabel] = useState('⚡ PRODUCTO VIRTUAL');
  const [secondaryBadge, setSecondaryBadge] = useState('Descarga Inmediata');
  const [description, setDescription] = useState('');
  const [fullDetails, setFullDetails] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('Descarga inmediata al pagar');
  const [stock, setStock] = useState<string>('20');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadFile, setDownloadFile] = useState<ProductDownloadFile | null>(null);
  const [pickupLocations, setPickupLocations] = useState<string[]>([
    'Plaza Central / Parque Principal',
    'Estación Central / Tren',
    'Taller Gift Corner Lab'
  ]);
  const [pickupInput, setPickupInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Garantía oficial Gift Corner Lab',
    'Atención personalizada'
  ]);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Payment Config State
  const [paymentConfig, setPaymentConfigState] = useState<PaymentConfig>(() => getPaymentConfig());
  const [configSaveSuccess, setConfigSaveSuccess] = useState('');

  // Storage Meter State
  const [dbStats, setDbStats] = useState<{ mbUsed: number; totalMediaCount: number }>({ mbUsed: 0, totalMediaCount: 0 });

  useEffect(() => {
    calculateDatabaseStorageUsage().then(stats => setDbStats(stats));
  }, [products, downloadFile]);

  // Handle Modality Switch
  const handleModalityChange = (type: 'virtual' | 'fisico') => {
    setProductModality(type);
    if (type === 'virtual') {
      setCategory('virtuales');
      setBadgeLabel('⚡ PRODUCTO VIRTUAL');
      setDeliveryInfo('Descarga inmediata al pagar');
      setSecondaryBadge('Descarga Inmediata');
    } else {
      setCategory('fisicos');
      setBadgeLabel('📦 PRODUCTO FÍSICO');
      setDeliveryInfo('Recogida coordinada por WhatsApp');
      setSecondaryBadge('Entrega en punto de encuentro');
    }
  };

  // Add & Remove pickup locations
  const handleAddPickupLocation = (customLoc?: string) => {
    const locToAdd = (customLoc || pickupInput).trim();
    if (locToAdd && !pickupLocations.includes(locToAdd)) {
      setPickupLocations([...pickupLocations, locToAdd]);
      setPickupInput('');
    }
  };

  const handleRemovePickupLocation = (index: number) => {
    setPickupLocations(pickupLocations.filter((_, i) => i !== index));
  };

  // Image Upload handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImageUrl(dataUrl);
        sfx.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  // Downloadable File Upload handler
  const handleDownloadFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const isHtmlFile = file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm') || file.type.includes('html');
        
        const newDownloadFile: ProductDownloadFile = {
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl: dataUrl,
          isHtml: isHtmlFile
        };

        setDownloadFile(newDownloadFile);
        sfx.playChime();
        
        // Also persist file in IndexedDB for heavy datasets
        await saveMediaFileToDB(`file-${Date.now()}`, newDownloadFile);
        const stats = await calculateDatabaseStorageUsage();
        setDbStats(stats);
      };
      reader.readAsDataURL(file);
    }
  };

  // QR Code Image Upload handler for Yape
  const handleYapeQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPaymentConfigState(prev => ({ ...prev, yapeQrUrl: dataUrl }));
        sfx.playChime();
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Payment Configuration
  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    savePaymentConfig(paymentConfig);
    sfx.playChime();
    setConfigSaveSuccess('¡Configuración de Yape y pasarelas de pago guardada con éxito!');
    setTimeout(() => setConfigSaveSuccess(''), 3000);
  };

  // Export DB backup
  const handleExportDB = async () => {
    const jsonStr = await exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gift-corner-lab-db-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sfx.playChime();
  };

  // Import DB backup
  const handleImportDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const success = await importDatabaseBackup(content);
        if (success) {
          sfx.playChime();
          alert('¡Base de datos restaurada correctamente! Se recargará la página.');
          window.location.reload();
        } else {
          alert('Error al importar la base de datos. Verifica el formato del archivo JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Add Feature to form
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Submit New Product
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim()) {
      setFormError('Por favor ingresa un nombre para el producto.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Por favor ingresa un precio válido.');
      return;
    }

    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80';
    const isVirtual = productModality === 'virtual';

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category: isVirtual ? 'virtuales' : 'fisicos',
      productType: productModality,
      price: numPrice,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      discountBadge: discountBadge.trim() || undefined,
      badgeLabel: badgeLabel.trim() || (isVirtual ? '⚡ PRODUCTO VIRTUAL' : '📦 PRODUCTO FÍSICO'),
      badgeType: isVirtual ? 'virtual' : 'fisico',
      secondaryBadge: secondaryBadge.trim() || (isVirtual ? 'Descarga Inmediata' : 'Recogida en punto'),
      imageUrl: finalImage,
      thumbnailUrl: finalImage,
      altText: name.trim(),
      description: description.trim() || (isVirtual ? 'Producto digital descargable al instante.' : 'Producto artesanal con entrega y punto de recogida coordinado.'),
      fullDetails: fullDetails.trim() || description.trim() || 'Elaborado con dedicación en Gift Corner Lab por Marcelo & Angely.',
      deliveryInfo: deliveryInfo.trim() || (isVirtual ? 'Descarga inmediata al pagar' : 'Puntos de recogida por WhatsApp'),
      stock: isVirtual ? undefined : (parseInt(stock) || 15),
      videoUrl: videoUrl.trim() || undefined,
      downloadFile: isVirtual ? (downloadFile || undefined) : undefined,
      pickupLocations: !isVirtual && pickupLocations.length > 0 ? pickupLocations : undefined,
      features: features.length > 0 ? features : ['Garantía de satisfacción Gift Corner Lab']
    };

    onAddProduct(newProd);
    sfx.playChime();
    setFormSuccess('¡Producto creado con éxito y publicado en el catálogo!');

    // Reset Form
    setName('');
    setDescription('');
    setFullDetails('');
    setImageUrl('');
    setVideoUrl('');
    setDownloadFile(null);
    setFeatures(['Garantía oficial Gift Corner Lab', 'Atención personalizada']);

    setTimeout(() => {
      setIsCreatingProduct(false);
      setFormSuccess('');
    }, 1500);
  };

  const handleStartEdit = (p: Product) => {
    setEditingStockId(p.id);
    setTempStock(p.stock || 0);
  };

  const handleSaveStock = (productId: string) => {
    onUpdateStock(productId, tempStock);
    setEditingStockId(null);
    sfx.playClick();
  };

  // If NOT authenticated as creator, show discreet access gate
  if (!isCreator) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#272a32] flex items-center justify-center text-[#958da1] mb-5 border border-white/5">
          <Lock className="w-8 h-8 text-[#d2bbff]" />
        </div>

        <h1 className="font-display text-2xl font-bold text-[#e1e2ec] mb-2">
          Acceso Privado
        </h1>

        <p className="text-xs text-[#ccc3d8] leading-relaxed mb-6">
          Esta sección requiere permisos administrativos. Inicia sesión con tu cuenta autorizada para acceder a las herramientas de gestión.
        </p>

        <button
          type="button"
          onClick={() => {
            sfx.playClick();
            onRequestLoginCreator();
          }}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#03b5d3] text-white font-display text-xs font-bold shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
          id="admin-gate-login-btn"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Iniciar Sesión</span>
        </button>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="w-full flex flex-col gap-8 py-4">
      {/* Header with Creator Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#191b23]/80 border border-white/5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c81a42]/30 text-[#ffdedf] text-xs font-bold mb-2 border border-[#ffb2b7]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ffb2b7]" /> Sesión Maestra: Marcelo Aliaga (Creador)
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#e1e2ec]">
            Panel de Control de la Boutique
          </h1>
          <p className="text-xs text-[#ccc3d8]">
            Administra productos, configura Yape y pasarelas de pago, y gestiona la base de datos local.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setIsCreatingProduct(!isCreatingProduct);
              setActiveTab('products');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#03b5d3] hover:opacity-95 text-white font-display text-xs font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            id="admin-create-product-btn"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreatingProduct ? 'Cerrar Formulario' : 'Crear Producto'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onLogoutCreator();
            }}
            className="px-3.5 py-2 rounded-xl bg-[#272a32] hover:bg-[#32353d] text-xs font-semibold text-[#ccc3d8] hover:text-white transition-colors"
          >
            Salir Modo Creador
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Productos, Config de Pagos & Yape, Base de Datos) */}
      <div className="flex items-center gap-2 p-1.5 bg-[#191b23] rounded-2xl border border-white/10 overflow-x-auto">
        <button
          type="button"
          onClick={() => { setActiveTab('products'); sfx.playClick(); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'products'
              ? 'bg-[#7c3aed] text-white shadow-md'
              : 'text-[#958da1] hover:text-white hover:bg-[#272a32]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Gestión de Productos ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('payment_config'); sfx.playClick(); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'payment_config'
              ? 'bg-[#03b5d3] text-[#001f26] shadow-md'
              : 'text-[#958da1] hover:text-white hover:bg-[#272a32]'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Ajustes de Yape &amp; Pasarelas Reales</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('database'); sfx.playClick(); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'database'
              ? 'bg-[#c81a42] text-white shadow-md'
              : 'text-[#958da1] hover:text-white hover:bg-[#272a32]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Base de Datos &amp; Almacenamiento ({dbStats.mbUsed} MB)</span>
        </button>
      </div>

      {/* ================= TAB 1: PRODUCT MANAGEMENT & CREATOR ================= */}
      {activeTab === 'products' && (
        <>
          {/* CREATE NEW PRODUCT FORM */}
          {isCreatingProduct && (
            <section className="rounded-3xl bg-[#191b23] border border-[#7c3aed]/40 p-6 sm:p-8 shadow-2xl animate-fadeIn relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] text-[11px] font-bold uppercase mb-1">
                    <Sparkles className="w-3 h-3" /> Catálogo en Vivo
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#e1e2ec]">
                    Publicar un Nuevo Producto en la Tienda
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingProduct(false)}
                  className="p-2 rounded-xl bg-[#272a32] text-[#e1e2ec] hover:bg-[#32353d]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitProduct} className="flex flex-col gap-6">
                {/* PRODUCT MODALITY SELECTOR (Virtual vs Físico) */}
                <div className="p-4 rounded-2xl bg-[#10131a] border border-white/10 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[#e1e2ec] font-bold">
                      Etiqueta &amp; Tipo de Producto: *
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleModalityChange('virtual')}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        productModality === 'virtual'
                          ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white shadow-lg'
                          : 'bg-[#191b23] border-white/10 text-[#958da1] hover:border-white/20'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${productModality === 'virtual' ? 'bg-[#7c3aed] text-white' : 'bg-[#272a32] text-[#958da1]'}`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1">
                          ⚡ Producto Virtual
                        </p>
                        <p className="text-[11px] text-[#ccc3d8] leading-tight mt-0.5">
                          Archivos descargables (.html, .zip). Descarga inmediata al verificar el pago. Sin dirección física.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModalityChange('fisico')}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        productModality === 'fisico'
                          ? 'bg-[#03b5d3]/20 border-[#03b5d3] text-white shadow-lg'
                          : 'bg-[#191b23] border-white/10 text-[#958da1] hover:border-white/20'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${productModality === 'fisico' ? 'bg-[#03b5d3] text-[#001f26]' : 'bg-[#272a32] text-[#958da1]'}`}>
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1">
                          📦 Producto Físico
                        </p>
                        <p className="text-[11px] text-[#ccc3d8] leading-tight mt-0.5">
                          No sube archivos HTML. Tras verificar el pago, se coordina por WhatsApp para acordar la entrega en puntos de referencia.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1: Basic Information */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs text-[#958da1] font-semibold block mb-1">
                        Nombre del Producto: *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={productModality === 'virtual' ? 'Ej. Carta Digital 3D & Cuponera Interactiva' : 'Ej. Lámpara Acrílica Grabada en Madera'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#10131a] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#958da1] font-semibold block mb-1">
                          Categoría en Tienda:
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as any)}
                          className="w-full bg-[#10131a] text-xs text-white px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none cursor-pointer"
                        >
                          {productModality === 'virtual' ? (
                            <option value="virtuales">⚡ Virtuales (Descargas)</option>
                          ) : (
                            <>
                              <option value="fisicos">📦 Físicos (Recogida / Taller)</option>
                              <option value="porquesi">🦄 PORQUE SÍ (Colección)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-[#958da1] font-semibold block mb-1">
                          Precio Oferta ($): *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="9.99"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full bg-[#10131a] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#7c3aed]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#958da1] font-semibold block mb-1">
                          Precio Normal (Opcional $):
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="14.99"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          className="w-full bg-[#10131a] text-xs text-white px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#958da1] font-semibold block mb-1">
                          Etiqueta de Descuento:
                        </label>
                        <input
                          type="text"
                          placeholder="-33% OFF"
                          value={discountBadge}
                          onChange={(e) => setDiscountBadge(e.target.value)}
                          className="w-full bg-[#10131a] text-xs text-white px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Physical Stock Field */}
                    {productModality === 'fisico' && (
                      <div>
                        <label className="text-xs text-[#958da1] font-semibold block mb-1">
                          Unidades en Stock Disponible:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          className="w-full bg-[#10131a] text-xs text-white px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-[#958da1] font-semibold block mb-1">
                        Descripción Corta (Tarjeta):
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Resumen atractivo que se muestra en el catálogo..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#10131a] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>
                  </div>

                  {/* Column 2: Media, Digital File & Video OR Pickup Locations */}
                  <div className="flex flex-col gap-4">
                    {/* Image Upload / URL */}
                    <div className="p-4 rounded-2xl bg-[#10131a] border border-white/10 flex flex-col gap-2">
                      <label className="text-xs text-[#958da1] font-semibold block">
                        Imagen Principal del Producto:
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 px-3 py-2 bg-[#191b23] hover:bg-[#272a32] text-xs text-[#e1e2ec] font-semibold rounded-xl border border-white/10 cursor-pointer flex items-center justify-center gap-2 transition-colors">
                          <Upload className="w-4 h-4 text-[#4cd7f6]" /> Subir Imagen
                          <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                        </label>
                        <span className="text-[10px] text-[#958da1]">o pega URL:</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full bg-[#191b23] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none"
                      />
                    </div>

                    {/* Video URL */}
                    <div>
                      <label className="text-xs text-[#958da1] font-semibold block mb-1">
                        URL de Video (YouTube / MP4 / Vimeo):
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-[#10131a] text-xs text-white px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none"
                      />
                    </div>

                    {/* VIRTUAL: Subir Archivo HTML o Descargable */}
                    {productModality === 'virtual' && (
                      <div className="p-4 rounded-2xl bg-[#10131a] border border-[#7c3aed]/40 flex flex-col gap-2.5 shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#d2bbff] flex items-center gap-1.5">
                            <FileCode className="w-4 h-4 text-[#d2bbff]" /> Archivo Descargable (HTML, ZIP, PDF...)
                          </span>
                        </div>

                        <label className="w-full p-4 border-2 border-dashed border-white/20 hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-[#191b23] transition-colors">
                          <Upload className="w-6 h-6 text-[#d2bbff]" />
                          <span className="text-xs font-semibold text-[#e1e2ec]">
                            {downloadFile ? 'Cambiar archivo seleccionado' : 'Haz clic para seleccionar archivo HTML o ZIP'}
                          </span>
                          <input type="file" accept=".html,.htm,.zip,.pdf,.json,text/html" onChange={handleDownloadFileUpload} className="hidden" />
                        </label>

                        {downloadFile && (
                          <div className="p-3 rounded-xl bg-[#272a32] border border-emerald-500/30 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-400" />
                              <div>
                                <p className="font-semibold text-white font-mono">{downloadFile.name}</p>
                                <span className="text-[10px] text-[#958da1]">{(downloadFile.size / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-800/40">{formError}</p>
                )}

                {formSuccess && (
                  <p className="text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40 flex items-center gap-2">
                    <Check className="w-4 h-4" /> {formSuccess}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#03b5d3] text-white font-display text-xs font-bold shadow-xl hover:opacity-95 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Publicar Producto en Catálogo</span>
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* PRODUCTS TABLE */}
          <div className="p-6 rounded-3xl bg-[#191b23]/80 border border-white/5 shadow-xl flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-[#e1e2ec]">Gestión de Productos en Catálogo</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#ccc3d8]">
                <thead className="text-[11px] text-[#958da1] uppercase border-b border-white/10">
                  <tr>
                    <th className="py-3 px-2">Producto</th>
                    <th className="py-3 px-2">Tipo</th>
                    <th className="py-3 px-2">Precio</th>
                    <th className="py-3 px-2">Stock</th>
                    <th className="py-3 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 flex items-center gap-3 font-semibold text-white">
                        <img src={p.thumbnailUrl || p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                        <span>{p.name}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.category === 'virtuales' ? 'bg-[#7c3aed]/20 text-[#d2bbff]' : 'bg-[#03b5d3]/20 text-[#4cd7f6]'}`}>
                          {p.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-white">${p.price.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        {p.stock !== undefined ? (
                          editingStockId === p.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={tempStock}
                                onChange={(e) => setTempStock(parseInt(e.target.value) || 0)}
                                className="w-16 bg-[#10131a] text-white text-xs px-2 py-1 rounded border border-[#7c3aed]"
                              />
                              <button onClick={() => handleSaveStock(p.id)} className="p-1 text-emerald-400"><Check className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <span onClick={() => handleStartEdit(p)} className="cursor-pointer hover:underline text-amber-300">
                              {p.stock} uds (editar)
                            </span>
                          )
                        ) : (
                          <span className="text-[#958da1]">Digital</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= TAB 2: YAPE & PAYMENT CONFIGURATION ================= */}
      {activeTab === 'payment_config' && (
        <section className="p-6 sm:p-8 rounded-3xl bg-[#191b23] border border-[#03b5d3]/40 shadow-2xl flex flex-col gap-6 animate-fadeIn">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#03b5d3]/20 text-[#4cd7f6] text-xs font-bold uppercase mb-2">
              <QrCode className="w-4 h-4 text-[#4cd7f6]" /> Configuración de Pagos Generales
            </div>
            <h2 className="font-display text-2xl font-bold text-[#e1e2ec]">
              Configuración de Yape &amp; Pasarelas Reales
            </h2>
            <p className="text-xs text-[#ccc3d8]">
              Aquí puedes definir el número de Yape, titular y QR que verán todos los clientes al comprar, además de tus claves de pasarelas de pago reales.
            </p>
          </div>

          <form onSubmit={handleSavePaymentConfig} className="flex flex-col gap-6">
            {/* YAPE CONFIGURATION CARD */}
            <div className="p-5 rounded-2xl bg-[#10131a] border border-[#7c3aed]/40 flex flex-col gap-4">
              <h3 className="font-display text-sm font-bold text-[#d2bbff] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#d2bbff]" /> Datos Oficiales de Yape (Perú)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#958da1] font-semibold block mb-1">
                    Número de Yape General: *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentConfig.yapePhone}
                    onChange={(e) => setPaymentConfigState({ ...paymentConfig, yapePhone: e.target.value })}
                    className="w-full bg-[#191b23] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#7c3aed]"
                  />
                  <span className="text-[10px] text-[#958da1] mt-1 block">Ejemplo: +51 921 617 882</span>
                </div>

                <div>
                  <label className="text-xs text-[#958da1] font-semibold block mb-1">
                    Nombre del Titular de Yape: *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentConfig.yapeName}
                    onChange={(e) => setPaymentConfigState({ ...paymentConfig, yapeName: e.target.value })}
                    className="w-full bg-[#191b23] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#7c3aed]"
                  />
                  <span className="text-[10px] text-[#958da1] mt-1 block">Ejemplo: Marcelo Aliaga</span>
                </div>
              </div>

              {/* Yape QR Code Upload */}
              <div>
                <label className="text-xs text-[#958da1] font-semibold block mb-1">
                  Código QR de Yape (Subir Imagen o Pegar URL):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="px-4 py-2 bg-[#191b23] hover:bg-[#272a32] text-xs text-[#e1e2ec] font-semibold rounded-xl border border-white/10 cursor-pointer flex items-center gap-2 transition-colors shrink-0">
                    <Upload className="w-4 h-4 text-[#4cd7f6]" /> Subir Imagen QR
                    <input type="file" accept="image/*" onChange={handleYapeQrUpload} className="hidden" />
                  </label>

                  <input
                    type="text"
                    placeholder="Pega URL directa de la imagen QR..."
                    value={paymentConfig.yapeQrUrl}
                    onChange={(e) => setPaymentConfigState({ ...paymentConfig, yapeQrUrl: e.target.value })}
                    className="w-full bg-[#191b23] text-xs text-white px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* REAL PAYMENT GATEWAYS CONFIGURATION */}
            <div className="p-5 rounded-2xl bg-[#10131a] border border-[#03b5d3]/40 flex flex-col gap-4">
              <h3 className="font-display text-sm font-bold text-[#4cd7f6] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#4cd7f6]" /> Claves para Pasarelas Reales (Mercado Pago &amp; Tarjetas)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#958da1] font-semibold block mb-1">
                    Mercado Pago Public Key (Producción / Sandbox):
                  </label>
                  <input
                    type="text"
                    placeholder="APP_USR-..."
                    value={paymentConfig.mercadopagoPublicKey || ''}
                    onChange={(e) => setPaymentConfigState({ ...paymentConfig, mercadopagoPublicKey: e.target.value })}
                    className="w-full bg-[#191b23] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#958da1] font-semibold block mb-1">
                    Stripe / Card Public Key (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="pk_live_..."
                    value={paymentConfig.stripePublicKey || ''}
                    onChange={(e) => setPaymentConfigState({ ...paymentConfig, stripePublicKey: e.target.value })}
                    className="w-full bg-[#191b23] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {configSaveSuccess && (
              <p className="text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {configSaveSuccess}
              </p>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#03b5d3] to-[#7c3aed] text-white font-display text-xs font-bold shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración de Pagos</span>
            </button>
          </form>
        </section>
      )}

      {/* ================= TAB 3: DATABASE & STORAGE ================= */}
      {activeTab === 'database' && (
        <section className="p-6 sm:p-8 rounded-3xl bg-[#191b23] border border-white/10 shadow-2xl flex flex-col gap-6 animate-fadeIn">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c81a42]/20 text-[#ffb2b7] text-xs font-bold uppercase mb-2">
              <Database className="w-4 h-4 text-[#ffb2b7]" /> Base de Datos &amp; Almacenamiento Local
            </div>
            <h2 className="font-display text-2xl font-bold text-[#e1e2ec]">
              Administrador de Almacenamiento IndexedDB
            </h2>
            <p className="text-xs text-[#ccc3d8]">
              Los productos, fotos en alta resolución, videos y archivos descargables se guardan en la base de datos interna de tu navegador.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#10131a] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/20 text-[#d2bbff] flex items-center justify-center">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[#958da1]">Uso Actual de la BD:</p>
                <p className="font-display text-xl font-bold text-white">
                  {dbStats.mbUsed} MB <span className="text-xs text-[#ccc3d8] font-normal">({dbStats.totalMediaCount} archivos pesados guardados)</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportDB}
                className="px-4 py-2.5 rounded-xl bg-[#03b5d3] hover:bg-[#4cd7f6] text-[#001f26] font-display text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" /> Exportar Copia de Seguridad (.JSON)
              </button>

              <label className="px-4 py-2.5 rounded-xl bg-[#272a32] hover:bg-[#32353d] text-xs font-semibold text-white cursor-pointer flex items-center gap-2 border border-white/10 transition-colors">
                <Upload className="w-4 h-4 text-[#d2bbff]" /> Importar Respaldo
                <input type="file" accept=".json" onChange={handleImportDB} className="hidden" />
              </label>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
