import React, { useState } from 'react';
import { FIXED_USERS, authenticateUser } from '../utils/storage';
import { UserName } from '../types';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Cloud, Database, CheckCircle2, Loader2 } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserName) => void;
  firebaseUser?: FirebaseUser | null;
  onConnectCloud?: () => void;
  isConnectingCloud?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  firebaseUser,
  onConnectCloud,
  isConnectingCloud = false,
}) => {
  const [selectedUser, setSelectedUser] = useState<'Mafran' | 'Naiely'>('Mafran');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleQuickFill = (user: 'Mafran' | 'Naiely') => {
    setSelectedUser(user);
    const pwd = FIXED_USERS[user].password;
    setPassword(pwd);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col justify-between px-4 py-8 sm:py-12 max-w-md mx-auto">
      {/* Top Branding */}
      <div className="pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Acesso Seguro Familiar
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Souza <span className="text-emerald-400">·</span> Gestão
        </h1>
        <p className="text-slate-400 text-sm">
          Painel financeiro compartilhado e controle inteligente de compras do mês.
        </p>

        {/* Status do Banco de Dados Automático */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#111726]/90 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white truncate">
                  Banco de Dados Automático
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Dados salvos e sincronizados automaticamente na nuvem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ativo</span>
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

        {/* Quick Credentials Info / Autofill Helpers */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 font-medium mb-2.5">
            Credenciais do App (toque para preencher rápido):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('Mafran')}
              className="text-left p-2.5 rounded-xl bg-[#0d121e] border border-slate-800/80 hover:border-emerald-500/40 transition-colors"
            >
              <div className="font-semibold text-emerald-400">Mafran</div>
              <div className="text-[11px] text-slate-400 font-mono-nums">96035060</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('Naiely')}
              className="text-left p-2.5 rounded-xl bg-[#0d121e] border border-slate-800/80 hover:border-purple-500/40 transition-colors"
            >
              <div className="font-semibold text-purple-400">Naiely</div>
              <div className="text-[11px] text-slate-400 font-mono-nums">Nah22</div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-600">
        <p>Souza - Gestão Familiar · Uso Exclusivo</p>
        <p className="mt-1 text-[11px] text-slate-500">Dados salvos com segurança no dispositivo</p>
      </div>
    </div>
  );
};
