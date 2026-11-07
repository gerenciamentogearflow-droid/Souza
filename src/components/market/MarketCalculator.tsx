import React, { useState } from 'react';
import { CartLiveItem, Expense, MarketTrip, UserName } from '../../types';
import { saveExpenses, saveMarketTrips } from '../../utils/storage';
import { formatCurrency, getTodayDateStr } from '../../utils/formatters';
import {
  Calculator,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  Store,
  Calendar,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface MarketCalculatorProps {
  currentUser: UserName;
  marketTrips: MarketTrip[];
  expenses: Expense[];
  onUpdateTrips: (newTrips: MarketTrip[]) => void;
  onUpdateExpenses: (newExpenses: Expense[]) => void;
  selectedMonth: string;
}

export const MarketCalculator: React.FC<MarketCalculatorProps> = ({
  currentUser,
  marketTrips,
  expenses,
  onUpdateTrips,
  onUpdateExpenses,
  selectedMonth,
}) => {
  const [cartItems, setCartItems] = useState<CartLiveItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [unitPriceStr, setUnitPriceStr] = useState('');
  const [quantityStr, setQuantityStr] = useState('1');

  // Modal de finalização
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [marketName, setMarketName] = useState('');
  const [tripDate, setTripDate] = useState(getTodayDateStr());
  const [syncToFinance, setSyncToFinance] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Total acumulado em tempo real
  const totalCartAmount = cartItems.reduce((acc, item) => acc + item.total, 0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrice = parseFloat(unitPriceStr.replace(',', '.'));
    if (isNaN(cleanPrice) || cleanPrice <= 0) return;

    const parsedQty = parseInt(quantityStr, 10);
    const qty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 1;
    const finalName = itemName.trim() || `Item #${cartItems.length + 1}`;

    const newItem: CartLiveItem = {
      id: `cart-${Date.now()}`,
      name: finalName,
      quantity: qty,
      unitPrice: cleanPrice,
      total: cleanPrice * qty,
    };

    setCartItems([newItem, ...cartItems]);
    setItemName('');
    setUnitPriceStr('');
    setQuantityStr('1');
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (confirm('Deseja limpar todos os itens do carrinho atual?')) {
      setCartItems([]);
    }
  };

  const handleFinalizeTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const newTrip: MarketTrip = {
      id: `trip-${Date.now()}`,
      date: tripDate,
      month: tripDate.substring(0, 7),
      supermarketName: marketName.trim() || 'Supermercado',
      totalAmount: totalCartAmount,
      items: cartItems.map((c) => ({
        name: c.name,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        total: c.total,
      })),
      syncedToFinance: syncToFinance,
      createdAt: Date.now(),
    };

    const updatedTrips = [newTrip, ...marketTrips];
    saveMarketTrips(updatedTrips);
    onUpdateTrips(updatedTrips);

    // Se marcado para sincronizar como gasto familiar no financeiro
    if (syncToFinance) {
      const newExpense: Expense = {
        id: `exp-market-${Date.now()}`,
        description: `Compras de Mercado (${newTrip.supermarketName})`,
        amount: totalCartAmount,
        date: tripDate,
        userId: currentUser,
        category: 'Família',
        type: 'Variável',
        paymentMethod: 'Débito',
        createdAt: Date.now(),
      };
      const updatedExpenses = [newExpense, ...expenses];
      saveExpenses(updatedExpenses);
      onUpdateExpenses(updatedExpenses);
    }

    setCartItems([]);
    setShowCheckoutModal(false);
    setCheckoutSuccess(true);
    setTimeout(() => setCheckoutSuccess(false), 4000);
  };

  return (
    <div className="space-y-4">
      {/* VISOR GIGANTE DO TOTAL DA COMPRA */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#162035] via-[#101726] to-[#0a0d14] border border-emerald-500/30 text-center shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <Calculator className="w-3.5 h-3.5" />
          Modo Caixa de Supermercado
        </div>

        <span className="block text-xs font-semibold text-slate-400 tracking-wider uppercase">
          TOTAL DA COMPRA
        </span>

        {/* Big font */}
        <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono-nums tracking-tight my-2">
          {formatCurrency(totalCartAmount)}
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          <span>{cartItems.length} itens no carrinho</span>
          {cartItems.length > 0 && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={handleClearCart}
                className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notificação de Sucesso */}
      {checkoutSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Compra finalizada com sucesso e salva no Histórico de Mercado!</span>
        </div>
      )}

      {/* Formulário Rápido de Adicionar Item */}
      <form
        onSubmit={handleAddItem}
        className="p-4 rounded-3xl bg-[#111726] border border-slate-800 space-y-3"
      >
        <span className="text-xs font-bold text-slate-300 block">Adicionar Item ao Carrinho</span>

        <div>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Nome do produto (ex: Leite, Sabonete, Pão)"
            className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Quantidade */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Quantidade</label>
            <div className="flex items-center bg-[#0a0d14] border border-slate-800 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  const curr = parseInt(quantityStr, 10) || 1;
                  setQuantityStr(String(Math.max(1, curr - 1)));
                }}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantityStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setQuantityStr(val);
                }}
                className="w-full text-center bg-transparent text-sm font-bold text-white font-mono-nums focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const curr = parseInt(quantityStr, 10) || 0;
                  setQuantityStr(String(curr + 1));
                }}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Valor Unitário */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Preço Unitário (R$)</label>
            <input
              type="number"
              step="0.01"
              value={unitPriceStr}
              onChange={(e) => setUnitPriceStr(e.target.value)}
              placeholder="0,00"
              className="w-full h-10 bg-[#0a0d14] border border-slate-800 rounded-xl px-3 text-sm text-white font-bold font-mono-nums placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Somar ao Carrinho</span>
        </button>
      </form>

      {/* Itens Já Adicionados ao Carrinho */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-400">Itens no Carrinho</span>
          <span className="text-xs text-slate-500 font-mono-nums">
            Subtotal: {formatCurrency(totalCartAmount)}
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#111726]/60 border border-slate-800/60">
            <ShoppingCart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Carrinho vazio</p>
            <p className="text-xs text-slate-500 mt-1">
              Adicione os itens conforme coloca no carrinho físico.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#111726] border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.quantity}x de {formatCurrency(item.unitPrice)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-emerald-400 font-mono-nums">
                    {formatCurrency(item.total)}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão de Finalizar Compra */}
      {cartItems.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Finalizar Compra ({formatCurrency(totalCartAmount)})</span>
          </button>
        </div>
      )}

      {/* Modal de Finalizar Compra */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleFinalizeTrip}
            className="bg-[#111624] border border-slate-800 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-400" />
                Salvar Compra no Histórico
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>

            <div className="text-center p-3 rounded-2xl bg-[#0a0d14] border border-slate-800">
              <span className="text-xs text-slate-400">Total a registrar</span>
              <div className="text-2xl font-black text-emerald-400 font-mono-nums">
                {formatCurrency(totalCartAmount)}
              </div>
              <span className="text-[11px] text-slate-500">{cartItems.length} itens</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Qual Supermercado?</label>
              <input
                type="text"
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
                placeholder="Ex: Carrefour, Atacadão, Assaí, Supermercado BH"
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Data da Compra</label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#0a0d14] border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={syncToFinance}
                onChange={(e) => setSyncToFinance(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span className="text-xs text-slate-300">
                Lançar automaticamente no <strong>Módulo Financeiro</strong> como{' '}
                <strong>Gasto da Família</strong>.
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Confirmar e Salvar no Histórico
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
