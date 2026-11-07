import React, { useState } from 'react';
import { Bill, Expense, Income, UserName } from '../../types';
import { formatCurrency, formatMonthName, getNextMonthStr, getPreviousMonthStr, getCurrentMonthStr } from '../../utils/formatters';
import {
  Calendar,
  TrendingDown,
  CreditCard,
  Layers,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface FutureProjectionsProps {
  currentUser: UserName;
  expenses: Expense[];
  bills: Bill[];
  incomes: Income[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export const FutureProjections: React.FC<FutureProjectionsProps> = ({
  currentUser,
  expenses,
  bills,
  incomes,
  selectedMonth,
  onSelectMonth,
}) => {
  // Local viewing month for projection (defaults to selectedMonth)
  const [viewingMonth, setViewingMonth] = useState<string>(selectedMonth);

  // Helper to get expenses & bills for targetMonth (YYYY-MM)
  const getMonthProjections = (targetMonth: string) => {
    // 1. Regular expenses explicitly on this month
    const directExpenses = expenses.filter((e) => e.date.startsWith(targetMonth));

    // 2. Fixed expenses projection
    const fixedTemplates = expenses.filter((e) => e.type === 'Fixo');
    const recurringGenerated: Expense[] = [];

    fixedTemplates.forEach((template) => {
      const alreadyExists = directExpenses.some((e) => e.description === template.description && e.amount === template.amount);
      if (!alreadyExists) {
        const [startYearStr, startMonthStr] = template.date.split('-');
        const startTotal = parseInt(startYearStr, 10) * 12 + (parseInt(startMonthStr, 10) - 1);

        const [targetYearStr, targetMonthStr] = targetMonth.split('-');
        const targetTotal = parseInt(targetYearStr, 10) * 12 + (parseInt(targetMonthStr, 10) - 1);

        if (targetTotal >= startTotal) {
          const diffMonths = targetTotal - startTotal;
          const duration = template.durationMonths;
          if (duration === 'indefinite' || (typeof duration === 'number' && diffMonths < duration)) {
            const dueDay = template.dueDay || 10;
            recurringGenerated.push({
              ...template,
              id: `proj-${template.id}-${targetMonth}`,
              date: `${targetMonth}-${String(dueDay).padStart(2, '0')}`,
            });
          }
        }
      }
    });

    const allMonthExpenses = [...directExpenses, ...recurringGenerated];
    const totalExpenses = allMonthExpenses.reduce((acc, e) => acc + e.amount, 0);

    // 3. Bills due in targetMonth
    const targetBills = bills.filter((b) => b.dueDate.startsWith(targetMonth));
    const totalBills = targetBills.reduce((acc, b) => acc + b.amount, 0);

    // 4. Credit card expenses
    const creditExpenses = allMonthExpenses.filter((e) => e.paymentMethod === 'Crédito');
    const totalCredit = creditExpenses.reduce((acc, e) => acc + e.amount, 0);

    // 5. Category breakdown
    const familiaTotal = allMonthExpenses
      .filter((e) => e.category === 'Família')
      .reduce((acc, e) => acc + e.amount, 0);

    const individualTotal = allMonthExpenses
      .filter((e) => e.category === 'Individual')
      .reduce((acc, e) => acc + e.amount, 0);

    return {
      allMonthExpenses,
      targetBills,
      totalExpenses,
      totalBills,
      totalCredit,
      familiaTotal,
      individualTotal,
    };
  };

  const projectionData = getMonthProjections(viewingMonth);

  return (
    <div className="space-y-4 animate-fade-in">
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
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
            Projeção Futura
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



      {/* Main KPI Card: Total Projetado no Mês */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#162238] via-[#111827] to-[#0c101b] border border-blue-500/30 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Total Despesas Previstas ({formatMonthName(viewingMonth)})
            </span>
            <div className="text-3xl font-black text-white font-mono-nums mt-1">
              {formatCurrency(projectionData.totalExpenses)}
            </div>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Breakdown de Categorias */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 relative z-10 text-xs">
          <div className="p-2.5 rounded-2xl bg-[#0a0d14] border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-400" />
              <span>Família</span>
            </div>
            <div className="text-xs font-bold text-blue-400 font-mono-nums mt-1">
              {formatCurrency(projectionData.familiaTotal)}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#0a0d14] border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-amber-400" />
              <span>Individual</span>
            </div>
            <div className="text-xs font-bold text-amber-400 font-mono-nums mt-1">
              {formatCurrency(projectionData.individualTotal)}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#0a0d14] border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-purple-400" />
              <span>Crédito</span>
            </div>
            <div className="text-xs font-bold text-purple-300 font-mono-nums mt-1">
              {formatCurrency(projectionData.totalCredit)}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Despesas e Contas do Mês Visualizado */}
      <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200">
            Despesas e Contas Previstas ({projectionData.allMonthExpenses.length})
          </h4>
          <span className="text-xs font-mono-nums text-slate-400">
            {formatCurrency(projectionData.totalExpenses)}
          </span>
        </div>

        {projectionData.allMonthExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Nenhuma despesa ou conta projetada para este mês.</p>
            <p className="text-[11px] text-slate-500 mt-1">Cadastre gastos fixos ou parcelamentos para visualizá-los aqui.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {projectionData.allMonthExpenses.map((exp, idx) => (
              <div
                key={exp.id || idx}
                className="p-3 rounded-2xl bg-[#0a0d14] border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2 flex-1">
                  <p className="font-semibold text-white break-words">{exp.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Vencimento dia {exp.date.split('-')[2] || '10'} · Por {exp.userId} · {exp.category} · {exp.paymentMethod} {exp.type === 'Fixo' ? '· 📌 Fixo' : ''}
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
