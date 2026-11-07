import React, { useState, useRef } from 'react';
import { Income, UserName } from '../../types';
import { filterIncomesByPrivacy, saveIncomes } from '../../utils/storage';
import { formatCurrency, formatDateBR, getTodayDateStr } from '../../utils/formatters';
import { ReceiptModal } from '../ReceiptModal';
import {
  TrendingUp,
  Plus,
  Camera,
  Trash2,
  FileImage,
  CheckCircle2,
  Wallet,
} from 'lucide-react';

interface IncomeManagerProps {
  currentUser: UserName;
  incomes: Income[];
  onUpdateIncomes: (newIncomes: Income[]) => void;
  selectedMonth: string;
}

export const IncomeManager: React.FC<IncomeManagerProps> = ({
  currentUser,
  incomes,
  onUpdateIncomes,
  selectedMonth,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(getTodayDateStr());
  const [category, setCategory] = useState('Salário');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [selectedReceipt, setSelectedReceipt] = useState<Income | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aplica a regra de privacidade obrigatória
  const visibleIncomes = filterIncomesByPrivacy(incomes, currentUser);

  // Filtra pelo mês selecionado
  const monthIncomes = visibleIncomes.filter((inc) => inc.date.startsWith(selectedMonth));
  const totalVisibleMonth = monthIncomes.reduce((acc, item) => acc + item.amount, 0);

  // Manipulador de imagem com compressão simples via Canvas
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setReceiptImage(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    const newIncome: Income = {
      id: `inc-${Date.now()}`,
      description: description.trim() || 'Recebimento',
      amount: cleanAmount,
      date,
      userId: currentUser,
      category,
      receiptImage,
      createdAt: Date.now(),
    };

    const updated = [newIncome, ...incomes];
    saveIncomes(updated);
    onUpdateIncomes(updated);

    // Reset form
    setDescription('');
    setAmountStr('');
    setReceiptImage(undefined);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este recebimento?')) {
      const updated = incomes.filter((i) => i.id !== id);
      saveIncomes(updated);
      onUpdateIncomes(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action card */}
      <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Total Recebido (Mês)</span>
          <div className="text-2xl font-black text-emerald-400 font-mono-nums">
            {formatCurrency(totalVisibleMonth)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {monthIncomes.length} lançamento{monthIncomes.length === 1 ? '' : 's'}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-11 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Renda</span>
        </button>
      </div>

      {/* Formulário de Adicionar Recebimento */}
      {showAddForm && (
        <form
          onSubmit={handleAddIncome}
          className="p-5 rounded-3xl bg-[#131b2e] border border-emerald-500/30 space-y-3.5 shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Novo Recebimento ({currentUser})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salário, Freelance, Bônus, Aluguel recebido"
              className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,00"
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono-nums"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Categoria de Renda</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Salário">Salário Mensal</option>
              <option value="Freelance">Freelance / Consultoria</option>
              <option value="Atendimentos">Atendimentos / Vendas</option>
              <option value="Investimentos">Rendimento de Investimentos</option>
              <option value="Outros">Outros Ganhos</option>
            </select>
          </div>

          {/* Upload de Comprovante */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              Foto do Comprovante (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {receiptImage ? (
              <div className="relative rounded-2xl border border-emerald-500/40 bg-[#0a0d14] p-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={receiptImage}
                    alt="Preview comprovante"
                    className="w-12 h-12 object-cover rounded-xl border border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Comprovante anexado
                    </span>
                    <p className="text-[11px] text-slate-500">Pronto para salvar</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptImage(undefined)}
                  className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/60 bg-[#0a0d14]/60 text-slate-300 text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Tirar foto ou anexar comprovante</span>
              </button>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Salvar Recebimento
            </button>
          </div>
        </form>
      )}

      {/* Lista de Recebimentos */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-slate-400 px-1">
          Lançamentos de {selectedMonth}
        </h4>

        {monthIncomes.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#111726]/60 border border-slate-800/60">
            <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Nenhum recebimento registrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Toque em "Lançar Renda" para adicionar receitas.
            </p>
          </div>
        ) : (
          monthIncomes.map((inc) => (
            <div
              key={inc.id}
              className="p-3.5 rounded-2xl bg-[#111726] border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    inc.userId === 'Mafran'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-semibold text-white break-words">{inc.description}</h5>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                    <span>{formatDateBR(inc.date)}</span>
                    <span>·</span>
                    <span className="text-slate-300 font-medium">Por {inc.userId}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono-nums">
                    +{formatCurrency(inc.amount)}
                  </div>
                  <div className="text-[10px] text-slate-500">{inc.category || 'Renda'}</div>
                </div>

                {inc.receiptImage && (
                  <button
                    onClick={() => setSelectedReceipt(inc)}
                    title="Ver comprovante"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                  >
                    <FileImage className="w-4 h-4" />
                  </button>
                )}

                {/* Pode excluir se for o autor */}
                {inc.userId === currentUser && (
                  <button
                    onClick={() => handleDelete(inc.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Comprovante */}
      <ReceiptModal income={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
