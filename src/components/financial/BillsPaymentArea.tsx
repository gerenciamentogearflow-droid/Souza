import React, { useState } from 'react';
import { Bill, ExpenseCategory, UserName } from '../../types';
import { saveBills } from '../../utils/storage';
import { formatCurrency, formatDateBR, getBillDueStatus, getTodayDateStr, formatMonthName, getNextMonthStr, getPreviousMonthStr } from '../../utils/formatters';
import {
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface BillsPaymentAreaProps {
  currentUser: UserName;
  bills: Bill[];
  onUpdateBills: (newBills: Bill[]) => void;
  selectedMonth: string;
}

export const BillsPaymentArea: React.FC<BillsPaymentAreaProps> = ({
  currentUser,
  bills,
  onUpdateBills,
  selectedMonth,
}) => {
  const [viewingMonth, setViewingMonth] = useState<string>(selectedMonth);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'pending' | 'paid' | 'all'>('pending');

  // Form states
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dueDate, setDueDate] = useState(`${viewingMonth}-10`);
  const [barcodeOrPix, setBarcodeOrPix] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Família');
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallmentsStr, setTotalInstallmentsStr] = useState('12');
  const [currentInstallmentStr, setCurrentInstallmentStr] = useState('1');
  const [installmentAmountStr, setInstallmentAmountStr] = useState('');

  // Filtra as contas do mês visualizado
  const monthBills = bills.filter((b) => b.dueDate.startsWith(viewingMonth));
  const filteredBills = monthBills.filter((b) => {
    if (filterTab === 'pending') return !b.isPaid;
    if (filterTab === 'paid') return b.isPaid;
    return true;
  });

  const pendingBills = monthBills.filter((b) => !b.isPaid);
  const totalPendingAmount = pendingBills.reduce((acc, b) => acc + b.amount, 0);

  const handleCopyCode = async (id: string, text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleTogglePaid = (bill: Bill) => {
    let updated: Bill[];

    if (!bill.isPaid && bill.isInstallment && bill.installmentCurrent && bill.installmentTotal) {
      // É parcelamento e deu baixa na parcela!
      if (bill.installmentCurrent < bill.installmentTotal) {
        // Incrementa para a próxima parcela e atualiza o vencimento para o próximo mês
        const [yearStr, monthStr, dayStr] = bill.dueDate.split('-');
        let nextYear = parseInt(yearStr, 10);
        let nextMonth = parseInt(monthStr, 10) + 1;
        if (nextMonth > 12) {
          nextMonth = 1;
          nextYear += 1;
        }
        const nextDueDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${dayStr || '10'}`;

        updated = bills.map((b) => {
          if (b.id === bill.id) {
            return {
              ...b,
              installmentCurrent: (b.installmentCurrent || 1) + 1,
              dueDate: nextDueDate,
              isPaid: false, // Próxima parcela continua pendente
              paidAt: getTodayDateStr(),
            };
          }
          return b;
        });
      } else {
        // Última parcela quitada!
        updated = bills.map((b) => {
          if (b.id === bill.id) {
            return {
              ...b,
              isPaid: true,
              paidAt: getTodayDateStr(),
            };
          }
          return b;
        });
      }
    } else {
      // Conta normal simples
      updated = bills.map((b) => {
        if (b.id === bill.id) {
          return {
            ...b,
            isPaid: !b.isPaid,
            paidAt: !b.isPaid ? getTodayDateStr() : undefined,
          };
        }
        return b;
      });
    }

    saveBills(updated);
    onUpdateBills(updated);
  };

  const handleDeleteBill = (id: string) => {
    if (confirm('Deseja excluir esta conta?')) {
      const updated = bills.filter((b) => b.id !== id);
      saveBills(updated);
      onUpdateBills(updated);
    }
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = isInstallment
      ? parseFloat(installmentAmountStr.replace(',', '.'))
      : parseFloat(amountStr.replace(',', '.'));

    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    const parsedTotal = parseInt(totalInstallmentsStr, 10);
    const validTotal = !isNaN(parsedTotal) && parsedTotal >= 2 ? parsedTotal : 12;
    const parsedCurrent = parseInt(currentInstallmentStr, 10);
    const validCurrent = !isNaN(parsedCurrent) && parsedCurrent >= 1 ? parsedCurrent : 1;

    const baseTime = Date.now();
    const newBills: Bill[] = [];

    if (isInstallment) {
      const [startYearStr, startMonthStr, startDayStr] = dueDate.split('-');
      const startYear = parseInt(startYearStr, 10);
      const startMonth = parseInt(startMonthStr, 10);
      const dayStr = startDayStr || '10';

      const remainingInstallments = validTotal - validCurrent + 1;

      for (let i = 0; i < remainingInstallments; i++) {
        const totalMonths = startYear * 12 + (startMonth - 1) + i;
        const targetYear = Math.floor(totalMonths / 12);
        const targetMonth = (totalMonths % 12) + 1;
        const targetDueDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${dayStr}`;

        const billItem: Bill = {
          id: `bill-${baseTime}-${i}`,
          name: name.trim(),
          amount: cleanAmount,
          dueDate: targetDueDate,
          barcodeOrPix: barcodeOrPix.trim(),
          isPaid: false,
          category,
          userId: currentUser,
          isInstallment: true,
          installmentCurrent: validCurrent + i,
          installmentTotal: validTotal,
          installmentAmount: cleanAmount,
        };
        newBills.push(billItem);
      }
    } else {
      const billItem: Bill = {
        id: `bill-${baseTime}`,
        name: name.trim(),
        amount: cleanAmount,
        dueDate,
        barcodeOrPix: barcodeOrPix.trim(),
        isPaid: false,
        category,
        userId: currentUser,
      };
      newBills.push(billItem);
    }

    const updated = [...newBills, ...bills];
    saveBills(updated);
    onUpdateBills(updated);

    // Reset
    setName('');
    setAmountStr('');
    setBarcodeOrPix('');
    setIsInstallment(false);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Seletor de Mês (Navegação Mês a Mês) */}
      <div className="p-3 rounded-2xl bg-[#111726] border border-slate-800 flex items-center justify-between shadow-lg">
        <button
          onClick={() => setViewingMonth(getPreviousMonthStr(viewingMonth))}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          title="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
            Mês de Referência
          </span>
          <span className="text-sm font-bold text-white capitalize">
            {formatMonthName(viewingMonth)}
          </span>
        </div>

        <button
          onClick={() => setViewingMonth(getNextMonthStr(viewingMonth))}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          title="Próximo mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Resumo de Pendências */}
      <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Total Pendente a Pagar</span>
          <div className="text-2xl font-black text-amber-400 font-mono-nums">
            {formatCurrency(totalPendingAmount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {pendingBills.length} conta{pendingBills.length === 1 ? '' : 's'} em aberto
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Conta</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterTab('pending')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all ${
            filterTab === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-[#111726] text-slate-400 border border-slate-800'
          }`}
        >
          Pendentes ({pendingBills.length})
        </button>

        <button
          onClick={() => setFilterTab('paid')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all ${
            filterTab === 'paid'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-[#111726] text-slate-400 border border-slate-800'
          }`}
        >
          Pagas ({bills.filter((b) => b.isPaid).length})
        </button>

        <button
          onClick={() => setFilterTab('all')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all ${
            filterTab === 'all'
              ? 'bg-slate-700 text-white'
              : 'bg-[#111726] text-slate-400 border border-slate-800'
          }`}
        >
          Todas ({bills.length})
        </button>
      </div>

      {/* Formulário Modal de Nova Conta / Parcelamento */}
      {showAddModal && (
        <form
          onSubmit={handleAddBill}
          className="p-5 rounded-3xl bg-[#131b2e] border border-amber-500/30 space-y-3.5 shadow-2xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Cadastrar Conta ou Parcela
            </h3>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Nome da Conta / Despesa</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Condomínio, Energia, Seguro, Parcela Celular"
              className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Toggle Parcelamento */}
          <div className="p-3 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-slate-200">
                  Esta conta é parcelada? (ex: 12x)
                </span>
              </div>
              <input
                type="checkbox"
                checked={isInstallment}
                onChange={(e) => setIsInstallment(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-purple-500 focus:ring-0"
              />
            </label>

            {isInstallment && (
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Parcela Atual</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentInstallmentStr}
                      placeholder="Ex: 1"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setCurrentInstallmentStr(val);
                      }}
                      className="w-full bg-[#111726] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white font-mono-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Total Parcelas</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={totalInstallmentsStr}
                      placeholder="Ex: 12"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setTotalInstallmentsStr(val);
                      }}
                      className="w-full bg-[#111726] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white font-mono-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Valor da Parcela</label>
                    <input
                      type="number"
                      step="0.01"
                      value={installmentAmountStr}
                      onChange={(e) => setInstallmentAmountStr(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-[#111726] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white font-mono-nums"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-purple-300">
                  Total estimado: {formatCurrency((parseFloat(installmentAmountStr) || 0) * (parseInt(totalInstallmentsStr, 10) || 1))} · Restam {(parseInt(totalInstallmentsStr, 10) || 1) - (parseInt(currentInstallmentStr, 10) || 1) + 1} parcelas.
                </p>
              </div>
            )}
          </div>

          {!isInstallment && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,00"
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono-nums"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Data de Vencimento</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Código de Barras ou Chave Pix Copia e Cola
            </label>
            <textarea
              rows={2}
              value={barcodeOrPix}
              onChange={(e) => setBarcodeOrPix(e.target.value)}
              placeholder="Cole aqui a linha digitável do boleto ou o Pix Copia e Cola"
              className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono-nums"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Salvar Conta
            </button>
          </div>
        </form>
      )}

      {/* Lista de Contas */}
      <div className="space-y-3">
        {filteredBills.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#111726]/60 border border-slate-800/60">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Nenhuma conta pendente!</p>
            <p className="text-xs text-slate-500 mt-1">Tudo em dia para este período.</p>
          </div>
        ) : (
          filteredBills.map((bill) => {
            const dueStatus = getBillDueStatus(bill.dueDate, bill.isPaid);
            const remainingInstallments =
              bill.installmentTotal && bill.installmentCurrent
                ? bill.installmentTotal - bill.installmentCurrent + 1
                : 0;

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-3xl bg-[#111726] border transition-all ${
                  bill.isPaid
                    ? 'border-emerald-500/20 opacity-75'
                    : dueStatus.status === 'overdue'
                    ? 'border-rose-500/40 shadow-lg shadow-rose-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header da conta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{bill.name}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${dueStatus.badgeClass}`}
                      >
                        {dueStatus.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>Vencimento: {formatDateBR(bill.dueDate)}</span>
                      {bill.category && (
                        <>
                          <span>·</span>
                          <span>{bill.category}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-white font-mono-nums">
                      {formatCurrency(bill.amount)}
                    </div>
                  </div>
                </div>

                {/* Se for parcelamento */}
                {bill.isInstallment && (
                  <div className="mt-3 p-3 rounded-2xl bg-[#0a0d14] border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Parcela {bill.installmentCurrent} de {bill.installmentTotal}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono-nums">
                        {remainingInstallments > 0
                          ? `Faltam ${remainingInstallments} parcelas`
                          : 'Concluído'}
                      </span>
                    </div>

                    {/* Barra de progresso do parcelamento */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            ((bill.installmentCurrent || 1) / (bill.installmentTotal || 1)) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Valor de cada: {formatCurrency(bill.installmentAmount || bill.amount)}</span>
                      <span>
                        Restante:{' '}
                        {formatCurrency(
                          (bill.installmentAmount || bill.amount) * remainingInstallments
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Código de Barras / Pix com botão COPIAR */}
                {bill.barcodeOrPix && (
                  <div className="mt-3 p-2.5 rounded-2xl bg-[#0a0d14] border border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-slate-500 block">Código / Pix</span>
                      <p className="text-xs text-slate-300 font-mono-nums truncate">
                        {bill.barcodeOrPix}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyCode(bill.id, bill.barcodeOrPix)}
                      className={`h-9 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                        copiedId === bill.id
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {copiedId === bill.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>COPIADO!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPIAR</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Ações inferiores da conta */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDeleteBill(bill.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleTogglePaid(bill)}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      bill.isPaid
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : bill.isInstallment
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {bill.isPaid
                        ? 'Marcar como Não Pago'
                        : bill.isInstallment
                        ? `Dar Baixa na Parcela (${bill.installmentCurrent}/${bill.installmentTotal})`
                        : 'Já Paguei'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
