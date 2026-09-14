import React, { useState } from 'react';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Plane, 
  Car,
  Edit2
} from 'lucide-react';
import { Budget, Category, FinancialGoal, Transaction } from '../types/finance';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency, formatDate } from '../utils/formatters';

interface BudgetsScreenProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  goals: FinancialGoal[];
  selectedMonth: string;
  hideValues: boolean;
  onUpdateBudget: (categoryId: string, limit: number) => void;
  onUpdateGoalProgress: (goalId: string, addedAmount: number) => void;
  onAddNewGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
}

export const BudgetsScreen: React.FC<BudgetsScreenProps> = ({
  budgets,
  categories,
  transactions,
  goals,
  selectedMonth,
  hideValues,
  onUpdateBudget,
  onUpdateGoalProgress,
  onAddNewGoal,
}) => {
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editLimitVal, setEditLimitVal] = useState<string>('');

  // New goal modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalIcon, setGoalIcon] = useState('ShieldCheck');

  // Category map
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {} as Record<string, Category>);

  // Compute spent per category for the selected month
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const categorySpending = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Compute total budgeted vs total spent
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + (categorySpending[b.categoryId] || 0), 0);

  const handleSaveBudget = (catId: string) => {
    const val = parseFloat(editLimitVal);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(catId, val);
    }
    setEditingBudgetId(null);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget);
    const current = parseFloat(goalCurrent) || 0;
    if (!goalTitle.trim() || isNaN(target) || target <= 0) {
      alert('Preencha os campos da meta corretamente.');
      return;
    }
    onAddNewGoal({
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: current,
      deadline: goalDeadline || `${new Date().getFullYear()}-12-31`,
      icon: goalIcon,
      color: '#00D2B5',
      category: 'Economia',
    });
    setShowGoalModal(false);
    setGoalTitle('');
    setGoalTarget('');
    setGoalCurrent('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#00D2B5]" />
              <span>Planejamento & Tetos de Gastos</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Controle limites mensais por categoria e acompanhe suas metas patrimoniais
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#090D16] border border-[#1E293B] px-4 py-2.5 rounded-xl font-mono-nums text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Gasto sob Teto</span>
              <span className="font-bold text-white">{formatCurrency(totalBudgetSpent, hideValues)}</span>
            </div>
            <div className="w-[1px] h-6 bg-[#1E293B]" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Limite Total</span>
              <span className="font-bold text-[#00D2B5]">{formatCurrency(totalBudgeted, hideValues)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Orçamentos por Categoria */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Orçamentos das Categorias</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#131D2E] text-slate-400 font-mono-nums">
              {budgets.length} definidos
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => {
            const cat = categoryMap[b.categoryId];
            const spent = categorySpending[b.categoryId] || 0;
            const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
            const isOver = percent > 100;
            const isWarning = percent >= 80 && !isOver;

            return (
              <div
                key={b.id}
                className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-4.5 hover:border-slate-600 transition-all shadow-md relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${cat?.color || '#334155'}20` }}
                    >
                      <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" color={cat?.color || '#94A3B8'} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[130px]">
                        {cat?.name || 'Categoria'}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {percent.toFixed(0)}% utilizado
                      </span>
                    </div>
                  </div>

                  {/* Status Tag */}
                  {isOver ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/50 text-[#F43F5E] border border-rose-800/50">
                      <AlertTriangle className="w-3 h-3" /> Excedido
                    </span>
                  ) : isWarning ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/50 text-amber-400 border border-amber-800/50">
                      <AlertTriangle className="w-3 h-3" /> Atenção
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3" /> No limite
                    </span>
                  )}
                </div>

                {/* Amount Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs font-mono-nums">
                    <span className="text-white font-bold">
                      {formatCurrency(spent, hideValues)}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      de {formatCurrency(b.monthlyLimit, hideValues)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-[#090D16] rounded-full overflow-hidden border border-[#1E293B]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-[#F43F5E]'
                          : isWarning
                          ? 'bg-amber-400'
                          : 'bg-[#00D2B5]'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>

                {/* Edit limit inline */}
                <div className="mt-3 pt-2.5 border-t border-[#1E293B]/70 flex items-center justify-between text-xs">
                  {editingBudgetId === b.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="number"
                        step="50"
                        value={editLimitVal}
                        onChange={(e) => setEditLimitVal(e.target.value)}
                        placeholder="Novo limite R$"
                        className="w-full bg-[#090D16] border border-[#00D2B5] text-xs px-2 py-1 rounded text-white font-mono-nums"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveBudget(b.categoryId)}
                        className="px-2 py-1 rounded bg-[#00D2B5] text-[#090D16] font-bold text-[11px]"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[11px] text-slate-500 font-mono-nums">
                        Disponível: {formatCurrency(Math.max(0, b.monthlyLimit - spent), hideValues)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBudgetId(b.id);
                          setEditLimitVal(b.monthlyLimit.toString());
                        }}
                        className="text-slate-400 hover:text-[#00D2B5] flex items-center gap-1 text-[11px]"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Ajustar Teto</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Metas Financeiras (Goals) */}
      <div className="space-y-4 pt-4 border-t border-[#1E293B]/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00D2B5]" />
              <span>Metas & Objetivos Financeiros</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Acumulação de patrimônio e planos de médio a longo prazo
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowGoalModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#00D2B5] hover:bg-[#00F0C8] text-[#090D16] text-xs font-extrabold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nova Meta</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map(goal => {
            const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

            return (
              <div
                key={goal.id}
                className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-5 shadow-lg relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00D2B5]/15 border border-[#00D2B5]/30 text-[#00D2B5]"
                    >
                      <CategoryIcon name={goal.icon} className="w-5 h-5" color={goal.color} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{goal.title}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Prazo: {formatDate(goal.deadline)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold font-mono-nums text-[#00D2B5]">
                    {percent.toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs font-mono-nums">
                    <span className="text-white font-bold">
                      {formatCurrency(goal.currentAmount, hideValues)}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Meta: {formatCurrency(goal.targetAmount, hideValues)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#090D16] rounded-full overflow-hidden border border-[#1E293B]">
                    <div
                      className="h-full bg-gradient-to-r from-[#00D2B5] to-[#00F0C8] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>

                {/* Quick Add Funds to Goal */}
                <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Aporte rápido:</span>
                  <div className="flex gap-1.5">
                    {[100, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => onUpdateGoalProgress(goal.id, amt)}
                        className="px-2 py-0.5 rounded bg-[#090D16] border border-[#1E293B] hover:border-[#00D2B5] text-[#00D2B5] text-[10px] font-mono-nums transition-colors"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal to add new goal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Criar Nova Meta Financeira</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Título da Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reserva de Emergência, Viagem..."
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full bg-[#090D16] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Valor Alvo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="20000.00"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full bg-[#090D16] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Valor Já Guardado</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full bg-[#090D16] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Data Limite / Prazo</label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full bg-[#090D16] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#1E293B] text-slate-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00D2B5] text-[#090D16] font-bold text-xs"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
