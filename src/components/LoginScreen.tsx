import React, { useState, useEffect } from 'react';
import { authenticateUser } from '../utils/storage';
import { UserName } from '../types';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Cloud, CloudCheck, CheckCircle2, Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserName) => void;
  isCloudConnected?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  isCloudConnected = true,
}) => {
  const [selectedUser, setSelectedUser] = useState<'Mafran' | 'Naiely'>('Mafran');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const authenticated = authenticateUser(selectedUser, password);
    if (authenticated) {
      onLoginSuccess(authenticated);
    } else {
      setErrorMsg('Senha incorreta. Verifique a senha cadastrada.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col justify-between px-4 py-8 sm:py-12 max-w-md mx-auto">
      {/* Top Branding */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Acesso Seguro Familiar
          </div>

          {!isInstalled && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111726] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold transition-all shadow-md shadow-emerald-500/5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Souza <span className="text-emerald-400">·</span> Gestão
        </h1>
        <p className="text-slate-400 text-sm">
          Painel financeiro compartilhado e controle inteligente de compras do mês.
        </p>

        {/* Status do Banco de Dados na Nuvem */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#111726]/90 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CloudCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-bold text-white truncate">
                  Banco na Nuvem Ativo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Sincronizado em tempo real para todos os aparelhos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>Nuvem OK</span>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-[#111726] border border-slate-800/80 rounded-3xl p-6 shadow-2xl shadow-black/60 my-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-200">Escolha o usuário</h2>
          <span className="text-xs text-slate-500">Login Fixo</span>
        </div>

        {/* User Selection Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0a0d14] rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setSelectedUser('Mafran');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              selectedUser === 'Mafran'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              M
            </div>
            Mafran
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedUser('Naiely');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              selectedUser === 'Naiely'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              N
            </div>
            Naiely
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Senha de acesso de {selectedUser}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Digite a senha"
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Acessar Painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Fill Credentials */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 font-medium mb-2.5">
            Credenciais do App (toque para preencher rápido):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedUser('Mafran');
                setPassword('96035060');
                setErrorMsg('');
              }}
              className="p-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 hover:border-emerald-500/40 text-left transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-emerald-400">Mafran</div>
              <div className="text-[11px] font-mono text-slate-500">96035060</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedUser('Naiely');
                setPassword('Nah22');
                setErrorMsg('');
              }}
              className="p-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 hover:border-purple-500/40 text-left transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-purple-400">Naiely</div>
              <div className="text-[11px] font-mono text-slate-500">Nah22</div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-600">
        <p>Souza - Gestão Familiar · Uso Exclusivo</p>
        <p className="mt-1 text-[11px] text-slate-500">Dados salvos com segurança no dispositivo</p>
      </div>

      {/* Install App Instruction Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Instalar Souza Gestão</h3>
            <p className="text-slate-400 text-xs mb-4">
              Tenha o aplicativo direto na tela inicial do seu celular para acesso rápido e prático, funcionando como um app nativo.
            </p>

            <div className="space-y-3 text-xs text-slate-300 mb-6 bg-[#0a0d14] p-3.5 rounded-2xl border border-slate-800">
              <div className="font-semibold text-emerald-400 mb-1">Como instalar no Android (Chrome):</div>
              <p className="text-slate-400">
                1. Toque no ícone de menu (três pontinhos <span className="font-bold">⋮</span>) no canto superior direito do navegador.<br />
                2. Selecione <span className="text-white font-medium">"Instalar aplicativo"</span> ou <span className="text-white font-medium">"Adicionar à tela inicial"</span>.
              </p>

              <div className="border-t border-slate-800 pt-2.5 mt-2.5">
                <div className="font-semibold text-purple-400 mb-1">Como instalar no iPhone (Safari):</div>
                <p className="text-slate-400">
                  1. Toque no botão de compartilhamento <span className="font-bold">⎋</span> na barra inferior.<br />
                  2. Role e selecione <span className="text-white font-medium">"Adicionar à Tela de Início"</span>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
