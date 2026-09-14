import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Tag as TagIcon, 
  Download, 
  Calendar,
  Layers,
  Repeat
} from 'lucide-react';
import { Account, Category, Transaction, TransactionType } from '../types/finance';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '../utils/formatters';

interface TransactionsScreenProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  selectedMonth: string;
  hideValues: boolean;
  onOpenNewTransaction: (type?: TransactionType) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDuplicateTransaction: (transaction: Transaction) => void;
  onExportCSV: () => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  categories,
  accounts,
  selectedMonth,
  hideValues,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onToggleStatus,
  onDuplicateTransaction,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [allMonths, setAllMonths] = useState(false);

  // Maps for quick lookup
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  const accountMap = useMemo(() => {
    return accounts.reduce((acc, a) => {
      acc[a.id] = a;
      return acc;
    }, {} as Record<string, Account>);
  }, [accounts]);

  // Filtered list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Month check
      if (!allMonths && !t.date.startsWith(selectedMonth)) {
        return false;
      }
      // Type check
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }
      // Category check
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) {
        return false;
      }
      // Account check
      if (accountFilter !== 'all' && t.accountId !== accountFilter) {
        return false;
      }
      // Status check
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const inDesc = t.description.toLowerCase().includes(query);
        const inTags = t.tags.some(tag => tag.toLowerCase().includes(query));
        const inSub = t.subCategory?.toLowerCase().includes(query);
        const inNotes = t.notes?.toLowerCase().includes(query);
        if (!inDesc && !inTags && !inSub && !inNotes) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth, allMonths, typeFilter, categoryFilter, accountFilter, statusFilter, searchTerm]);

  // Calculate totals of current filtered set
  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredNet = filteredIncome - filteredExpense;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header with summary & New Transaction CTA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0D1424] border border-[#1E293B] rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Extrato Financeiro Detalhado</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#00D2B5]/15 text-[#00D2B5] font-mono-nums border border-[#00D2B5]/30">
              {filteredTransactions.length} registros
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Filtre, edite e gerencie cada gasto e receita com precisão
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={onExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#090D16] hover:bg-[#131D2E] text-slate-300 text-xs font-semibold border border-[#1E293B] transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Exportar</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewTransaction('expense')}
            className="px-4 py-2 rounded-xl bg-[#00D2B5] hover:bg-[#00F0C8] text-[#090D16] text-xs font-extrabold shadow-[0_0_15px_rgba(0,210,181,0.35)] transition-all flex items-center gap-1.5 ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Adicionar Lançamento</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-4 shadow-lg space-y-3">
        {/* Search Input & Month scope toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por descrição, tag (#viagem), subcategoria ou notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setAllMonths(!allMonths)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all whitespace-nowrap ${
              allMonths
                ? 'bg-[#00D2B5]/15 border-[#00D2B5]/50 text-[#00D2B5]'
                : 'bg-[#090D16] border-[#1E293B] text-slate-400 hover:text-slate-200'
            }`}
          >
            {allMonths ? 'Mostrando Todos os Meses' : 'Filtrando Mês Atual'}
          </button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1E293B]/70">
          {/* Type Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-[#090D16] border border-[#1E293B] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">Todos os Tipos</option>
              <option value="expense">Despesas</option>
              <option value="income">Receitas</option>
              <option value="investment">Investimentos</option>
              <option value="transfer">Transferências</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Categoria
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#090D16] border border-[#1E293B] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">Todas Categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Conta
            </label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full bg-[#090D16] border border-[#1E293B] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">Todas as Contas</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Situação
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#090D16] border border-[#1E293B] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">Todas Situações</option>
              <option value="paid">Efetivadas (Pagas)</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>
        </div>

        {/* Filter Results Summary Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-400 border-t border-[#1E293B]/40">
          <div className="flex items-center gap-4 font-mono-nums">
            <span>Receitas: <strong className="text-[#00D2B5]">{formatCurrency(filteredIncome, hideValues)}</strong></span>
            <span>Despesas: <strong className="text-[#F43F5E]">{formatCurrency(filteredExpense, hideValues)}</strong></span>
            <span>Saldo: <strong className={filteredNet >= 0 ? 'text-[#00D2B5]' : 'text-[#F43F5E]'}>{formatCurrency(filteredNet, hideValues)}</strong></span>
          </div>
          {(searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || accountFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setCategoryFilter('all');
                setAccountFilter('all');
                setStatusFilter('all');
              }}
              className="text-[#00D2B5] hover:underline text-[11px]"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-12 text-center text-slate-500 text-xs">
            Nenhum lançamento encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredTransactions.map(tx => {
            const cat = categoryMap[tx.categoryId];
            const acc = accountMap[tx.accountId];
            const isIncome = tx.type === 'income';
            const isExpense = tx.type === 'expense';
            const isInvestment = tx.type === 'investment';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                className="bg-[#0D1424] border border-[#1E293B] hover:border-slate-600 rounded-2xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                {/* Left info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0"
                    style={{ backgroundColor: `${cat?.color || '#334155'}20` }}
                  >
                    <CategoryIcon
                      name={cat?.icon || 'DollarSign'}
                      className="w-5 h-5"
                      color={cat?.color || '#94A3B8'}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00D2B5] transition-colors">
                        {tx.description}
                      </h4>
                      {tx.isInstallment && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#1E293B] text-slate-300 font-mono-nums">
                          <Layers className="w-2.5 h-2.5 text-slate-400" />
                          {tx.installmentCurrent}/{tx.installmentTotal}x
                        </span>
                      )}
                      {tx.isRecurring && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/40 text-[#00D2B5] border border-cyan-800/40">
                          <Repeat className="w-2.5 h-2.5" />
                          Recorrente
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="font-semibold text-slate-300">{cat?.name || 'Geral'}</span>
                      {tx.subCategory && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{tx.subCategory}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{acc?.name || 'Conta'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(tx.date)}
                      </span>
                      <span>•</span>
                      <span>{getPaymentMethodLabel(tx.paymentMethod)}</span>
                    </div>

                    {/* Tags and Notes */}
                    {(tx.tags.length > 0 || tx.notes) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {tx.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono-nums px-2 py-0.5 rounded bg-[#090D16] border border-[#1E293B] text-[#00D2B5]"
                          >
                            {tag}
                          </span>
                        ))}
                        {tx.notes && (
                          <span className="text-[11px] text-slate-500 italic max-w-xs truncate">
                            "{tx.notes}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]/60">
                  <div className="text-left sm:text-right">
                    <div
                      className={`text-base font-bold font-mono-nums ${
                        isIncome
                          ? 'text-[#00D2B5]'
                          : isExpense
                          ? 'text-[#F43F5E]'
                          : isInvestment
                          ? 'text-[#6366F1]'
                          : 'text-amber-400'
                      }`}
                    >
                      {isIncome ? '+' : isExpense ? '-' : ''}
                      {formatCurrency(tx.amount, hideValues)}
                    </div>
                    <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-500">
                      {tx.status === 'paid' ? (
                        <span className="text-[#00D2B5] font-medium flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Efetivado
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title={tx.status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                      onClick={() => onToggleStatus(tx.id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        tx.status === 'paid'
                          ? 'bg-[#00D2B5]/15 border-[#00D2B5]/40 text-[#00D2B5]'
                          : 'bg-[#090D16] border-[#1E293B] text-amber-400 hover:border-amber-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Editar Lançamento"
                      onClick={() => onEditTransaction(tx)}
                      className="p-1.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Duplicar Lançamento"
                      onClick={() => onDuplicateTransaction(tx)}
                      className="p-1.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Excluir Lançamento"
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
