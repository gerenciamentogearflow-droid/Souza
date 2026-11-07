import React, { useState } from 'react';
import { Bill, Expense, Income, UserName } from '../../types';
import { SummaryDashboard } from './SummaryDashboard';
import { IncomeManager } from './IncomeManager';
import { ExpenseManager } from './ExpenseManager';
import { BillsPaymentArea } from './BillsPaymentArea';
import { FutureProjections } from './FutureProjections';
import {
  PieChart,
  TrendingUp,
  Receipt,
  CreditCard,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface FinancialModuleProps {
  currentUser: UserName;
  expenses: Expense[];
  bills: Bill[];
  incomes: Income[];
  onUpdateExpenses: (newExpenses: Expense[]) => void;
  onUpdateBills: (newBills: Bill[]) => void;
  onUpdateIncomes: (newIncomes: Income[]) => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onBackToHome: () => void;
  initialSubTab?: 'summary' | 'incomes' | 'expenses' | 'bills' | 'projection';
}

export const FinancialModule: React.FC<FinancialModuleProps> = ({
  currentUser,
  expenses,
  bills,
  incomes,
  onUpdateExpenses,
  onUpdateBills,
  onUpdateIncomes,
  selectedMonth,
  onSelectMonth,
  onBackToHome,
  initialSubTab = 'summary',
}) => {
  const [subTab, setSubTab] = useState<'summary' | 'incomes' | 'expenses' | 'bills' | 'projection'>(initialSubTab);

  const pendingBillsCount = bills.filter((b) => !b.isPaid).length;

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Header do Módulo Financeiro */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>

        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Módulo Financeiro
        </span>
      </div>

      {/* Navegação por Subtabs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-[#111726] rounded-2xl border border-slate-800">
        <button
          onClick={() => setSubTab('summary')}
          className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            subTab === 'summary'
              ? 'bg-slate-200 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span className="text-[10px] truncate">Resumo</span>
        </button>

        <button
          onClick={() => setSubTab('expenses')}
          className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            subTab === 'expenses'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span className="text-[10px] truncate">Gastos</span>
        </button>

        <button
          onClick={() => setSubTab('bills')}
          className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-1 relative cursor-pointer ${
            subTab === 'bills'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span className="text-[10px] truncate">Pagar</span>
          {pendingBillsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setSubTab('projection')}
          className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            subTab === 'projection'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[10px] truncate">Futuro</span>
        </button>

        <button
          onClick={() => setSubTab('incomes')}
          className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            subTab === 'incomes'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[10px] truncate">Renda</span>
        </button>
      </div>

      {/* Conteúdo das Subtabs */}
      {subTab === 'summary' && (
        <SummaryDashboard
          currentUser={currentUser}
          expenses={expenses}
          bills={bills}
          incomes={incomes}
          selectedMonth={selectedMonth}
          onSelectMonth={onSelectMonth}
        />
      )}

      {subTab === 'expenses' && (
        <ExpenseManager
          currentUser={currentUser}
          expenses={expenses}
          bills={bills}
          incomes={incomes}
          onUpdateExpenses={onUpdateExpenses}
          onUpdateBills={onUpdateBills}
          selectedMonth={selectedMonth}
        />
      )}

      {subTab === 'bills' && (
        <BillsPaymentArea
          currentUser={currentUser}
          bills={bills}
          onUpdateBills={onUpdateBills}
          selectedMonth={selectedMonth}
        />
      )}

      {subTab === 'projection' && (
        <FutureProjections
          currentUser={currentUser}
          expenses={expenses}
          bills={bills}
          incomes={incomes}
          selectedMonth={selectedMonth}
          onSelectMonth={onSelectMonth}
        />
      )}

      {subTab === 'incomes' && (
        <IncomeManager
          currentUser={currentUser}
          incomes={incomes}
          onUpdateIncomes={onUpdateIncomes}
          selectedMonth={selectedMonth}
        />
      )}
    </div>
  );
};
