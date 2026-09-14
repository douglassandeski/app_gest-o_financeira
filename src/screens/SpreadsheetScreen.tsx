import React, { useState, useMemo } from 'react';
import { 
  Table as TableIcon, 
  Download, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowUpDown, 
  FileSpreadsheet, 
  FileDown, 
  Trash2, 
  Edit3 
} from 'lucide-react';
import { Account, Category, Transaction } from '../types/finance';
import { formatCurrency, formatDate, getPaymentMethodLabel, getTransactionTypeLabel } from '../utils/formatters';

interface SpreadsheetScreenProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  hideValues: boolean;
  onOpenNewTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onExportCSV: () => void;
}

type SortField = 'date' | 'description' | 'category' | 'account' | 'type' | 'amount' | 'status';

export const SpreadsheetScreen: React.FC<SpreadsheetScreenProps> = ({
  transactions,
  categories,
  accounts,
  hideValues,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onToggleStatus,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Maps
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

  // Filter & Sort
  const processedRows = useMemo(() => {
    return transactions
      .filter(t => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        const cat = categoryMap[t.categoryId]?.name.toLowerCase() || '';
        const acc = accountMap[t.accountId]?.name.toLowerCase() || '';
        const desc = t.description.toLowerCase();
        const sub = (t.subCategory || '').toLowerCase();
        const tags = (t.tags || []).join(' ').toLowerCase();
        return desc.includes(q) || cat.includes(q) || acc.includes(q) || sub.includes(q) || tags.includes(q);
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'date') {
          diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'description') {
          diff = a.description.localeCompare(b.description);
        } else if (sortField === 'amount') {
          diff = a.amount - b.amount;
        } else if (sortField === 'type') {
          diff = a.type.localeCompare(b.type);
        } else if (sortField === 'status') {
          diff = a.status.localeCompare(b.status);
        } else if (sortField === 'category') {
          const catA = categoryMap[a.categoryId]?.name || '';
          const catB = categoryMap[b.categoryId]?.name || '';
          diff = catA.localeCompare(catB);
        } else if (sortField === 'account') {
          const accA = accountMap[a.accountId]?.name || '';
          const accB = accountMap[b.accountId]?.name || '';
          diff = accA.localeCompare(accB);
        }
        return sortAsc ? diff : -diff;
      });
  }, [transactions, searchTerm, sortField, sortAsc, categoryMap, accountMap]);

  // Excel bottom bar metrics
  const totalRows = processedRows.length;
  const sumIncomes = processedRows
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const sumExpenses = processedRows
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSum = sumIncomes - sumExpenses;
  const avgAmount = totalRows > 0 ? (sumIncomes + sumExpenses) / totalRows : 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner styled with Excel & TradeMap fusion */}
      <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#107C41]/20 border border-[#107C41]/50 flex items-center justify-center text-[#107C41]">
            <FileSpreadsheet className="w-5 h-5 text-[#00D2B5]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Planilha Financeira - Livro Caixa</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#107C41]/20 text-[#00D2B5] font-mono-nums border border-[#107C41]/40">
                Modo Grade Excel
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Visualização tabular completa com ordenação dinâmica, atalhos de teclado e exportação CSV
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar na grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onExportCSV}
            className="px-3 py-1.5 rounded-xl bg-[#107C41]/20 hover:bg-[#107C41]/30 text-[#00D2B5] border border-[#107C41]/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Baixar arquivo compatível com Excel e Google Sheets"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Baixar .CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="px-3.5 py-1.5 rounded-xl bg-[#00D2B5] hover:bg-[#00F0C8] text-[#090D16] text-xs font-extrabold shadow-[0_0_15px_rgba(0,210,181,0.35)] flex items-center gap-1.5 transition-all ml-auto md:ml-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Inserir Linha</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Container with Excel-style column headers and grid */}
      <div className="bg-[#090D16] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[600px] relative scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header like Excel */}
            <thead className="bg-[#0D1424] sticky top-0 z-20 border-b border-[#1E293B] text-slate-300 select-none">
              <tr>
                {/* Row number column indicator */}
                <th className="w-12 py-2.5 px-3 text-center border-r border-[#1E293B] bg-[#0A0F1A] text-slate-500 font-mono-nums font-semibold">
                  #
                </th>
                
                {/* Col A: Data */}
                <th 
                  onClick={() => handleSort('date')}
                  className="py-2.5 px-3 border-r border-[#1E293B] cursor-pointer hover:bg-[#131D2E] transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>A: Data</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>

                {/* Col B: Tipo */}
                <th 
                  onClick={() => handleSort('type')}
                  className="py-2.5 px-3 border-r border-[#1E293B] cursor-pointer hover:bg-[#131D2E] transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>B: Tipo</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>

                {/* Col C: Descrição */}
                <th 
                  onClick={() => handleSort('description')}
                  className="py-2.5 px-3 border-r border-[#1E293B] cursor-pointer hover:bg-[#131D2E] transition-colors min-w-[200px]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>C: Descrição</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>

                {/* Col D: Categoria */}
                <th 
                  onClick={() => handleSort('category')}
                  className="py-2.5 px-3 border-r border-[#1E293B] cursor-pointer hover:bg-[#131D2E] transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>D: Categoria</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>

                {/* Col E: Subcategoria */}
                <th className="py-2.5 px-3 border-r border-[#1E293B]">
                  <span>E: Subcategoria</span>
                </th>

                {/* Col F: Conta */}
                <th 
                  onClick={() => handleSort('account')}
                  className="py-2.5 px-3 border-r border-[#1E293B] cursor-pointer hover:bg-[#131D2E] transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>F: Conta / Carteira</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>

                {/* Col G: Método */}
                <th className="py-2.5 px-3 border-r border-[#1E293B]">
                  <span>G: Método</span>
                </th>

                {/* Col H: Situação */}
                <th 
                  onClick={() => handleSort('status')}
                  className="py-2.5 px-3 border-r border-[#1E293B] cursor-pointer hover:bg-[#131D2E] transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>H: Situação</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>

                {/* Col I: Valor */}
                <th 
                  onClick={() => handleSort('amount')}
                  className="py-2.5 px-3 border-r border-[#1E293B] text-right cursor-pointer hover:bg-[#131D2E] transition-colors min-w-[130px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>I: Valor (R$)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>

                {/* Actions Col */}
                <th className="py-2.5 px-3 text-center w-20">
                  Ações
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#1E293B]/70 font-mono-nums">
              {processedRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 text-xs font-sans">
                    Nenhum registro encontrado na planilha.
                  </td>
                </tr>
              ) : (
                processedRows.map((tx, idx) => {
                  const cat = categoryMap[tx.categoryId];
                  const acc = accountMap[tx.accountId];
                  const isSelected = selectedRowId === tx.id;
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';
                  const isInvestment = tx.type === 'investment';

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedRowId(tx.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#00D2B5]/10 border-l-2 border-[#00D2B5]'
                          : idx % 2 === 0
                          ? 'bg-[#090D16] hover:bg-[#0F172A]'
                          : 'bg-[#0B101D] hover:bg-[#0F172A]'
                      }`}
                    >
                      {/* Row index like Excel (1, 2, 3...) */}
                      <td className="py-2 px-3 text-center border-r border-[#1E293B] text-slate-500 font-semibold bg-[#0A0F1A]/60">
                        {idx + 1}
                      </td>

                      {/* Date */}
                      <td className="py-2 px-3 border-r border-[#1E293B] whitespace-nowrap text-slate-300">
                        {formatDate(tx.date)}
                      </td>

                      {/* Type Badge */}
                      <td className="py-2 px-3 border-r border-[#1E293B] whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${
                            isIncome
                              ? 'bg-[#00D2B5]/20 text-[#00D2B5]'
                              : isExpense
                              ? 'bg-[#F43F5E]/20 text-[#F43F5E]'
                              : isInvestment
                              ? 'bg-[#6366F1]/20 text-[#6366F1]'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {getTransactionTypeLabel(tx.type)}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-2 px-3 border-r border-[#1E293B] font-sans text-white font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{tx.description}</span>
                          {tx.isInstallment && (
                            <span className="text-[10px] text-slate-400 font-mono-nums">
                              ({tx.installmentCurrent}/{tx.installmentTotal})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2 px-3 border-r border-[#1E293B] font-sans text-slate-300 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat?.color || '#94A3B8' }}
                          />
                          {cat?.name || 'Geral'}
                        </span>
                      </td>

                      {/* Subcategory */}
                      <td className="py-2 px-3 border-r border-[#1E293B] font-sans text-slate-400 whitespace-nowrap">
                        {tx.subCategory || '-'}
                      </td>

                      {/* Account */}
                      <td className="py-2 px-3 border-r border-[#1E293B] font-sans text-slate-300 whitespace-nowrap">
                        {acc?.name || 'Conta'}
                      </td>

                      {/* Method */}
                      <td className="py-2 px-3 border-r border-[#1E293B] font-sans text-slate-400 whitespace-nowrap">
                        {getPaymentMethodLabel(tx.paymentMethod)}
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3 border-r border-[#1E293B] font-sans whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatus(tx.id);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                            tx.status === 'paid'
                              ? 'bg-[#00D2B5]/15 text-[#00D2B5] border border-[#00D2B5]/30'
                              : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          {tx.status === 'paid' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Efetivado
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Pendente
                            </>
                          )}
                        </button>
                      </td>

                      {/* Amount */}
                      <td className={`py-2 px-3 border-r border-[#1E293B] text-right font-bold whitespace-nowrap ${
                        isIncome ? 'text-[#00D2B5]' : isExpense ? 'text-[#F43F5E]' : 'text-[#6366F1]'
                      }`}>
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(tx.amount, hideValues)}
                      </td>

                      {/* Row Action buttons */}
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTransaction(tx);
                            }}
                            title="Editar Linha"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1E293B]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTransaction(tx.id);
                            }}
                            title="Excluir Linha"
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Excel Bottom Status Bar (Soma, Média, Contagem) */}
        <div className="bg-[#0A0F1A] border-t border-[#1E293B] px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-nums text-slate-400 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D2B5]" />
            <span className="font-sans text-[11px] text-slate-300">Pronto</span>
            <span className="text-slate-600">|</span>
            <span>CONTAGEM: <strong className="text-white">{totalRows}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>MÉDIA: <strong className="text-slate-200">{formatCurrency(avgAmount, hideValues)}</strong></span>
            <span>RECEITAS: <strong className="text-[#00D2B5]">{formatCurrency(sumIncomes, hideValues)}</strong></span>
            <span>DESPESAS: <strong className="text-[#F43F5E]">{formatCurrency(sumExpenses, hideValues)}</strong></span>
            <span>
              SALDO LÍQUIDO:{' '}
              <strong className={netSum >= 0 ? 'text-[#00D2B5]' : 'text-[#F43F5E]'}>
                {formatCurrency(netSum, hideValues)}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
