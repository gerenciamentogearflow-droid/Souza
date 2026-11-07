import React from 'react';
import { Bill, Expense, Income, MarketPriorityItem, MarketTrip, UserName } from '../types';
import { FIXED_USERS, filterIncomesByPrivacy } from '../utils/storage';
import { formatCurrency, formatMonthName, getCurrentMonthStr } from '../utils/formatters';
import {
  Wallet,
  ShoppingCart,
  TrendingDown,
  ArrowUpRight,
  Calculator,
  ListTodo,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface HomeScreenProps {
  currentUser: UserName;
  expenses: Expense[];
  bills: Bill[];
  incomes: Income[];
  marketPriorities: MarketPriorityItem[];
  marketTrips: MarketTrip[];
  selectedMonth: string;
  onNavigateToFinancial: (subTab?: 'summary' | 'incomes' | 'expenses' | 'bills') => void;
  onNavigateToMarket: (subTab?: 'calculator' | 'priorities' | 'history') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  expenses,
  bills,
  incomes,
  marketPriorities,
  marketTrips,
  selectedMonth,
  onNavigateToFinancial,
  onNavigateToMarket,
}) => {
  const userProfile = FIXED_USERS[currentUser];

  // Cálculos do mês
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const totalGasto = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

  const pendingBills = bills.filter((b) => !b.isPaid);
  const totalPending = pendingBills.reduce((acc, b) => acc + b.amount, 0);

  // Recebimentos com privacidade
  const visibleIncomes = filterIncomesByPrivacy(incomes, currentUser);
  const monthIncomes = visibleIncomes.filter((i) => i.date.startsWith(selectedMonth));
  const totalRecebido = monthIncomes.reduce((acc, i) => acc + i.amount, 0);

  // Mercado
  const pendingPriorities = marketPriorities.filter(
    (p) => p.month === selectedMonth && !p.isCompleted
  );
  const currentMonthTrips = marketTrips.filter(
    (t) => (t.month || t.date.substring(0, 7)) === selectedMonth
  );
  const totalMarketMonth = currentMonthTrips.reduce((acc, t) => acc + t.totalAmount, 0);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Saudação do Usuário */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs text-slate-400 font-medium">Painel Familiar Souza</span>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            Olá, {currentUser}
            <span className="text-emerald-400">·</span>
          </h2>
          <p className="text-[11px] text-slate-500 capitalize">{formatMonthName(selectedMonth)}</p>
        </div>

        <div
          className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${userProfile.avatarColor} flex items-center justify-center font-black text-white text-base shadow-lg shadow-black/40 border border-white/10`}
        >
          {currentUser[0]}
        </div>
      </div>

      {/* 2 BOTÕES GRANDES PRINCIPAIS: FINANCEIRO E MERCADO */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Acesso Principal
        </h3>

        {/* 1. BOTÃO GRANDE: MÓDULO FINANCEIRO */}
        <button
          type="button"
          onClick={() => onNavigateToFinancial('summary')}
          className="w-full text-left p-6 rounded-3xl bg-gradient-to-br from-[#162238] via-[#111827] to-[#0c101b] border border-blue-500/30 hover:border-blue-400/60 shadow-2xl shadow-blue-950/30 active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden group"
        >
          {/* Subtle neon glow back */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md group-hover:scale-105 transition-transform">
              <Wallet className="w-7 h-7" />
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
              <span>Abrir Módulo</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-5 relative z-10">
            <h4 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              FINANCEIRO
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Controle de receitas, despesas e contas a pagar
            </p>
          </div>

          {/* Quick Metrics Inside the Financial Button */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 relative z-10 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Despesas do Mês</span>
              <span className="text-base font-extrabold text-rose-400 font-mono-nums">
                {formatCurrency(totalGasto)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Contas Pendentes</span>
              <span className="text-base font-extrabold text-amber-400 font-mono-nums">
                {formatCurrency(totalPending)}
              </span>
            </div>
          </div>
        </button>

        {/* 2. BOTÃO GRANDE: MÓDULO MERCADO */}
        <button
          type="button"
          onClick={() => onNavigateToMarket('calculator')}
          className="w-full text-left p-6 rounded-3xl bg-gradient-to-br from-[#122e2b] via-[#0d211e] to-[#0a1514] border border-emerald-500/40 hover:border-emerald-400/70 shadow-2xl shadow-emerald-950/30 active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden group"
        >
          {/* Subtle neon glow back */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-7 h-7" />
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span>Modo Mercado</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-5 relative z-10">
            <h4 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              MERCADO
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Calculadora ao vivo no carrinho, lista de prioridades e histórico
            </p>
          </div>

          {/* Quick Metrics Inside the Market Button */}
          <div className="mt-5 pt-4 border-t border-emerald-900/40 grid grid-cols-2 gap-3 relative z-10 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Gasto em Supermercado</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono-nums">
                {formatCurrency(totalMarketMonth)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Prioridades Pendentes</span>
              <span className="text-base font-extrabold text-slate-200">
                {pendingPriorities.length} itens a comprar
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Atalhos Rápidos */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Ações Rápidas
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigateToFinancial('bills')}
            className="p-3.5 rounded-2xl bg-[#111726] border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <CreditCard className="w-5 h-5" />
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
            <div className="font-bold text-sm text-white">Área Pagar</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {pendingBills.length} contas / parcelamentos
            </div>
          </button>

          <button
            onClick={() => onNavigateToMarket('priorities')}
            className="p-3.5 rounded-2xl bg-[#111726] border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <ListTodo className="w-5 h-5" />
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
            <div className="font-bold text-sm text-white">Prioridades</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {pendingPriorities.length} essenciais pendentes
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
