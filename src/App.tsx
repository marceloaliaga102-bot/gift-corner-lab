import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product, ProductCategory, CartItem, Order, AppView, User } from './types';
import { PRODUCTS, INITIAL_CART_ITEMS } from './data/products';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartSidebar } from './components/CartSidebar';
import { CatalogView } from './components/views/CatalogView';
import { PorqueSiView } from './components/views/PorqueSiView';
import { AboutView } from './components/views/AboutView';
import { FaqView } from './components/views/FaqView';
import { PoliciesView } from './components/views/PoliciesView';
import { AdminView } from './components/views/AdminView';
import { AccountView } from './components/views/AccountView';
import { Preview3DModal } from './components/modals/Preview3DModal';
import { CheckoutModal } from './components/modals/CheckoutModal';
import { ProductDetailModal } from './components/modals/ProductDetailModal';
import { AuthModal } from './components/modals/AuthModal';
import { 
  getStoredProducts, 
  saveProducts, 
  getStoredOrders, 
  saveOrders, 
  getCurrentUser, 
  setCurrentUser as persistCurrentUser 
} from './utils/storage';
import { 
  subscribeToProducts, 
  cloudAddProduct, 
  cloudDeleteProduct, 
  cloudUpdateStock, 
  subscribeToOrders, 
  cloudSubmitOrder,
  cloudDeleteOrder,
  cloudClearAllOrders
} from './services/cloudDatabase';
import { isFirebaseConfigured } from './services/firebaseConfig';
import { sfx } from './utils/audio';
import { ShoppingBag, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('catalogo');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('populares');

  // Persistent User Session & Products
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getCurrentUser());
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = getStoredOrders();
    if (stored.length > 0) return stored;
    return [
      {
        id: 'GC-884102',
        date: '2026-09-18',
        customerName: 'Cliente',
        customerEmail: 'cliente@giftcornerlab.com',
        items: [
          { product: PRODUCTS[0], quantity: 1 },
          { product: PRODUCTS[3], quantity: 1 }
        ],
        subtotal: 79.80,
        shipping: 0.00,
        discount: 15.00,
        total: 64.80,
        status: 'Completado',
        paymentStatus: 'aprobado',
        shippingAddress: 'Av. Del Parque 450, Dpto 8B'
      }
    ];
  });

  // Modals state
  const [preview3DOpen, setPreview3DOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isCloudActive, setIsCloudActive] = useState<boolean>(() => isFirebaseConfigured());

  // Subscribe to live products from the Cloud (Firebase) or Local fallback
  useEffect(() => {
    const unsubscribe = subscribeToProducts((liveProducts) => {
      setProducts(liveProducts);
      setIsCloudActive(isFirebaseConfigured());
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to live orders from the Cloud
  useEffect(() => {
    const unsubscribe = subscribeToOrders((liveOrders) => {
      if (liveOrders && liveOrders.length > 0) {
        setOrders(liveOrders);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auth operations
  const handleLoginSuccess = (user: User) => {
    setCurrentUserState(user);
    persistCurrentUser(user);
    // If logged in as creator and was at admin, stay there; if at account, show account
    if (user.role === 'creator') {
      setCurrentView('admin-panel');
    }
  };

  const handleLogout = () => {
    setCurrentUserState(null);
    persistCurrentUser(null);
    if (currentView === 'admin-panel') {
      setCurrentView('catalogo');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    sfx.playClick();
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Product operations (Admin) - Synchronized across all devices
  const handleAddProduct = async (newProd: Product) => {
    setProducts(prev => {
      const exists = prev.findIndex(p => p.id === newProd.id);
      if (exists >= 0) {
        return prev.map(p => p.id === newProd.id ? newProd : p);
      }
      return [newProd, ...prev];
    });
    await cloudAddProduct(newProd);
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    await cloudDeleteProduct(productId);
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    setProducts(prev => prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
    await cloudUpdateStock(productId, newStock);
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderSuccess = async (newOrder: Order) => {
    // If a user is logged in, attach their profile email & name
    if (currentUser) {
      newOrder.customerName = currentUser.name;
      newOrder.customerEmail = currentUser.email;
    }
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    setCart([]);
    await cloudSubmitOrder(newOrder);
  };

  const handleOpenWhatsApp = () => {
    sfx.playClick();
    const msg = encodeURIComponent('¡Hola Marcelo y Angely! Quisiera hacer una consulta sobre los regalos de Gift Corner Lab.');
    window.open(`https://wa.me/51921617882?text=${msg}`, '_blank');
  };

  // Order management: delete, clear and update in state, storage, and cloud
  const handleDeleteOrder = async (orderId: string) => {
    const updatedOrders = orders.filter(o => o.id !== orderId);
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    await cloudDeleteOrder(orderId);
  };

  const handleClearAllOrders = async () => {
    setOrders([]);
    saveOrders([]);
    await cloudClearAllOrders();
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    const updated = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    setOrders(updated);
    saveOrders(updated);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-black/40 text-[#e1e2ec] font-body flex flex-col selection:bg-[#7c3aed] selection:text-white">
      {/* Top Header Navigation */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          sfx.playClick();
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        totalCartCount={totalCartCount}
        onToggleCart={() => setMobileCartOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentView !== 'catalogo') setCurrentView('catalogo');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {currentView === 'catalogo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 xl:col-span-8">
              <CatalogView
                products={products}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onAddToCart={handleAddToCart}
                onOpenPreview3D={() => setPreview3DOpen(true)}
                onSelectProduct={(p) => setDetailProduct(p)}
                onNavigate={setCurrentView}
              />
            </div>

            {/* Desktop Sticky Cart Sidebar */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-4">
              <CartSidebar
                items={cart}
                onUpdateQty={handleUpdateCartQty}
                onClearCart={handleClearCart}
                onProceedCheckout={() => setCheckoutOpen(true)}
                onExploreCatalog={() => setCurrentView('catalogo')}
              />
            </div>
          </div>
        )}

        {currentView === 'porque-si' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 xl:col-span-8">
              <PorqueSiView
                products={products}
                onAddToCart={handleAddToCart}
                onSelectProduct={(p) => setDetailProduct(p)}
              />
            </div>
            <div className="hidden lg:block lg:col-span-4 xl:col-span-4">
              <CartSidebar
                items={cart}
                onUpdateQty={handleUpdateCartQty}
                onClearCart={handleClearCart}
                onProceedCheckout={() => setCheckoutOpen(true)}
                onExploreCatalog={() => setCurrentView('catalogo')}
              />
            </div>
          </div>
        )}

        {currentView === 'nosotros' && (
          <AboutView onNavigate={setCurrentView} />
        )}

        {currentView === 'preguntas-faq' && (
          <FaqView />
        )}

        {currentView === 'politicas' && (
          <PoliciesView />
        )}

        {currentView === 'admin-panel' && (
          <AdminView
            products={products}
            orders={orders}
            onUpdateStock={handleUpdateStock}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            isCreator={currentUser?.role === 'creator'}
            onRequestLoginCreator={() => handleOpenAuth('login')}
            onLogoutCreator={handleLogout}
            isCloudActive={isCloudActive}
            onDeleteOrder={handleDeleteOrder}
            onClearAllOrders={handleClearAllOrders}
            onUpdateOrder={handleUpdateOrder}
          />
        )}

        {currentView === 'mi-cuenta' && (
          <AccountView
            orders={orders}
            currentUser={currentUser}
            onNavigate={setCurrentView}
            onOpenPreview3D={() => setPreview3DOpen(true)}
            onOpenAuthModal={handleOpenAuth}
            onLogout={handleLogout}
            onDeleteOrder={handleDeleteOrder}
          />
        )}
      </main>

      {/* Floating Mobile Cart Trigger Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => {
            sfx.playClick();
            setMobileCartOpen(true);
          }}
          className="relative px-5 py-3.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#03b5d3] text-white font-display text-sm font-bold shadow-2xl flex items-center gap-2 border border-white/20 active:scale-95 transition-transform"
          id="floating-mobile-cart-btn"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Ver Carrito</span>
          {totalCartCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#ffb2b7] text-[#67001b] text-xs flex items-center justify-center font-black">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Cart Drawer Overlay (Mounted via Portal to avoid any container clipping) */}
      {mobileCartOpen && createPortal(
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md h-full bg-[#10131a] p-4 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setMobileCartOpen(false)}
                  className="p-2 rounded-xl bg-[#272a32] text-[#e1e2ec]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CartSidebar
                items={cart}
                onUpdateQty={handleUpdateCartQty}
                onClearCart={handleClearCart}
                onProceedCheckout={() => {
                  setMobileCartOpen(false);
                  setCheckoutOpen(true);
                }}
                onExploreCatalog={() => {
                  setMobileCartOpen(false);
                  setCurrentView('catalogo');
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          sfx.playClick();
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onFilterCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentView('catalogo');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      {/* Modals mounted directly onto document.body ONLY when open to prevent any background effect/scroll blocking */}
      {preview3DOpen && createPortal(
        <Preview3DModal
          isOpen={preview3DOpen}
          onClose={() => setPreview3DOpen(false)}
          onAddToCart={() => {
            const cuponera = products.find((p) => p.id === 'cuponera-amor-carta-3d');
            if (cuponera) handleAddToCart(cuponera);
          }}
        />,
        document.body
      )}

      {checkoutOpen && createPortal(
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          items={cart}
          onOrderSuccess={handleOrderSuccess}
        />,
        document.body
      )}

      {detailProduct && createPortal(
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenPreview3D={() => setPreview3DOpen(true)}
        />,
        document.body
      )}

      {authModalOpen && createPortal(
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialMode={authModalMode}
        />,
        document.body
      )}
    </div>
  );
}
