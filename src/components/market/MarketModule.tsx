import React, { useState } from 'react';
import { Expense, MarketPriorityItem, MarketTrip, UserName } from '../../types';
import { MarketPriorities } from './MarketPriorities';
import { MarketCalculator } from './MarketCalculator';
import { MarketHistory } from './MarketHistory';
import {
  ShoppingCart,
  ListTodo,
  Calculator,
  History,
  ArrowLeft,
  Store,
} from 'lucide-react';

interface MarketModuleProps {
  currentUser: UserName;
  marketPriorities: MarketPriorityItem[];
  marketTrips: MarketTrip[];
  expenses: Expense[];
  onUpdatePriorities: (newPriorities: MarketPriorityItem[]) => void;
  onUpdateTrips: (newTrips: MarketTrip[]) => void;
  onUpdateExpenses: (newExpenses: Expense[]) => void;
  selectedMonth: string;
  onBackToHome: () => void;
  initialSubTab?: 'calculator' | 'priorities' | 'history';
}

export const MarketModule: React.FC<MarketModuleProps> = ({
  currentUser,
  marketPriorities,
  marketTrips,
  expenses,
  onUpdatePriorities,
  onUpdateTrips,
  onUpdateExpenses,
  selectedMonth,
  onBackToHome,
  initialSubTab = 'calculator',
}) => {
  const [subTab, setSubTab] = useState<'calculator' | 'priorities' | 'history'>(initialSubTab);

  const pendingPrioritiesCount = marketPriorities.filter(
    (p) => p.month === selectedMonth && !p.isCompleted
  ).length;

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Header do Módulo Mercado */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>

        <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
          Módulo Mercado
        </span>
      </div>

      {/* Subtabs de Navegação */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#111726] rounded-2xl border border-slate-800">
        <button
          onClick={() => setSubTab('calculator')}
          className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            subTab === 'calculator'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span className="text-[11px] truncate">Calculadora</span>
        </button>

        <button
          onClick={() => setSubTab('priorities')}
          className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-1 relative cursor-pointer ${
            subTab === 'priorities'
              ? 'bg-slate-200 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span className="text-[11px] truncate">Prioridades</span>
          {pendingPrioritiesCount > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            subTab === 'history'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span className="text-[11px] truncate">Histórico</span>
        </button>
      </div>

      {/* Conteúdo da Subtab */}
      {subTab === 'calculator' && (
        <MarketCalculator
          currentUser={currentUser}
          marketTrips={marketTrips}
          expenses={expenses}
          onUpdateTrips={onUpdateTrips}
          onUpdateExpenses={onUpdateExpenses}
          selectedMonth={selectedMonth}
        />
      )}

      {subTab === 'priorities' && (
        <MarketPriorities
          currentUser={currentUser}
          priorities={marketPriorities}
          onUpdatePriorities={onUpdatePriorities}
          selectedMonth={selectedMonth}
        />
      )}

      {subTab === 'history' && (
        <MarketHistory
          currentUser={currentUser}
          marketTrips={marketTrips}
          onUpdateTrips={onUpdateTrips}
          selectedMonth={selectedMonth}
        />
      )}
    </div>
  );
};
