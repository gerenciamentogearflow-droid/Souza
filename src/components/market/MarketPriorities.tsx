import React, { useState } from 'react';
import { MarketPriorityItem, UserName } from '../../types';
import { saveMarketPriorities } from '../../utils/storage';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ListTodo,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface MarketPrioritiesProps {
  currentUser: UserName;
  priorities: MarketPriorityItem[];
  onUpdatePriorities: (newItems: MarketPriorityItem[]) => void;
  selectedMonth: string;
}

export const MarketPriorities: React.FC<MarketPrioritiesProps> = ({
  currentUser,
  priorities,
  onUpdatePriorities,
  selectedMonth,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mercearia');
  const [quantity, setQuantity] = useState('');

  // Itens do mês atual
  const monthItems = priorities.filter((p) => p.month === selectedMonth);
  const completedCount = monthItems.filter((p) => p.isCompleted).length;
  const progressPct = monthItems.length > 0 ? (completedCount / monthItems.length) * 100 : 0;

  const handleToggle = (id: string) => {
    const updated = priorities.map((p) => (p.id === id ? { ...p, isCompleted: !p.isCompleted } : p));
    saveMarketPriorities(updated);
    onUpdatePriorities(updated);
  };

  const handleDelete = (id: string) => {
    const updated = priorities.filter((p) => p.id !== id);
    saveMarketPriorities(updated);
    onUpdatePriorities(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: MarketPriorityItem = {
      id: `prio-${Date.now()}`,
      name: name.trim(),
      category,
      quantity: quantity.trim() || undefined,
      isCompleted: false,
      addedBy: currentUser,
      month: selectedMonth,
    };

    const updated = [newItem, ...priorities];
    saveMarketPriorities(updated);
    onUpdatePriorities(updated);

    setName('');
    setQuantity('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Progresso de Prioridades */}
      <div className="p-4 rounded-3xl bg-[#111726] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Prioridades do Mês</span>
            <div className="text-xl font-black text-white mt-0.5">
              {completedCount} de {monthItems.length} itens garantidos
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-10 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Formulário de Adicionar */}
      {showAddForm && (
        <form
          onSubmit={handleAddItem}
          className="p-4 rounded-3xl bg-[#131b2e] border border-emerald-500/30 space-y-3 shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white">Nova Prioridade de Compras</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fechar
            </button>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Item Essencial</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Arroz 5kg, Azeite, Peito de frango"
              className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Quantidade Estimada</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ex: 2 un, 3 kg, 1 fardo"
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Mercearia">Mercearia / Básicos</option>
                <option value="Açougue">Açougue e Frios</option>
                <option value="Hortifrúti">Hortifrúti e Feira</option>
                <option value="Laticínios">Laticínios</option>
                <option value="Limpeza">Limpeza da Casa</option>
                <option value="Higiene">Higiene Pessoal</option>
                <option value="Bebidas">Bebidas</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
          >
            Salvar Item na Lista
          </button>
        </form>
      )}

      {/* Lista com Checkboxes Interativos */}
      <div className="space-y-2">
        {monthItems.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#111726]/60 border border-slate-800/60">
            <ListTodo className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Lista vazia para este mês</p>
            <p className="text-xs text-slate-500 mt-1">
              Cadastre o que a família precisa comprar antes de sair de casa.
            </p>
          </div>
        ) : (
          monthItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                item.isCompleted
                  ? 'bg-[#0d131f] border-emerald-500/20 opacity-70'
                  : 'bg-[#111726] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    item.isCompleted
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-[#0a0d14] border border-slate-700 text-transparent'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                </button>

                <div className="min-w-0">
                  <span
                    className={`text-sm font-semibold block truncate ${
                      item.isCompleted ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>{item.category}</span>
                    {item.quantity && (
                      <>
                        <span>·</span>
                        <span className="text-slate-300 font-medium">{item.quantity}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>Adicionado por {item.addedBy}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                className="p-1.5 text-slate-600 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
