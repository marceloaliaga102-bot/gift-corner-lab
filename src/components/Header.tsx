import React, { useState } from 'react';
import { AppView, ProductCategory, User } from '../types';
import { LOGO_URL } from '../data/products';
import { Search, ShoppingBag, User as UserIcon, Menu, X, ShieldCheck, Lock, LogOut, ChevronDown } from 'lucide-react';
import { sfx } from '../utils/audio';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCartCount: number;
  onToggleCart: () => void;
  currentUser: User | null;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalCartCount,
  onToggleCart,
  currentUser,
  onOpenAuthModal,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isCreator = currentUser?.role === 'creator';

  const navItems: { label: string; view: AppView; isSpecial?: boolean; badge?: string }[] = [
    { label: 'Catálogo', view: 'catalogo' },
    { label: "Sección 'PORQUE SÍ'", view: 'porque-si', isSpecial: true },
    { label: 'Nosotros', view: 'nosotros' },
    { label: 'Preguntas (FAQ)', view: 'preguntas-faq' },
    { label: 'Políticas', view: 'politicas' },
    ...(isCreator ? [{ label: 'Panel Admin', view: 'admin-panel' as AppView, badge: 'admin' }] : [])
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0b0e15]/85 backdrop-blur-2xl border-b border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('catalogo')}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
          id="brand-logo"
        >
          <img
            src={LOGO_URL}
            alt="Gift Corner Lab Logo"
            className="h-11 w-11 object-contain rounded-full shadow-[0_0_16px_rgba(124,58,237,0.4)] border border-[#7c3aed]/40 transition-transform group-hover:scale-110"
          />
          <div className="flex flex-col">
            <span className="font-display font-semibold text-lg lg:text-xl text-[#e1e2ec] tracking-tight leading-none">
              Gift Corner Lab
            </span>
            <span className="text-[11px] text-[#ccc3d8] font-medium tracking-wide mt-0.5">
              Boutique física &amp; digital
            </span>
          </div>
        </div>

        {/* Search Bar + Quick Category Switcher (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 bg-[#272a32]/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] max-w-md w-full">
          <Search className="text-[#958da1] w-[18px] h-[18px] shrink-0" />
          <input
            type="text"
            placeholder="Buscar regalos y caprichos..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentView !== 'catalogo' && currentView !== 'porque-si') {
                onNavigate('catalogo');
              }
            }}
            className="bg-transparent text-sm text-[#e1e2ec] placeholder:text-[#958da1] focus:outline-none w-full"
            id="header-search-input"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('todos');
                onNavigate('catalogo');
              }}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                selectedCategory === 'todos' && currentView === 'catalogo'
                  ? 'bg-[#7c3aed] text-[#ede0ff]'
                  : 'bg-[#32353d] text-[#e1e2ec] hover:bg-[#7c3aed]/50'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('fisicos');
                onNavigate('catalogo');
              }}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                selectedCategory === 'fisicos' && currentView === 'catalogo'
                  ? 'bg-[#03b5d3] text-[#001f26]'
                  : 'text-[#ccc3d8] hover:bg-[#32353d] hover:text-[#e1e2ec]'
              }`}
            >
              Físicos
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('virtuales');
                onNavigate('catalogo');
              }}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                selectedCategory === 'virtuales' && currentView === 'catalogo'
                  ? 'bg-[#7c3aed] text-white'
                  : 'text-[#ccc3d8] hover:bg-[#7c3aed]/30 hover:text-[#e1e2ec]'
              }`}
            >
              Virtuales
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('porquesi');
                onNavigate('porque-si');
              }}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                currentView === 'porque-si' || selectedCategory === 'porquesi'
                  ? 'bg-[#c81a42] text-[#ffdedf]'
                  : 'text-[#ffb2b7] hover:bg-[#c81a42]/40'
              }`}
            >
              ¡PORQUE SÍ!
            </button>
          </div>
        </div>

        {/* Navigation links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5" id="main-desktop-nav">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            if (item.badge === 'admin') {
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => onNavigate(item.view)}
                  className={`ml-1 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] ${
                    isActive
                      ? isCreator
                        ? 'bg-[#c81a42] text-white'
                        : 'bg-[#7c3aed] text-white'
                      : isCreator
                      ? 'bg-[#c81a42]/30 text-[#ffdedf] hover:bg-[#c81a42]/50 border border-[#ffb2b7]/20'
                      : 'bg-[#32353d]/80 text-[#ccc3d8] hover:bg-[#7c3aed]/50'
                  }`}
                  id={`nav-${item.view}`}
                >
                  {isCreator ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ffb2b7]" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#958da1]" />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? item.isSpecial
                      ? 'bg-[#c81a42] text-[#ffdedf] font-bold shadow-sm'
                      : 'bg-[#7c3aed] text-[#ede0ff] font-bold shadow-sm'
                    : item.isSpecial
                    ? 'text-[#ffb2b7] hover:bg-[#c81a42]/20 hover:text-white font-semibold'
                    : 'text-[#ccc3d8] hover:bg-[#1d1f27] hover:text-[#e1e2ec]'
                }`}
                id={`nav-${item.view}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons (Account + Cart) */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* User Account / Auth Button */}
          <div className="relative">
            {currentUser ? (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all backdrop-blur-md shadow-md border ${
                    isCreator
                      ? 'bg-[#c81a42]/20 border-[#ffb2b7]/30 text-[#ffdedf]'
                      : 'bg-[#272a32]/70 border-white/5 text-[#e1e2ec]'
                  }`}
                  id="user-session-btn"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    isCreator ? 'bg-[#ffb2b7] text-[#67001b]' : 'bg-[#d2bbff] text-[#3f008e]'
                  }`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="font-display text-xs font-bold leading-none truncate max-w-28">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-[#958da1] leading-none mt-0.5">
                      {isCreator ? 'Creador' : 'Cliente'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#958da1]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-11 w-48 rounded-2xl bg-[#191b23] border border-white/10 shadow-2xl p-2 z-50 flex flex-col gap-1 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('mi-cuenta');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#e1e2ec] hover:bg-[#272a32] flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-[#4cd7f6]" />
                      <span>Mi Cuenta &amp; Descargas</span>
                    </button>

                    {isCreator && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin-panel');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#ffdedf] hover:bg-[#c81a42]/20 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#ffb2b7]" />
                        <span>Panel Administrador</span>
                      </button>
                    )}

                    <div className="border-t border-white/5 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        sfx.playClick();
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-[#272a32]/70 hover:bg-[#32353d] text-[#ccc3d8] hover:text-[#e1e2ec] border border-white/5 shadow-md"
                id="header-login-btn"
              >
                <div className="w-7 h-7 rounded-full bg-[#32353d] flex items-center justify-center shrink-0">
                  <UserIcon className="text-[#d2bbff] w-4 h-4" />
                </div>
                <span className="hidden sm:inline font-display text-xs font-semibold">
                  Ingresar / Registro
                </span>
              </button>
            )}
          </div>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onToggleCart}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#732ee4] text-[#ede0ff] hover:opacity-95 transition-all shadow-[0_8px_24px_-4px_rgba(124,58,237,0.5),inset_0_1px_0_rgba(255,255,255,0.35)]"
            id="cart-header-btn"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline font-display text-xs font-bold">Carrito</span>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold font-display bg-[#3f008e] text-[#d2bbff] rounded-full shadow-inner">
              {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
            </span>
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#272a32] text-[#e1e2ec]"
            id="mobile-hamburger-btn"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#10131a] border-b border-white/10 p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => {
                onNavigate(item.view);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                currentView === item.view ? 'bg-[#7c3aed] text-white' : 'text-[#ccc3d8] hover:bg-[#191b23]'
              }`}
            >
              <span>{item.label}</span>
              {item.badge === 'admin' && (
                <ShieldCheck className="w-4 h-4 text-[#4cd7f6]" />
              )}
            </button>
          ))}

          <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-950/20 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión ({currentUser.name})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onOpenAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-2.5 rounded-xl text-xs font-bold bg-[#7c3aed] text-white"
              >
                Iniciar Sesión / Crear Cuenta
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
