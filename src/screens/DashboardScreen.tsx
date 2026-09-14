import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  Wallet, 
  Plus, 
  ChevronRight, 
  Clock, 
  PieChart,
  Calendar
} from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types/finance';
import { CentralFinancialCircle } from '../components/CentralFinancialCircle';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency, formatDate, formatMonthYear, getPaymentMethodLabel } from '../utils/formatters';

interface DashboardScreenProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: string;
  hideValues: boolean;
  onOpenNewTransaction: (type?: TransactionType) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onToggleTransactionStatus: (id: string) => void;
  onNavigateToTransactions: () => void;
  onNavigateToSpreadsheet: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  transactions,
  categories,
  selectedMonth,
  hideValues,
  onOpenNewTransaction,
  onEditTransaction,
  onToggleTransactionStatus,
  onNavigateToTransactions,
  onNavigateToSpreadsheet,
}) => {
  // Category map for fast lookup
  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  // Filter transactions for the selected month
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  // Compute month totals
  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestment = monthTransactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense - totalInvestment;

  // Global accumulated balance across all registered transactions
  const totalOverallIncome = React.useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalOverallExpense = React.useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalOverallInvestment = React.useMemo(() => {
    return transactions
      .filter(t => t.type === 'investment')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalOverallBalance = totalOverallIncome - totalOverallExpense - totalOverallInvestment;

  // Group expenses by category for the donut circle and top category list
  const expensesByCategory = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categorySlices = (Object.entries(expensesByCategory) as [string, number][])
    .map(([catId, amount]) => {
      const cat = categoryMap[catId];
      return {
        id: catId,
        name: cat?.name || 'Outros',
        value: amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        color: cat?.color || '#00D2B5',
      };
    })
    .sort((a, b) => b.value - a.value);

  // All time category slices
  const allTimeExpensesByCategory = React.useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  const allTimeCategorySlices = React.useMemo(() => {
    return (Object.entries(allTimeExpensesByCategory) as [string, number][])
      .map(([catId, amount]) => {
        const cat = categoryMap[catId];
        return {
          id: catId,
          name: cat?.name || 'Outros',
          value: amount,
          percentage: totalOverallExpense > 0 ? (amount / totalOverallExpense) * 100 : 0,
          color: cat?.color || '#00D2B5',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [allTimeExpensesByCategory, categoryMap, totalOverallExpense]);

  // Recent 6 transactions of the month
  const recentTransactions = [...monthTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0D1424] via-[#101A2E] to-[#0D1424] border border-[#1E293B] rounded-2xl p-5 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Visão Geral Financeira</span>
            <span className="text-xs font-mono-nums px-2 py-0.5 rounded-full bg-[#00D2B5]/15 text-[#00D2B5] border border-[#00D2B5]/30">
              {formatMonthYear(`${selectedMonth}-01`)}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe seu fluxo de caixa, despesas por categoria e saldo em tempo real
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onOpenNewTransaction('expense')}
            className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-[#F43F5E]/15 hover:bg-[#F43F5E]/25 border border-[#F43F5E]/40 text-[#F43F5E] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenNewTransaction('income')}
            className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-[#00D2B5]/15 hover:bg-[#00D2B5]/25 border border-[#00D2B5]/40 text-[#00D2B5] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Receita</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenNewTransaction('investment')}
            className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-[#6366F1]/15 hover:bg-[#6366F1]/25 border border-[#6366F1]/40 text-[#818CF8] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Aporte</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Circle on the left, 4 Cards + Categories on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: TradeMap Circular Financial Dial */}
        <div className="order-1 lg:col-span-5 flex">
          <CentralFinancialCircle
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            totalInvestment={totalInvestment}
            netBalance={netBalance}
            categorySlices={categorySlices}
            hideValues={hideValues}
            selectedMonthName={formatMonthYear(`${selectedMonth}-01`)}
            onOpenNewTransaction={onOpenNewTransaction}
            transactionsCount={monthTransactions.length}
            allTimeIncome={totalOverallIncome}
            allTimeExpense={totalOverallExpense}
            allTimeInvestment={totalOverallInvestment}
            allTimeCategorySlices={allTimeCategorySlices}
          />
        </div>

        {/* Right Column: Financial Description & Metrics (4 Cards) + Categories */}
        <div className="order-2 lg:col-span-7 space-y-6">
          {/* 4 Cards de Métricas - As descrições principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Saldo Disponível Geral */}
            <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-4.5 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Saldo Disponível Geral
                </span>
                <div className={`w-8 h-8 rounded-lg ${totalOverallBalance >= 0 ? 'bg-[#00D2B5]/15 border border-[#00D2B5]/30 text-[#00D2B5]' : 'bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-[#F43F5E]'} flex items-center justify-center`}>
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <span className={`text-2xl font-bold font-mono-nums tracking-tight ${totalOverallBalance >= 0 ? 'text-white' : 'text-[#F43F5E]'}`}>
                  {formatCurrency(totalOverallBalance, hideValues)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{transactions.length} lançamentos</span>
                {totalOverallInvestment > 0 && (
                  <span className="text-[#818CF8] font-mono-nums">
                    Aportes: {formatCurrency(totalOverallInvestment, hideValues)}
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: Receitas do Mês */}
            <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-4.5 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Receitas do Mês
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#00D2B5]/15 border border-[#00D2B5]/30 flex items-center justify-center text-[#00D2B5]">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold font-mono-nums text-[#00D2B5] tracking-tight">
                  {formatCurrency(totalIncome, hideValues)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <span>Período:</span>
                <span className="text-slate-300 font-medium capitalize">
                  {formatMonthYear(`${selectedMonth}-01`)}
                </span>
              </div>
            </div>

            {/* Card 3: Despesas do Mês */}
            <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-4.5 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Despesas do Mês
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#F43F5E]/15 border border-[#F43F5E]/30 flex items-center justify-center text-[#F43F5E]">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold font-mono-nums text-[#F43F5E] tracking-tight">
                  {formatCurrency(totalExpense, hideValues)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Gastos consolidados</span>
                {totalIncome > 0 && (
                  <span className="text-rose-400 font-mono-nums text-[10px]">
                    {((totalExpense / totalIncome) * 100).toFixed(0)}% da renda
                  </span>
                )}
              </div>
            </div>

            {/* Card 4: Saldo Disponível no Mês */}
            <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-4.5 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Saldo Disponível no Mês
                </span>
                <div className={`w-8 h-8 rounded-lg ${netBalance >= 0 ? 'bg-[#00D2B5]/15 border border-[#00D2B5]/30 text-[#00D2B5]' : 'bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-[#F43F5E]'} flex items-center justify-center`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <span className={`text-2xl font-bold font-mono-nums tracking-tight ${
                  netBalance >= 0 ? 'text-[#00D2B5]' : 'text-[#F43F5E]'
                }`}>
                  {netBalance > 0 ? '+' : ''}{formatCurrency(netBalance, hideValues)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Aportes: {formatCurrency(totalInvestment, hideValues)}</span>
                <span className="text-slate-300 font-semibold">
                  {netBalance >= 0 ? 'Disponível' : 'Déficit'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Spending Categories Card */}
          <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#00D2B5]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Maiores Categorias de Despesas
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono-nums">
                Total: {formatCurrency(totalExpense, hideValues)}
              </span>
            </div>

            {categorySlices.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Nenhuma despesa registrada neste período.
              </div>
            ) : (
              <div className="space-y-3.5">
                {categorySlices.slice(0, 5).map(slice => {
                  const cat = categoryMap[slice.id];
                  return (
                    <div key={slice.id} className="group">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${slice.color}20` }}
                          >
                            <CategoryIcon name={cat?.icon || 'Tag'} className="w-3.5 h-3.5" color={slice.color} />
                          </div>
                          <span className="font-semibold text-slate-200">
                            {slice.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-[11px] font-mono-nums">
                            {slice.percentage.toFixed(1)}%
                          </span>
                          <span className="font-bold font-mono-nums text-white">
                            {formatCurrency(slice.value, hideValues)}
                          </span>
                        </div>
                      </div>
                      {/* Visual progress bar */}
                      <div className="w-full h-1.5 bg-[#151E2E] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, slice.percentage)}%`,
                            backgroundColor: slice.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Quick Excel link */}
      <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00D2B5]" />
              Lançamentos Recentes do Mês
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clique em qualquer lançamento para editar ou visualizar detalhes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToSpreadsheet}
              className="px-3 py-1.5 rounded-xl bg-[#131D2E] hover:bg-[#1E2B40] text-[#00D2B5] border border-[#00D2B5]/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ver em Planilha Excel</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onNavigateToTransactions}
              className="px-3 py-1.5 rounded-xl bg-[#090D16] hover:bg-[#131D2E] text-slate-300 text-xs font-semibold border border-[#1E293B] transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Extrato Completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Nenhuma transação encontrada no período. Clique em "Despesa" ou "Receita" para cadastrar.
          </div>
        ) : (
          <div className="divide-y divide-[#1E293B]/60">
            {recentTransactions.map(tx => {
              const cat = categoryMap[tx.categoryId];
              const isIncome = tx.type === 'income';
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-[#090D16]/50 rounded-xl transition-colors group cursor-pointer"
                  onClick={() => onEditTransaction(tx)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Category Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cat?.color || '#334155'}20` }}
                    >
                      <CategoryIcon
                        name={cat?.icon || 'DollarSign'}
                        className="w-4 h-4"
                        color={cat?.color || '#94A3B8'}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-[#00D2B5] transition-colors">
                          {tx.description}
                        </span>
                        {tx.isInstallment && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1E293B] text-slate-400 font-mono-nums">
                            {tx.installmentCurrent}/{tx.installmentTotal}x
                          </span>
                        )}
                        {tx.isRecurring && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/50 text-[#00D2B5] border border-cyan-800/40">
                            Fixa
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                        <span>{cat?.name || 'Geral'}</span>
                        {tx.subCategory && (
                          <>
                            <span>•</span>
                            <span>{tx.subCategory}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span className="capitalize">{getPaymentMethodLabel(tx.paymentMethod)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Status Button */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm font-black font-mono-nums ${
                          isIncome
                            ? 'text-[#00D2B5]'
                            : isExpense
                            ? 'text-[#F43F5E]'
                            : 'text-indigo-400'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(tx.amount, hideValues)}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {tx.status === 'paid' ? 'Efetivado' : 'Pendente'}
                      </div>
                    </div>

                    <button
                      type="button"
                      title={tx.status === 'paid' ? 'Marcar como pendente' : 'Marcar como pago'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTransactionStatus(tx.id);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        tx.status === 'paid'
                          ? 'bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/60 border border-emerald-800/40'
                          : 'bg-amber-950/30 text-amber-400 hover:bg-amber-950/60 border border-amber-800/40'
                      }`}
                    >
                      {tx.status === 'paid' ? 'Pago' : 'Pendente'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
