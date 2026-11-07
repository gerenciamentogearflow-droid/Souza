import React, { useState } from 'react';
import { UserName } from '../types';
import { FIXED_USERS } from '../utils/storage';
import { LogOut, RefreshCw, UserCheck, ChevronDown, Cloud, CloudCheck, Loader2, Database, UploadCloud, RotateCcw } from 'lucide-react';

interface TopBarProps {
  currentUser: UserName;
  onSwitchUser: (newUser: UserName) => void;
  onLogout: () => void;
  onResetData: () => void;
  isCloudConnected?: boolean;
  onForceSyncToCloud?: () => Promise<void>;
  onOpenCacheRecovery?: () => void;
  isSyncing?: boolean;
  syncFeedback?: string | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onSwitchUser,
  onLogout,
  onResetData,
  isCloudConnected = true,
  onForceSyncToCloud,
  onOpenCacheRecovery,
  isSyncing = false,
  syncFeedback,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const otherUser: UserName = currentUser === 'Mafran' ? 'Naiely' : 'Mafran';
  const userProfile = FIXED_USERS[currentUser];

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
            {/* Status do Banco na Nuvem */}
            <button
              onClick={() => setShowMenu(true)}
              title="Banco de dados na nuvem Firestore conectado"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all cursor-pointer ${
                isCloudConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              {isSyncing ? (
                <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
              ) : (
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden xs:inline">
                {isSyncing ? 'Sincronizando...' : 'Nuvem Conectada'}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
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
                  <div className="absolute right-0 mt-2 w-80 bg-[#111624] border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in space-y-2.5">
                    {/* Perfil */}
                    <div className="p-2.5 bg-[#0a0d14] rounded-xl border border-slate-800/80">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Perfil Familiar</p>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        {userProfile.displayName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{userProfile.role}</p>
                    </div>

                    {/* Cartão do Banco na Nuvem */}
                    <div className="p-3 bg-[#0e1422] rounded-xl border border-slate-800/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                          Banco de Dados na Nuvem
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Firestore Ativo
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Seus dados são salvos na nuvem em tempo real e sincronizados entre o Render, celulares e computadores.
                      </p>

                      {onForceSyncToCloud && (
                        <button
                          onClick={onForceSyncToCloud}
                          disabled={isSyncing}
                          className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isSyncing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Enviando para a Nuvem...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Enviar dados deste aparelho para a Nuvem</span>
                            </>
                          )}
                        </button>
                      )}

                      {syncFeedback && (
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-medium text-center animate-fade-in">
                          {syncFeedback}
                        </div>
                      )}
                    </div>

                    {/* Botão de Recuperação de Cache do Aparelho */}
                    {onOpenCacheRecovery && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onOpenCacheRecovery();
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer text-left border border-emerald-500/25"
                      >
                        <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div>Recuperar do Cache do Aparelho</div>
                          <div className="text-[10px] text-slate-400 font-normal">Buscar lançamentos salvos no navegador</div>
                        </div>
                      </button>
                    )}

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

                    {/* Reset all accounts & data */}
                    <button
                      onClick={() => {
                        if (confirm('Deseja realmente apagar todas as contas, receitas e registros cadastrados no app e no banco de dados na nuvem para recomeçar do zero?')) {
                          onResetData();
                          setShowMenu(false);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer text-left"
                    >
                      <RefreshCw className="w-4 h-4 text-rose-400" />
                      <span>Apagar todas as contas (Zerar Tudo)</span>
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
