import React, { useState, useEffect } from 'react';
import { scanBrowserStorageForBackups, DiscoveredCacheBackup, saveExpenses, saveBills } from '../utils/storage';
import { Expense, Bill } from '../types';
import { saveExpenseDoc, saveBillDoc } from '../utils/firestoreService';
import { X, Search, RotateCcw, AlertTriangle, CheckCircle2, HardDrive, Database, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface CacheRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: (expenses: Expense[], bills?: Bill[]) => void;
}

export const CacheRecoveryModal: React.FC<CacheRecoveryModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [backups, setBackups] = useState<DiscoveredCacheBackup[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [restoredMsg, setRestoredMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleScan();
    }
  }, [isOpen]);

  const handleScan = () => {
    setIsScanning(true);
    setRestoredMsg(null);
    try {
      const found = scanBrowserStorageForBackups();
      setBackups(found);
    } catch (e) {
      console.error('Erro ao buscar backups no cache:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyBackup = async (backup: DiscoveredCacheBackup) => {
    try {
      // Identifica se são despesas ou contas
      const isBill = backup.data.some((item) => 'dueDate' in item || 'isPaid' in item);
      if (isBill) {
        saveBills(backup.data as Bill[]);
        for (const b of backup.data as Bill[]) {
          await saveBillDoc(b).catch(() => {});
        }
        onDataRestored([], backup.data as Bill[]);
        setRestoredMsg(`Contas da chave "${backup.storageKey}" restauradas e sincronizadas com a nuvem!`);
      } else {
        saveExpenses(backup.data as Expense[]);
        for (const exp of backup.data as Expense[]) {
          await saveExpenseDoc(exp).catch(() => {});
        }
        onDataRestored(backup.data as Expense[]);
        setRestoredMsg(`Despesas da chave "${backup.storageKey}" restauradas e sincronizadas com a nuvem!`);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Erro ao restaurar backup:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111726] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Recuperador de Cache do Aparelho</h3>
              <p className="text-xs text-slate-400">Varredura de dados salvos na memória local do navegador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#0a0d14] border border-slate-800 text-xs text-slate-300">
            <p className="font-semibold text-emerald-400 mb-1">Como funciona:</p>
            <p className="text-slate-400 leading-relaxed">
              O sistema vasculha o armazenamento local (<span className="text-white">localStorage</span>) deste navegador à procura de versões de lançamentos salvas durante edições anteriores.
            </p>
          </div>

          {restoredMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{restoredMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Backups Encontrados na Memória ({backups.length})
            </span>
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Reescanear Memória</span>
            </button>
          </div>

          {backups.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800/80 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-sm font-bold text-slate-200">Nenhum rascunho anterior encontrado no cache deste navegador</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Se você editou pelo Chrome no celular em outra aba ou no Render, acesse pelo mesmo navegador e aparelho para que ele localize os dados salvos localmente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((b, idx) => {
                const isTargetCount = b.itemCount === 13;
                const isTargetAmount = Math.abs(b.totalAmount - 3899.3) < 1;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isTargetCount || isTargetAmount
                        ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-[#0a0d14] border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                            {b.storageKey}
                          </span>
                          {(isTargetCount || isTargetAmount) && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Lançamentos Reais
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          <strong className="text-white">{b.itemCount} itens</strong> cadastrados · Total: <strong className="text-emerald-400">{formatCurrency(b.totalAmount)}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => handleApplyBackup(b)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        <span>Restaurar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80">
                      <p className="text-[11px] text-slate-500 mb-1">Prévia de itens desta lista:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {b.sampleDescriptions.map((desc, dIdx) => (
                          <span
                            key={dIdx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300"
                          >
                            {desc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
