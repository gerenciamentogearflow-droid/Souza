import React, { useState } from 'react';
import { Expense, ExpenseCategory, ExpenseType, PaymentMethod, UserName, Bill, Income } from '../../types';
import { saveExpenses, saveBills, filterIncomesByPrivacy } from '../../utils/storage';
import { formatCurrency, formatDateBR, getNextMonthStr, getTodayDateStr } from '../../utils/formatters';
import {
  Plus,
  CreditCard,
  QrCode,
  Banknote,
  Calendar,
  Users,
  User,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface ExpenseManagerProps {
  currentUser: UserName;
  expenses: Expense[];
  bills: Bill[];
  incomes: Income[];
  onUpdateExpenses: (newExpenses: Expense[]) => void;
  onUpdateBills: (newBills: Bill[]) => void;
  selectedMonth: string;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  currentUser,
  expenses,
  bills,
  incomes,
  onUpdateExpenses,
  onUpdateBills,
  selectedMonth,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | ExpenseCategory>('all');
  const [filterPayer, setFilterPayer] = useState<'all' | UserName>('all');

  // Form states
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(getTodayDateStr());
  const [spentBy, setSpentBy] = useState<UserName>(currentUser);
  const [category, setCategory] = useState<ExpenseCategory>('Família');
  const [type, setType] = useState<ExpenseType>('Variável');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');

  // Para Fixo
  const [dueDayStr, setDueDayStr] = useState('10');
  const [durationMode, setDurationMode] = useState<'indefinite' | 'months'>('indefinite');
  const [durationMonthsStr, setDurationMonthsStr] = useState('12');
  const [createBillPending, setCreateBillPending] = useState(true);
  const [barcodeOrPix, setBarcodeOrPix] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPaymentCode = async (id: string, text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Para Crédito (parcelas)
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);

  // Filtros
  const monthExpenses = expenses.filter((e) => {
    // Se for crédito e estiver configurado como fatura do próximo mês, a despesa física ocorreu em data, mas computamos no mês correspondente
    const expMonth = e.date.substring(0, 7);
    return expMonth === selectedMonth;
  });

  const filteredList = monthExpenses.filter((e) => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    if (filterPayer !== 'all' && e.userId !== filterPayer) return false;
    return true;
  });

  // Estatísticas rápidas
  const totalMonth = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const visibleIncomes = filterIncomesByPrivacy(incomes, currentUser);
  const monthIncomes = visibleIncomes.filter((i) => i.date.startsWith(selectedMonth));
  const totalRecebido = monthIncomes.reduce((acc, i) => acc + i.amount, 0);
  const saldoRestante = totalRecebido - totalMonth;

  const totalFamilia = monthExpenses
    .filter((e) => e.category === 'Família')
    .reduce((acc, e) => acc + e.amount, 0);
  const totalIndividual = monthExpenses
    .filter((e) => e.category === 'Individual')
    .reduce((acc, e) => acc + e.amount, 0);
  const totalCreditoNextMonth = monthExpenses
    .filter((e) => e.paymentMethod === 'Crédito')
    .reduce((acc, e) => acc + e.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    const baseTime = Date.now();
    const newExpenses: Expense[] = [];
    const newBills: Bill[] = [];

    if (type === 'Fixo') {
      const parsedDay = parseInt(dueDayStr, 10);
      const validDueDay = !isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31 ? parsedDay : 10;
      const parsedMonths = parseInt(durationMonthsStr, 10);
      const validMonths = durationMode === 'indefinite' ? 12 : (!isNaN(parsedMonths) && parsedMonths >= 1 ? parsedMonths : 12);

      const [startYearStr, startMonthStr] = date.split('-');
      const startYear = parseInt(startYearStr, 10);
      const startMonth = parseInt(startMonthStr, 10);

      for (let i = 0; i < validMonths; i++) {
        const totalMonths = startYear * 12 + (startMonth - 1) + i;
        const targetYear = Math.floor(totalMonths / 12);
        const targetMonth = (totalMonths % 12) + 1;
        const targetMonthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
        const targetDate = `${targetMonthStr}-${String(validDueDay).padStart(2, '0')}`;

        const expId = `exp-${baseTime}-${i}`;
        const newExpense: Expense = {
          id: expId,
          description: description.trim(),
          amount: cleanAmount,
          date: targetDate,
          userId: spentBy,
          category,
          type,
          paymentMethod,
          dueDay: validDueDay,
          durationMonths: durationMode === 'indefinite' ? 'indefinite' : validMonths,
          barcodeOrPix: barcodeOrPix.trim() || undefined,
          isNextMonthInvoice: paymentMethod === 'Crédito',
          createdAt: baseTime,
        };
        newExpenses.push(newExpense);

        if (createBillPending) {
          const newBill: Bill = {
            id: `bill-${baseTime}-${i}`,
            name: description.trim(),
            amount: cleanAmount,
            dueDate: targetDate,
            barcodeOrPix: barcodeOrPix.trim() || undefined,
            isPaid: false,
            category,
            userId: spentBy,
            isInstallment: true,
            installmentCurrent: i + 1,
            installmentTotal: validMonths,
            installmentAmount: cleanAmount,
          };
          newBills.push(newBill);
        }
      }
    } else {
      const newExpense: Expense = {
        id: `exp-${baseTime}`,
        description: description.trim(),
        amount: cleanAmount,
        date,
        userId: spentBy,
        category,
        type,
        paymentMethod,
        isNextMonthInvoice: paymentMethod === 'Crédito',
        createdAt: baseTime,
      };
      newExpenses.push(newExpense);
    }

    const updatedExpenses = [...newExpenses, ...expenses];
    saveExpenses(updatedExpenses);
    onUpdateExpenses(updatedExpenses);

    if (newBills.length > 0) {
      const updatedBills = [...newBills, ...bills];
      saveBills(updatedBills);
      onUpdateBills(updatedBills);
    }

    // Reset form
    setDescription('');
    setAmountStr('');
    setBarcodeOrPix('');
    setShowAddForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Deseja excluir este gasto?')) {
      const updated = expenses.filter((e) => e.id !== id);
      saveExpenses(updated);
      onUpdateExpenses(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner de Gastos Compartilhados */}
      <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 space-y-3">
        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <span className="text-xs text-slate-400">Total de Despesas ({selectedMonth})</span>
            <div className="text-2xl font-black text-rose-400 font-mono-nums">
              {formatCurrency(totalMonth)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Restou do Salário</span>
            <div
              className={`text-2xl font-black font-mono-nums ${
                saldoRestante >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(saldoRestante)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400">
            Recebido: <strong className="text-emerald-400">{formatCurrency(totalRecebido)}</strong>
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-10 px-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Gasto</span>
          </button>
        </div>

        {/* Mini stats de categoria */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <div className="p-2.5 rounded-2xl bg-[#0a0d14] border border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Família
              </span>
              <span className="font-mono-nums font-bold text-blue-400">
                {formatCurrency(totalFamilia)}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#0a0d14] border border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Individuais
              </span>
              <span className="font-mono-nums font-bold text-amber-400">
                {formatCurrency(totalIndividual)}
              </span>
            </div>
          </div>
        </div>

        {/* Alerta de Crédito automático para o próximo mês */}
        {totalCreditoNextMonth > 0 && (
          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-purple-200">Fatura Próximo Mês ({getNextMonthStr(selectedMonth)})</span>
                <p className="text-[11px] text-slate-400">Total acumulado em compras no cartão</p>
              </div>
            </div>
            <span className="text-sm font-extrabold text-purple-300 font-mono-nums">
              {formatCurrency(totalCreditoNextMonth)}
            </span>
          </div>
        )}
      </div>

      {/* Formulário de Novo Gasto */}
      {showAddForm && (
        <form
          onSubmit={handleAddExpense}
          className="p-5 rounded-3xl bg-[#131b2e] border border-rose-500/30 space-y-4 shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              Cadastrar Novo Gasto
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
            <label className="block text-xs text-slate-400 mb-1">Descrição do Gasto</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel, Supermercado, Luz, Combustível, Farmácia"
              className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
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
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono-nums"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          {/* Quem Gastou */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Quem Gastou?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSpentBy('Mafran')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  spentBy === 'Mafran'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-[#0a0d14] text-slate-400 border border-slate-800'
                }`}
              >
                Mafran
              </button>
              <button
                type="button"
                onClick={() => setSpentBy('Naiely')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  spentBy === 'Naiely'
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'bg-[#0a0d14] text-slate-400 border border-slate-800'
                }`}
              >
                Naiely
              </button>
            </div>
          </div>

          {/* Categoria: Família vs Individual */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Categoria do Gasto</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('Família')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  category === 'Família'
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-[#0a0d14] text-slate-400 border border-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Gastos da Família
              </button>
              <button
                type="button"
                onClick={() => setCategory('Individual')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  category === 'Individual'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-[#0a0d14] text-slate-400 border border-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Gastos Individuais
              </button>
            </div>
          </div>

          {/* Tipo: Fixo ou Variável */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Tipo de Despesa</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('Variável')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  type === 'Variável'
                    ? 'bg-slate-700 text-white'
                    : 'bg-[#0a0d14] text-slate-400 border border-slate-800'
                }`}
              >
                ⚡ Variável (Pontual)
              </button>
              <button
                type="button"
                onClick={() => setType('Fixo')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  type === 'Fixo'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-[#0a0d14] text-slate-400 border border-slate-800'
                }`}
              >
                📌 Fixo (Recorrente)
              </button>
            </div>
          </div>

          {/* Configurações se for Fixo */}
          {type === 'Fixo' && (
            <div className="p-3.5 rounded-2xl bg-[#0a0d14] border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Clock className="w-3.5 h-3.5" />
                <span>Configuração de Gasto Fixo</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Dia do Vencimento</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={dueDayStr}
                    placeholder="Ex: 10"
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setDueDayStr(val);
                    }}
                    className="w-full bg-[#111726] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Até quando vai durar?</label>
                  <select
                    value={durationMode}
                    onChange={(e) => setDurationMode(e.target.value as any)}
                    className="w-full bg-[#111726] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="indefinite">Indeterminado (sem fim)</option>
                    <option value="months">Quantidade de Meses</option>
                  </select>
                </div>
              </div>

              {durationMode === 'months' && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Duração em meses</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={durationMonthsStr}
                    placeholder="Ex: 12"
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setDurationMonthsStr(val);
                    }}
                    className="w-full bg-[#111726] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              )}

              {/* Dados para Pagamento (Código de barras, boleto ou Pix) */}
              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Dados para Pagamento</span>
                  <span className="text-[10px] text-slate-500 font-normal">Boleto / Pix / Código</span>
                </label>
                <textarea
                  rows={2}
                  value={barcodeOrPix}
                  onChange={(e) => setBarcodeOrPix(e.target.value)}
                  placeholder="Cole aqui o código de barras, linha digitável ou chave / Pix Copia e Cola"
                  className="w-full bg-[#111726] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono-nums"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={createBillPending}
                  onChange={(e) => setCreateBillPending(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-500 focus:ring-0 w-4 h-4"
                />
                <span>Criar também na lista de Contas a Pagar</span>
              </label>
            </div>
          )}

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Forma de Pagamento</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Pix', 'Dinheiro', 'Débito', 'Crédito'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all ${
                    paymentMethod === method
                      ? method === 'Crédito'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-200 text-slate-950 font-bold'
                      : 'bg-[#0a0d14] text-slate-400 border border-slate-800'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Aviso inteligente de crédito */}
            {paymentMethod === 'Crédito' && (
              <div className="mt-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] flex items-start gap-2">
                <CreditCard className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Cálculo Automático de Fatura:</strong> Este valor será somado automaticamente à fatura do próximo mês ({getNextMonthStr(selectedMonth)}).
                </span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-500/20 cursor-pointer"
            >
              Registrar Gasto
            </button>
          </div>
        </form>
      )}

      {/* Filtros rápidos */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            filterCategory === 'all'
              ? 'bg-slate-200 text-slate-950'
              : 'bg-[#111726] text-slate-400 border border-slate-800'
          }`}
        >
          Todos ({monthExpenses.length})
        </button>

        <button
          onClick={() => setFilterCategory('Família')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            filterCategory === 'Família'
              ? 'bg-blue-500 text-white'
              : 'bg-[#111726] text-slate-400 border border-slate-800'
          }`}
        >
          Família
        </button>

        <button
          onClick={() => setFilterCategory('Individual')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            filterCategory === 'Individual'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-[#111726] text-slate-400 border border-slate-800'
          }`}
        >
          Individuais
        </button>

        <button
          onClick={() => setFilterPayer(filterPayer === 'Mafran' ? 'all' : 'Mafran')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            filterPayer === 'Mafran'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-[#111726] text-slate-400 border border-slate-800'
          }`}
        >
          Por Mafran
        </button>

        <button
          onClick={() => setFilterPayer(filterPayer === 'Naiely' ? 'all' : 'Naiely')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            filterPayer === 'Naiely'
              ? 'bg-purple-500 text-white'
              : 'bg-[#111726] text-slate-400 border border-slate-800'
          }`}
        >
          Por Naiely
        </button>
      </div>

      {/* Lista de Gastos */}
      <div className="space-y-2">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#111726]/60 border border-slate-800/60">
            <p className="text-sm font-semibold text-slate-300">Nenhum gasto encontrado</p>
            <p className="text-xs text-slate-500 mt-1">Toque em "Novo Gasto" para cadastrar.</p>
          </div>
        ) : (
          filteredList.map((exp) => (
            <div
              key={exp.id}
              className="p-3.5 rounded-2xl bg-[#111726] border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    exp.category === 'Família'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {exp.paymentMethod === 'Crédito' ? (
                    <CreditCard className="w-4 h-4 text-purple-400" />
                  ) : (
                    <span className="text-xs font-black">{exp.category[0]}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="text-sm font-semibold text-white break-words leading-snug">{exp.description}</h5>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 flex-wrap">
                    <span>{formatDateBR(exp.date)}</span>
                    <span>·</span>
                    <span
                      className={`font-semibold ${
                        exp.userId === 'Mafran' ? 'text-emerald-400' : 'text-purple-400'
                      }`}
                    >
                      {exp.userId}
                    </span>
                    <span>·</span>
                    <span className="text-slate-400">{exp.type}</span>
                    <span>·</span>
                    <span
                      className={`font-medium ${
                        exp.paymentMethod === 'Crédito' ? 'text-purple-300' : 'text-slate-300'
                      }`}
                    >
                      {exp.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                <div className="text-right">
                  <div className="text-sm font-bold text-rose-400 font-mono-nums">
                    -{formatCurrency(exp.amount)}
                  </div>
                  {exp.paymentMethod === 'Crédito' && (
                    <div className="text-[10px] text-purple-400 font-medium">Próx. fatura</div>
                  )}
                </div>

                {exp.barcodeOrPix && (
                  <button
                    onClick={() => handleCopyPaymentCode(exp.id, exp.barcodeOrPix)}
                    title="Copiar dados para pagamento"
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      copiedId === exp.id
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-[#0a0d14] hover:bg-slate-800 text-indigo-300 border border-slate-800'
                    }`}
                  >
                    {copiedId === exp.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => handleDeleteExpense(exp.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
