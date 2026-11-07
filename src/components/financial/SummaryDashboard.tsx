import React from 'react';
import { Bill, Expense, Income, UserName } from '../../types';
import { filterIncomesByPrivacy } from '../../utils/storage';
import {
  formatCurrency,
  formatDateBR,
  formatMonthName,
  getNextMonthStr,
  getPreviousMonthStr,
} from '../../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Users,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PieChart,
} from 'lucide-react';

interface SummaryDashboardProps {
  currentUser: UserName;
  expenses: Expense[];
  bills: Bill[];
  incomes: Income[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  currentUser,
  expenses,
  bills,
  incomes,
  selectedMonth,
  onSelectMonth,
}) => {
  // 1. Despesas do mês selecionado
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const totalGasto = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

  // 2. Por usuário
  const totalMafran = monthExpenses
    .filter((e) => e.userId === 'Mafran')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalNaiely = monthExpenses
    .filter((e) => e.userId === 'Naiely')
    .reduce((acc, e) => acc + e.amount, 0);

  // 3. Família vs Individual
  const totalFamilia = monthExpenses
    .filter((e) => e.category === 'Família')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalIndividual = monthExpenses
    .filter((e) => e.category === 'Individual')
    .reduce((acc, e) => acc + e.amount, 0);

  // 4. Pago vs Pendente (em contas do mês)
  const monthBills = bills.filter((b) => b.dueDate.startsWith(selectedMonth));
  const totalPago = monthBills
    .filter((b) => b.isPaid)
    .reduce((acc, b) => acc + b.amount, 0);

  const totalPendente = monthBills
    .filter((b) => !b.isPaid)
    .reduce((acc, b) => acc + b.amount, 0);

  // 5. Recebimentos com privacidade
  const visibleIncomes = filterIncomesByPrivacy(incomes, currentUser);
  const monthIncomes = visibleIncomes.filter((i) => i.date.startsWith(selectedMonth));
  const totalRecebido = monthIncomes.reduce((acc, i) => acc + i.amount, 0);

  // 6. Fatura do próximo mês (crédito)
  const totalCreditoProximoMes = monthExpenses
    .filter((e) => e.paymentMethod === 'Crédito')
    .reduce((acc, e) => acc + e.amount, 0);

  // Percentuais para barras visuais
  const pctMafran = totalGasto > 0 ? (totalMafran / totalGasto) * 100 : 50;
  const pctFamilia = totalGasto > 0 ? (totalFamilia / totalGasto) * 100 : 50;

  return (
    <div className="space-y-4">
      {/* Seletor de Mês */}
      <div className="p-2 rounded-2xl bg-[#111726] border border-slate-800 flex items-center justify-between">
        <button
          onClick={() => onSelectMonth(getPreviousMonthStr(selectedMonth))}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          title="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-xs text-slate-400 block font-medium">Período de Referência</span>
          <span className="text-sm font-bold text-white capitalize">
            {formatMonthName(selectedMonth)}
          </span>
        </div>

        <button
          onClick={() => onSelectMonth(getNextMonthStr(selectedMonth))}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          title="Próximo mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main KPI Card: Total Gasto no Mês */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-[#141b2f] to-[#0e1424] border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Gasto no Mês
            </span>
            <div className="text-3xl font-black text-white font-mono-nums mt-1">
              {formatCurrency(totalGasto)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Saldo Líquido Estimado */}
        {totalRecebido > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="text-slate-400">
              Receita visível:{' '}
              <span className="text-emerald-400 font-semibold font-mono-nums">
                {formatCurrency(totalRecebido)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Saldo: </span>
              <span
                className={`font-bold font-mono-nums ${
                  totalRecebido - totalGasto >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(totalRecebido - totalGasto)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Mafran vs Naiely */}
      <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Gastos por Pessoa</span>
          <span className="text-[11px] text-slate-500 font-mono-nums">
            {monthExpenses.length} despesas
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-[#0a0d14] border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">
                M
              </div>
              <span>Mafran</span>
            </div>
            <div className="text-lg font-black text-white font-mono-nums">
              {formatCurrency(totalMafran)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {pctMafran.toFixed(0)}% do total
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0a0d14] border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 mb-1">
              <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">
                N
              </div>
              <span>Naiely</span>
            </div>
            <div className="text-lg font-black text-white font-mono-nums">
              {formatCurrency(totalNaiely)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {(100 - pctMafran).toFixed(0)}% do total
            </div>
          </div>
        </div>

        {/* Visual Bar Ratio */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${pctMafran}%` }}
          />
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${100 - pctMafran}%` }}
          />
        </div>
      </div>

      {/* Grid: Família vs Individual & Pago vs Pendente */}
      <div className="grid grid-cols-2 gap-3">
        {/* Família vs Individual */}
        <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Destino</span>
          </div>

          <div>
            <div className="text-xs text-slate-400">Família</div>
            <div className="text-sm font-bold text-blue-400 font-mono-nums">
              {formatCurrency(totalFamilia)}
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800">
            <div className="text-xs text-slate-400">Individual</div>
            <div className="text-sm font-bold text-amber-400 font-mono-nums">
              {formatCurrency(totalIndividual)}
            </div>
          </div>
        </div>

        {/* Pago vs Pendente */}
        <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Status Contas</span>
          </div>

          <div>
            <div className="text-xs text-slate-400">Total Pago</div>
            <div className="text-sm font-bold text-emerald-400 font-mono-nums">
              {formatCurrency(totalPago)}
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800">
            <div className="text-xs text-slate-400">Pendente</div>
            <div className="text-sm font-bold text-rose-400 font-mono-nums">
              {formatCurrency(totalPendente)}
            </div>
          </div>
        </div>
      </div>

      {/* Próxima Fatura de Cartão */}
      {totalCreditoProximoMes > 0 && (
        <div className="p-4 rounded-3xl bg-purple-950/20 border border-purple-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-200">
                Fatura do Próximo Mês ({getNextMonthStr(selectedMonth)})
              </span>
              <p className="text-[11px] text-slate-400">
                Lançamentos no crédito calculados automaticamente
              </p>
            </div>
          </div>
          <div className="text-base font-black text-purple-300 font-mono-nums">
            {formatCurrency(totalCreditoProximoMes)}
          </div>
        </div>
      )}

      {/* Lista de Todas as Despesas Acumuladas do Mês */}
      <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200">
            Despesas Acumuladas no Mês ({monthExpenses.length})
          </h4>
          <span className="text-[11px] text-slate-400 font-mono-nums">
            {formatCurrency(totalGasto)}
          </span>
        </div>

        {monthExpenses.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            Nenhuma despesa lançada neste mês.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {monthExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-2.5 rounded-xl bg-[#0a0d14] border border-slate-800/70 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2 flex-1">
                  <p className="font-semibold text-white break-words">{exp.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatDateBR(exp.date)} · Por {exp.userId} · {exp.category} · {exp.paymentMethod}
                  </p>
                </div>
                <span className="font-bold text-rose-400 font-mono-nums shrink-0">
                  -{formatCurrency(exp.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
