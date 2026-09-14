import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  DollarSign 
} from 'lucide-react';
import { Category, Transaction } from '../types/finance';
import { formatCurrency, getPaymentMethodLabel } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';

interface ReportsScreenProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: string;
  hideValues: boolean;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  transactions,
  categories,
  selectedMonth,
  hideValues,
}) => {
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  // Current month transactions
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Breakdown by payment method
  const paymentMethodsBreakdown = useMemo(() => {
    const expenses = monthTransactions.filter(t => t.type === 'expense');
    const counts: Record<string, number> = {};
    expenses.forEach(t => {
      counts[t.paymentMethod] = (counts[t.paymentMethod] || 0) + t.amount;
    });
    return Object.entries(counts).map(([method, amt]) => ({
      method,
      amount: amt,
      percentage: totalExpense > 0 ? (amt / totalExpense) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, totalExpense]);

  // Breakdown by category
  const categoriesBreakdown = useMemo(() => {
    const expenses = monthTransactions.filter(t => t.type === 'expense');
    const counts: Record<string, number> = {};
    expenses.forEach(t => {
      counts[t.categoryId] = (counts[t.categoryId] || 0) + t.amount;
    });
    return Object.entries(counts).map(([catId, amt]) => ({
      category: categoryMap[catId],
      amount: amt,
      percentage: totalExpense > 0 ? (amt / totalExpense) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, totalExpense, categoryMap]);

  // Monthly timeline for the last 4 months
  const monthlyTimeline = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const ym = t.date.slice(0, 7);
      if (!map[ym]) map[ym] = { income: 0, expense: 0 };
      if (t.type === 'income') map[ym].income += t.amount;
      if (t.type === 'expense') map[ym].expense += t.amount;
    });

    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-4);
  }, [transactions]);

  // Projected upcoming fixed and installment expenses
  const upcomingCommitments = useMemo(() => {
    return transactions.filter(t => t.type === 'expense' && (t.isRecurring || t.isInstallment));
  }, [transactions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D2B5]/15 border border-[#00D2B5]/40 flex items-center justify-center text-[#00D2B5]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Relatórios & Inteligência Financeira
            </h2>
            <p className="text-xs text-slate-400">
              Métricas consolidadas de gastos, meios de pagamento e evolução patrimonial
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Evolution and Payment methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly evolution */}
        <div className="lg:col-span-7 bg-[#0D1424] border border-[#1E293B] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00D2B5]" />
              Evolução Mensal (Receitas vs Despesas)
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00D2B5]" /> Receitas
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F43F5E]" /> Despesas
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {monthlyTimeline.map(([ym, data]) => {
              const maxVal = Math.max(data.income, data.expense, 1);
              const incomeWidth = (data.income / maxVal) * 100;
              const expenseWidth = (data.expense / maxVal) * 100;

              return (
                <div key={ym} className="space-y-1.5 bg-[#090D16] p-3 rounded-xl border border-[#1E293B]">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Mês: {ym}</span>
                    <span className={`font-mono-nums ${data.income - data.expense >= 0 ? 'text-[#00D2B5]' : 'text-[#F43F5E]'}`}>
                      Resultado: {formatCurrency(data.income - data.expense, hideValues)}
                    </span>
                  </div>

                  {/* Income bar */}
                  <div className="space-y-1 text-[11px] font-mono-nums">
                    <div className="flex justify-between text-[#00D2B5]">
                      <span>Receita</span>
                      <span>{formatCurrency(data.income, hideValues)}</span>
                    </div>
                    <div className="w-full h-2 bg-[#151E2E] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00D2B5] rounded-full transition-all duration-500"
                        style={{ width: `${incomeWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* Expense bar */}
                  <div className="space-y-1 text-[11px] font-mono-nums">
                    <div className="flex justify-between text-[#F43F5E]">
                      <span>Despesa</span>
                      <span>{formatCurrency(data.expense, hideValues)}</span>
                    </div>
                    <div className="w-full h-2 bg-[#151E2E] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#F43F5E] rounded-full transition-all duration-500"
                        style={{ width: `${expenseWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment methods breakdown */}
        <div className="lg:col-span-5 bg-[#0D1424] border border-[#1E293B] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#00D2B5]" />
              Formas de Pagamento
            </h3>
            <span className="text-xs text-slate-400 font-mono-nums">
              {paymentMethodsBreakdown.length} métodos
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {paymentMethodsBreakdown.map(item => (
              <div key={item.method} className="bg-[#090D16] p-3 rounded-xl border border-[#1E293B]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200 capitalize">
                    {getPaymentMethodLabel(item.method as any)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono-nums text-[11px]">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <span className="font-bold text-white font-mono-nums">
                      {formatCurrency(item.amount, hideValues)}
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#151E2E] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00D2B5] rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Breakdown Table */}
      <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#00D2B5]" />
          Detalhamento Completo por Categoria (Período Atual)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categoriesBreakdown.map(item => (
            <div
              key={item.category?.id || 'outros'}
              className="flex items-center justify-between p-3 rounded-xl bg-[#090D16] border border-[#1E293B]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.category?.color || '#334155'}20` }}
                >
                  <CategoryIcon
                    name={item.category?.icon || 'Tag'}
                    className="w-4 h-4"
                    color={item.category?.color || '#94A3B8'}
                  />
                </div>
                <div className="truncate">
                  <span className="text-xs font-semibold text-white block truncate">
                    {item.category?.name || 'Geral'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.percentage.toFixed(1)}% do orçamento
                  </span>
                </div>
              </div>

              <div className="text-right font-mono-nums">
                <span className="text-xs font-bold text-white block">
                  {formatCurrency(item.amount, hideValues)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
