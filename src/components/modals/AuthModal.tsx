import React, { useState } from 'react';
import { User } from '../../types';
import { getStoredUsers, saveUser, setCurrentUser, CREATOR_CREDENTIALS } from '../../utils/storage';
import { cloudSaveUser } from '../../services/cloudDatabase';
import { X, Lock, User as UserIcon, Mail, ArrowRight, Sparkles, Check } from 'lucide-react';
import { sfx } from '../../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'login') {
      const cleanInput = emailOrUser.trim().toLowerCase();
      // Check if creator credentials match silently
      const isEmailMatch = cleanInput === CREATOR_CREDENTIALS.email.toLowerCase();
      const isUserMatch = cleanInput === CREATOR_CREDENTIALS.username.toLowerCase();

      if ((isEmailMatch || isUserMatch) && password === CREATOR_CREDENTIALS.password) {
        const creatorUser: User = {
          id: 'user-creator-marcelo',
          name: CREATOR_CREDENTIALS.name,
          email: CREATOR_CREDENTIALS.email,
          role: 'creator',
          createdAt: '2025-01-01'
        };
        setCurrentUser(creatorUser);
        sfx.playChime();
        onLoginSuccess(creatorUser);
        onClose();
        return;
      }

      // Check registered customer accounts
      const users = getStoredUsers();
      const found = users.find(
        u => (u.email.toLowerCase() === cleanInput || u.name.toLowerCase() === cleanInput) && u.password === password
      );

      if (found) {
        setCurrentUser(found);
        sfx.playClick();
        onLoginSuccess(found);
        onClose();
      } else {
        setError('Correo o contraseña incorrectos. Si aún no tienes cuenta, crea una nueva.');
      }
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Por favor ingresa tu nombre completo.');
        return;
      }
      if (!emailOrUser.trim() || !emailOrUser.includes('@')) {
        setError('Por favor ingresa un correo electrónico válido.');
        return;
      }
      if (password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres.');
        return;
      }

      // Check if email already registered
      const users = getStoredUsers();
      const exists = users.some(u => u.email.toLowerCase() === emailOrUser.trim().toLowerCase());
      if (exists) {
        setError('Este correo electrónico ya está registrado. Inicia sesión.');
        return;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: emailOrUser.trim().toLowerCase(),
        password: password,
        role: 'customer',
        createdAt: new Date().toISOString().split('T')[0]
      };

      cloudSaveUser(newUser);
      setCurrentUser(newUser);
      sfx.playChime();
      setSuccessMsg('¡Cuenta creada con éxito! Tu sesión se mantendrá activa.');
      setTimeout(() => {
        onLoginSuccess(newUser);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-[#191b23] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden my-auto">
        
        {/* Glow Ambient Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[90px] pointer-events-none bg-[#7c3aed]/30" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#272a32] text-[#e1e2ec] hover:bg-[#32353d] transition-colors"
          id="close-auth-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Two Standard Tabs: Iniciar Sesión / Crear Cuenta */}
        <div className="flex items-center gap-1 p-1 bg-[#10131a] rounded-2xl border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-display font-semibold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-[#272a32] text-white shadow-sm'
                : 'text-[#958da1] hover:text-[#e1e2ec]'
            }`}
            id="auth-tab-login"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-display font-semibold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-[#272a32] text-white shadow-sm'
                : 'text-[#958da1] hover:text-[#e1e2ec]'
            }`}
            id="auth-tab-register"
          >
            Crear Cuenta
          </button>
        </div>

        {/* Header Content */}
        <div className="mb-6 text-center">
          {mode === 'register' ? (
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] text-xs font-bold uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Nueva Cuenta
              </div>
              <h2 className="font-display text-xl font-bold text-[#e1e2ec]">
                Únete a Gift Corner Lab
              </h2>
              <p className="text-xs text-[#ccc3d8] mt-1">
                Tu cuenta no se borrará. Podrás acceder a tus pedidos y descargas digitales siempre.
              </p>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#03b5d3]/20 text-[#4cd7f6] text-xs font-bold uppercase mb-2">
                <Lock className="w-3.5 h-3.5" /> Acceso de Usuario
              </div>
              <h2 className="font-display text-xl font-bold text-[#e1e2ec]">
                Bienvenido de Vuelta
              </h2>
              <p className="text-xs text-[#ccc3d8] mt-1">
                Ingresa con tu correo y contraseña para ver tus compras y enlaces.
              </p>
            </div>
          )}
        </div>

        {/* Unified Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div>
              <label className="text-[11px] text-[#958da1] font-medium block mb-1">
                Nombre Completo:
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1]" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Sofía Morales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#10131a] text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#7c3aed]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] text-[#958da1] font-medium block mb-1">
              Correo Electrónico o Usuario:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1]" />
              <input
                type="text"
                required
                placeholder="tu@correo.com"
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                className="w-full bg-[#10131a] text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#7c3aed]"
                id="auth-email-input"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#958da1] font-medium block mb-1">
              Contraseña:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#10131a] text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#7c3aed]"
                id="auth-password-input"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-800/40">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {successMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all mt-1 bg-gradient-to-r from-[#7c3aed] to-[#03b5d3] text-white hover:opacity-95"
            id="auth-submit-btn"
          >
            <span>
              {mode === 'register'
                ? 'Crear Cuenta y Guardar Sesión'
                : 'Iniciar Sesión'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Clean Footer Note */}
        <p className="text-[11px] text-[#958da1] text-center mt-5">
          Tus datos y compras se guardan de forma segura y permanente en este dispositivo.
        </p>

      </div>
    </div>
  );
};
