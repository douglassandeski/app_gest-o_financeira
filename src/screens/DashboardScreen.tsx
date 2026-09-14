import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  Wallet, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Building2,
  PieChart,
  Calendar,
  Edit2
} from 'lucide-react';
import { Account, Category, Transaction, TransactionType } from '../types/finance';
import { CentralFinancialCircle } from '../components/CentralFinancialCircle';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency, formatDate, formatMonthYear, getPaymentMethodLabel } from '../utils/formatters';

interface DashboardScreenProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  selectedMonth: string;
  hideValues: boolean;
  onOpenNewTransaction: (type?: TransactionType) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onToggleTransactionStatus: (id: string) => void;
  onNavigateToTransactions: () => void;
  onNavigateToSpreadsheet: () => void;
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  transactions,
  categories,
  accounts,
  selectedMonth,
  hideValues,
  onOpenNewTransaction,
  onEditTransaction,
  onToggleTransactionStatus,
  onNavigateToTransactions,
  onNavigateToSpreadsheet,
  onAddAccount,
  onEditAccount,
}) => {
  // Category map for fast lookup
  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  // Account map for fast lookup
  const accountMap = React.useMemo(() => {
    return accounts.reduce((acc, a) => {
      acc[a.id] = a;
      return acc;
    }, {} as Record<string, Account>);
  }, [accounts]);

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

  const netBalance = totalIncome - totalExpense;

  // Global total balance in accounts
  const totalAccountsBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

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
        value: Number(amount),
        color: cat?.color || '#94A3B8',
        percentage: totalExpense > 0 ? (Number(amount) / totalExpense) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Recent 6 transactions
  const recentTransactions = [...monthTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-12 flex flex-col">
      {/* Top Hero Grid: Pie Chart / Central Circle FIRST on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: The Central Financial Circle Widget (Gráfico de Pizza) */}
        <div className="order-1 lg:col-span-5 space-y-4">
          <CentralFinancialCircle
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            totalInvestment={totalInvestment}
            netBalance={netBalance}
            categorySlices={categorySlices}
            hideValues={hideValues}
            selectedMonthName={formatMonthYear(`${selectedMonth}-01`)}
          />

          {/* Quick Action Shortcut Card */}
          <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenNewTransaction('expense')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#131D2E] hover:bg-[#1C283F] border border-[#1E293B] hover:border-[#F43F5E]/40 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 group"
            >
              <div className="w-5 h-5 rounded-md bg-[#F43F5E]/20 text-[#F43F5E] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <span>+ Adicionar Despesa</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenNewTransaction('income')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#131D2E] hover:bg-[#1C283F] border border-[#1E293B] hover:border-[#00D2B5]/40 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 group"
            >
              <div className="w-5 h-5 rounded-md bg-[#00D2B5]/20 text-[#00D2B5] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
              <span>+ Adicionar Receita</span>
            </button>
          </div>
        </div>

        {/* Right Column: Financial Description & Metrics (4 Cards) + Categories */}
        <div className="order-2 lg:col-span-7 space-y-6">
          {/* 4 Cards de Métricas - As descrições principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Saldo Global em Contas */}
            <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-4.5 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Patrimônio em Contas
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#00D2B5]/15 border border-[#00D2B5]/30 flex items-center justify-center text-[#00D2B5]">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold font-mono-nums text-white tracking-tight">
                  {formatCurrency(totalAccountsBalance, hideValues)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="text-[#00D2B5] font-semibold">{accounts.length} contas</span>
                <span>sincronizadas e ativas</span>
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

            {/* Card 4: Balanço Líquido Mensal */}
            <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-4.5 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Economia / Superávit
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1]">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <span className={`text-2xl font-bold font-mono-nums tracking-tight ${
                  netBalance >= 0 ? 'text-[#00D2B5]' : 'text-[#F43F5E]'
                }`}>
                  {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance, hideValues)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Aportes: {formatCurrency(totalInvestment, hideValues)}</span>
                <span className="text-slate-300 font-semibold">
                  {netBalance >= 0 ? 'No azul' : 'Atenção'}
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

          {/* Connected Accounts & Cards */}
          <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00D2B5]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Contas & Carteiras
                </h3>
              </div>
              <button
                type="button"
                onClick={onAddAccount}
                className="py-1 px-2.5 rounded-lg bg-[#00D2B5]/15 hover:bg-[#00D2B5]/25 border border-[#00D2B5]/40 text-[#00D2B5] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Adicionar Conta</span>
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className="py-7 px-4 text-center border border-dashed border-[#1E293B] hover:border-[#00D2B5]/50 rounded-xl bg-[#090D16]/50 transition-colors flex flex-col items-center justify-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#00D2B5]/10 border border-[#00D2B5]/30 flex items-center justify-center text-[#00D2B5]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Nenhuma conta cadastrada ainda</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">
                    Adicione suas instituições (ex: Sicredi, Nubank, Itaú, Dinheiro) com o saldo real que você possui nelas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onAddAccount}
                  className="mt-1 py-2 px-4 rounded-xl bg-[#00D2B5] hover:bg-[#00F0C8] text-[#090D16] text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Cadastrar Minha Primeira Conta</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {accounts.map(acc => (
                  <div
                    key={acc.id}
                    onClick={() => onEditAccount(acc)}
                    className="bg-[#090D16] border border-[#1E293B] rounded-xl p-3.5 hover:border-[#00D2B5]/60 hover:bg-[#0F1626] transition-all relative overflow-hidden group cursor-pointer"
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-1"
                      style={{ backgroundColor: acc.color }}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 truncate pr-2 group-hover:text-[#00D2B5] transition-colors">
                        {acc.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-[#131D2E] px-1.5 py-0.5 rounded border border-[#1E293B]">
                          {acc.institution}
                        </span>
                        <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-[#00D2B5] transition-colors" />
                      </div>
                    </div>
                    <div className="mt-2 text-sm font-black font-mono-nums text-white">
                      {formatCurrency(acc.balance, hideValues)}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400 truncate">
                      {acc.accountNumber || (acc.type === 'credit' ? 'Cartão de Crédito' : acc.type === 'wallet' ? 'Dinheiro / Carteira' : 'Conta Corrente')}
                    </div>
                  </div>
                ))}

                {/* Quick Add Card button */}
                <button
                  type="button"
                  onClick={onAddAccount}
                  className="bg-[#090D16]/60 border border-dashed border-[#1E293B] hover:border-[#00D2B5]/50 hover:bg-[#0F1626] rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1 transition-all group cursor-pointer min-h-[85px]"
                >
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#00D2B5] transition-colors" />
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                    + Adicionar Conta
                  </span>
                </button>
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
              Clique em qualquer lançamento para editar ou no ícone para marcar como pago
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToSpreadsheet}
              className="px-3 py-1.5 rounded-xl bg-[#131D2E] hover:bg-[#1E2B40] text-[#00D2B5] border border-[#00D2B5]/30 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <span>Ver em Planilha Excel</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onNavigateToTransactions}
              className="px-3 py-1.5 rounded-xl bg-[#090D16] hover:bg-[#131D2E] text-slate-300 text-xs font-semibold border border-[#1E293B] transition-all flex items-center gap-1"
            >
              <span>Ver Extrato Completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Nenhuma transação encontrada no período. Clique em "Novo Lançamento" para cadastrar.
          </div>
        ) : (
          <div className="divide-y divide-[#1E293B]/60">
            {recentTransactions.map(tx => {
              const cat = categoryMap[tx.categoryId];
              const acc = accountMap[tx.accountId];
              const isIncome = tx.type === 'income';
              const isExpense = tx.type === 'expense';
              const isInvestment = tx.type === 'investment';

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
                        <span>•</span>
                        <span>{acc?.name || 'Conta'}</span>
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
                        className={`text-xs sm:text-sm font-bold font-mono-nums ${
                          isIncome
                            ? 'text-[#00D2B5]'
                            : isExpense
                            ? 'text-[#F43F5E]'
                            : 'text-[#6366F1]'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(tx.amount, hideValues)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {tx.status === 'paid' ? 'Efetivado' : 'Pendente'}
                      </div>
                    </div>

                    <button
                      type="button"
                      title={tx.status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTransactionStatus(tx.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-all ${
                        tx.status === 'paid'
                          ? 'bg-[#00D2B5]/15 border-[#00D2B5]/40 text-[#00D2B5]'
                          : 'bg-[#090D16] border-[#1E293B] text-amber-400 hover:border-amber-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
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
