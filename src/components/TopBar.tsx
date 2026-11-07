import React, { useState } from 'react';
import { UserName } from '../types';
import { FIXED_USERS } from '../utils/storage';
import { LogOut, RefreshCw, UserCheck, Shield, ChevronDown, Cloud, Database, CheckCircle2, Loader2, ArrowUpRight } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface TopBarProps {
  currentUser: UserName;
  onSwitchUser: (newUser: UserName) => void;
  onLogout: () => void;
  onResetData: () => void;
  firebaseUser?: FirebaseUser | null;
  onConnectCloud?: () => void;
  onSyncNow?: () => Promise<void>;
  isSyncing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onSwitchUser,
  onLogout,
  onResetData,
  firebaseUser,
  onConnectCloud,
  onSyncNow,
  isSyncing = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const otherUser: UserName = currentUser === 'Mafran' ? 'Naiely' : 'Mafran';
  const userProfile = FIXED_USERS[currentUser];

  const handleManualSync = async () => {
    if (onSyncNow) {
      setSyncFeedback(null);
      await onSyncNow();
      setSyncFeedback('Dados salvos no banco de dados!');
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a0d14]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-emerald-500/20">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white">Souza</span>
                <span className="text-[11px] font-medium text-emerald-400">· Gestão</span>
              </div>
              <p className="text-[10px] text-slate-400">Controle Familiar</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status do Banco Automático */}
            <button
              onClick={() => setShowMenu(true)}
              title="Banco de dados automático ativo"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="hidden xs:inline">Banco Automático</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* User Status / Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#111726] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-gradient-to-tr ${userProfile.avatarColor} flex items-center justify-center text-[11px] font-extrabold text-white shadow-sm`}
                >
                  {currentUser[0]}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-200">{currentUser}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-[#111624] border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-fade-in space-y-2">
                    {/* Perfil */}
                    <div className="p-2.5 bg-[#0a0d14] rounded-xl border border-slate-800/80">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Perfil Familiar</p>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        {userProfile.displayName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{userProfile.role}</p>
                    </div>

                    {/* Cartão de Status do Banco de Dados Automático */}
                    <div className="p-2.5 bg-[#0e1422] rounded-xl border border-slate-800/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Database className="w-3 h-3 text-emerald-400" />
                          Banco Automático
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Sincronizado
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300">
                        Todos os seus dados são salvos de forma automática e segura no banco em tempo real.
                      </p>

                      <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sincronizando...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verificar Sincronização</span>
                          </>
                        )}
                      </button>

                      {syncFeedback && (
                        <p className="text-[11px] text-emerald-400 font-medium text-center animate-fade-in">
                          {syncFeedback}
                        </p>
                      )}
                    </div>

                    {/* Switch to other user */}
                    <button
                      onClick={() => {
                        onSwitchUser(otherUser);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/60 text-slate-200 text-xs font-semibold transition-colors cursor-pointer text-left"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Alternar para {otherUser}</span>
                    </button>

                    {/* Reset test data */}
                    <button
                      onClick={() => {
                        if (confirm('Deseja apagar todos os lançamentos locais e zerar o aplicativo?')) {
                          onResetData();
                          setShowMenu(false);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer text-left"
                    >
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                      <span>Zerar lançamentos locais</span>
                    </button>

                    <div className="border-t border-slate-800/80 pt-1" />

                    {/* Logout */}
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-rose-500/10 text-rose-400 text-xs font-semibold transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair do Aplicativo</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
