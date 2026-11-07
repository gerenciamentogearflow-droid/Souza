import React from 'react';
import { X, Calendar, User, DollarSign, Download, FileText } from 'lucide-react';
import { Income } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';

interface ReceiptModalProps {
  income: Income | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ income, onClose }) => {
  if (!income) return null;

  const handleDownload = () => {
    if (!income.receiptImage) return;
    const a = document.createElement('a');
    a.href = income.receiptImage;
    a.download = `comprovante-${income.description.replace(/\s+/g, '-').toLowerCase()}-${income.date}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111624] border border-slate-800 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Comprovante de Recebimento</h3>
              <p className="text-[11px] text-slate-400">
                Lançamento registrado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Income details strip */}
          <div className="bg-[#0a0d14] rounded-2xl p-3 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Descrição</span>
              <span className="text-xs font-semibold text-white">{income.description}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Valor Creditado</span>
              <span className="text-sm font-bold text-emerald-400 font-mono-nums">
                {formatCurrency(income.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Data</span>
              <span className="text-xs text-slate-300 font-mono-nums">{formatDateBR(income.date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Lançado por</span>
              <span className="text-xs font-medium text-slate-300">{income.userId}</span>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0a0d14] min-h-[220px] flex items-center justify-center">
            {income.receiptImage ? (
              <img
                src={income.receiptImage}
                alt={`Comprovante de ${income.description}`}
                className="w-full max-h-[380px] object-contain"
              />
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs">
                Nenhuma foto do comprovante foi anexada neste lançamento.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-3 bg-[#0e1320]">
          {income.receiptImage && (
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Baixar Foto
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer text-center"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
