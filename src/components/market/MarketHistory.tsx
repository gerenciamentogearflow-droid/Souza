import React, { useState } from 'react';
import { MarketTrip, UserName } from '../../types';
import { saveMarketTrips } from '../../utils/storage';
import { formatCurrency, formatDateBR, formatMonthName } from '../../utils/formatters';
import {
  TrendingUp,
  Store,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Receipt,
  ShoppingCart,
} from 'lucide-react';

interface MarketHistoryProps {
  currentUser: UserName;
  marketTrips: MarketTrip[];
  onUpdateTrips: (newTrips: MarketTrip[]) => void;
  selectedMonth: string;
}

export const MarketHistory: React.FC<MarketHistoryProps> = ({
  currentUser,
  marketTrips,
  onUpdateTrips,
  selectedMonth,
}) => {
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  // Agrupamento por mês para comparativo
  const monthlyTotals: Record<string, number> = {};
  marketTrips.forEach((trip) => {
    const m = trip.month || trip.date.substring(0, 7);
    monthlyTotals[m] = (monthlyTotals[m] || 0) + trip.totalAmount;
  });

  // Ordena os meses de forma cronológica
  const sortedMonths = Object.keys(monthlyTotals).sort();
  const maxMonthVal = Math.max(...Object.values(monthlyTotals), 1);

  // Trips do mês selecionado
  const currentMonthTrips = marketTrips.filter(
    (t) => (t.month || t.date.substring(0, 7)) === selectedMonth
  );
  const totalCurrentMonth = currentMonthTrips.reduce((acc, t) => acc + t.totalAmount, 0);

  const handleDeleteTrip = (id: string) => {
    if (confirm('Deseja excluir esta compra do histórico de mercado?')) {
      const updated = marketTrips.filter((t) => t.id !== id);
      saveMarketTrips(updated);
      onUpdateTrips(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner de Resumo de Mercado */}
      <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total em Mercado ({selectedMonth})</span>
            <div className="text-2xl font-black text-white font-mono-nums">
              {formatCurrency(totalCurrentMonth)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Store className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          {currentMonthTrips.length} compra{currentMonthTrips.length === 1 ? '' : 's'} registradas neste mês
        </p>
      </div>

      {/* Gráfico Comparativo Mensal */}
      <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Comparativo Mensal de Mercado
          </span>
          <span className="text-[11px] text-slate-500">Evolução de Gastos</span>
        </div>

        {sortedMonths.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">Nenhum dado mensal ainda.</p>
        ) : (
          <div className="space-y-2 pt-1">
            {sortedMonths.map((m) => {
              const amount = monthlyTotals[m] || 0;
              const barPct = (amount / maxMonthVal) * 100;
              const isSelected = m === selectedMonth;

              return (
                <div key={m} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold capitalize ${
                        isSelected ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {formatMonthName(m)}
                    </span>
                    <span className="font-mono-nums font-bold text-white">
                      {formatCurrency(amount)}
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-[#0a0d14] p-0.5 border border-slate-800/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.max(barPct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista Detalhada de Compras */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-slate-400 px-1">
          Histórico de Compras Realizadas ({marketTrips.length})
        </h4>

        {marketTrips.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#111726]/60 border border-slate-800/60">
            <ShoppingCart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Nenhuma compra salva</p>
            <p className="text-xs text-slate-500 mt-1">
              Use a aba "Calculadora" e finalize sua ida ao mercado para salvar aqui.
            </p>
          </div>
        ) : (
          marketTrips.map((trip) => {
            const isExpanded = expandedTripId === trip.id;

            return (
              <div
                key={trip.id}
                className="rounded-3xl bg-[#111726] border border-slate-800 overflow-hidden transition-all hover:border-slate-700"
              >
                {/* Trip Header */}
                <div
                  onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h5 className="text-sm font-bold text-white truncate">
                        {trip.supermarketName}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{formatDateBR(trip.date)}</span>
                        <span>·</span>
                        <span>{trip.items.length} itens</span>
                        {trip.syncedToFinance && (
                          <>
                            <span>·</span>
                            <span className="text-blue-400">Gasto da Família</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-black text-emerald-400 font-mono-nums">
                      {formatCurrency(trip.totalAmount)}
                    </span>
                    <button
                      type="button"
                      className="p-1 text-slate-500 hover:text-slate-300"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Detalhes Expansíveis dos Itens da Compra */}
                {isExpanded && (
                  <div className="p-4 pt-1 border-t border-slate-800/80 bg-[#0a0d14]/70 space-y-2 animate-fade-in">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Itens discriminados:
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {trip.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-900/60"
                        >
                          <span className="text-slate-300">
                            {it.name} <span className="text-slate-500">({it.quantity}x)</span>
                          </span>
                          <span className="font-mono-nums font-semibold text-slate-200">
                            {formatCurrency(it.total)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Compra</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
