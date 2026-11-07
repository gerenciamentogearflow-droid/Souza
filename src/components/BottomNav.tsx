import React from 'react';
import {
  Home,
  Wallet,
  CreditCard,
  ShoppingCart,
  User,
} from 'lucide-react';

export type MainNavTab = 'home' | 'financial' | 'bills' | 'market';

interface BottomNavProps {
  activeTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
  pendingBillsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingBillsCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0d14]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center">
        {/* Início */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Início</span>
        </button>

        {/* Financeiro */}
        <button
          onClick={() => onChangeTab('financial')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'financial'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Financeiro</span>
        </button>

        {/* Pagar */}
        <button
          onClick={() => onChangeTab('bills')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'bills'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Pagar</span>
          {pendingBillsCount > 0 && (
            <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        {/* Mercado */}
        <button
          onClick={() => onChangeTab('market')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'market'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Mercado</span>
        </button>
      </div>
    </nav>
  );
};
