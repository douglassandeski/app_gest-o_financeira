import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Tag as TagIcon, 
  FileText, 
  Repeat, 
  Layers, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowRightLeft, 
  TrendingUp, 
  DollarSign 
} from 'lucide-react';
import { Account, Category, PaymentMethod, Transaction, TransactionStatus, TransactionType } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, id?: string) => void;
  editingTransaction?: Transaction | null;
  categories: Category[];
  accounts?: Account[];
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  categories,
  initialType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [status, setStatus] = useState<TransactionStatus>('paid');
  
  // Advanced features
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentTotal, setInstallmentTotal] = useState(3);
  const [installmentCurrent, setInstallmentCurrent] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');

  // Sync state with editingTransaction or reset
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmountStr(editingTransaction.amount.toString());
      setDate(editingTransaction.date);
      setCategoryId(editingTransaction.categoryId);
      setSubCategory(editingTransaction.subCategory || '');
      setAccountId(editingTransaction.accountId);
      setDestinationAccountId(editingTransaction.destinationAccountId || '');
      setPaymentMethod(editingTransaction.paymentMethod);
      setStatus(editingTransaction.status);
      setIsRecurring(!!editingTransaction.isRecurring);
      setRecurringFrequency(editingTransaction.recurringFrequency || 'monthly');
      setIsInstallment(!!editingTransaction.isInstallment);
      setInstallmentTotal(editingTransaction.installmentTotal || 3);
      setInstallmentCurrent(editingTransaction.installmentCurrent || 1);
      setTags(editingTransaction.tags || []);
      setNotes(editingTransaction.notes || '');
    } else {
      setType(initialType);
      setDescription('');
      setAmountStr('');
      setDate(new Date().toISOString().slice(0, 10));
      
      const filteredCategories = categories.filter(c => c.type === initialType || c.type === 'both');
      setCategoryId(filteredCategories[0]?.id || categories[0]?.id || '');
      setSubCategory(filteredCategories[0]?.subcategories[0] || '');
      setAccountId('principal');
      setDestinationAccountId('');
      setPaymentMethod('pix');
      setStatus('paid');
      setIsRecurring(false);
      setIsInstallment(false);
      setTags([]);
      setNotes('');
    }
  }, [editingTransaction, isOpen, initialType, categories]);

  // When category changes, auto set first subcategory
  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    const cat = categories.find(c => c.id === newCatId);
    if (cat && cat.subcategories.length > 0) {
      setSubCategory(cat.subcategories[0]);
    } else {
      setSubCategory('');
    }
  };

  // Tag helper
  const addTag = (newTag: string) => {
    const clean = newTag.trim().toLowerCase();
    if (!clean) return;
    const formatted = clean.startsWith('#') ? clean : `#${clean}`;
    if (!tags.includes(formatted)) {
      setTags([...tags, formatted]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Quick amount modifier
  const parseInputAmount = (val: string): number => {
    if (!val) return 0;
    let clean = val.trim();
    if (clean.includes('.') && clean.includes(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const addQuickAmount = (val: number) => {
    const current = parseInputAmount(amountStr);
    setAmountStr((current + val).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInputAmount(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }
    if (!description.trim()) {
      alert('Por favor, informe uma descrição para o lançamento.');
      return;
    }

    onSave(
      {
        type,
        description: description.trim(),
        amount: parsedAmount,
        date,
        categoryId: type === 'transfer' ? 'cat_outros' : categoryId,
        subCategory,
        accountId,
        destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
        paymentMethod,
        status,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        isInstallment,
        installmentCurrent: isInstallment ? installmentCurrent : undefined,
        installmentTotal: isInstallment ? installmentTotal : undefined,
        tags,
        notes: notes.trim() || undefined,
      },
      editingTransaction ? editingTransaction.id : undefined
    );
    onClose();
  };

  if (!isOpen) return null;

  const currentCategory = categories.find(c => c.id === categoryId);
  const filteredCategories = categories.filter(c => {
    if (type === 'transfer') return true;
    return c.type === type || c.type === 'both';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        id="transaction-modal-card"
        className="bg-[#0D1424] border border-[#1E293B] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#090D16]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00D2B5]/15 border border-[#00D2B5]/40 flex items-center justify-center text-[#00D2B5]">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h3>
              <p className="text-xs text-slate-400">
                Gestão detalhada com parâmetros avançados
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Type Selector (Despesa, Receita, Investimento) */}
          <div className="grid grid-cols-3 gap-2 bg-[#090D16] p-1.5 rounded-xl border border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const cat = categories.find(c => c.type === 'expense');
                if (cat) handleCategoryChange(cat.id);
              }}
              className={`py-2 px-1 text-xs rounded-lg font-bold transition-all text-center cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#F43F5E] text-white shadow-lg shadow-rose-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const cat = categories.find(c => c.type === 'income');
                if (cat) handleCategoryChange(cat.id);
              }}
              className={`py-2 px-1 text-xs rounded-lg font-bold transition-all text-center cursor-pointer ${
                type === 'income'
                  ? 'bg-[#00D2B5] text-[#090D16] shadow-lg shadow-teal-900/30 font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => {
                setType('investment');
                const cat = categories.find(c => c.id === 'cat_investimentos');
                if (cat) handleCategoryChange(cat.id);
              }}
              className={`py-2 px-1 text-xs rounded-lg font-bold transition-all text-center cursor-pointer ${
                type === 'investment'
                  ? 'bg-[#6366F1] text-white shadow-lg shadow-indigo-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Investimento
            </button>
          </div>

          {/* Amount Field with Quick Adders */}
          <div className="bg-[#090D16] border border-[#1E293B] rounded-xl p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Valor do Lançamento (R$)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-lg font-bold text-[#00D2B5]">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full bg-transparent pl-12 pr-4 py-2 text-2xl font-bold font-mono-nums text-white placeholder-slate-600 focus:outline-none focus:ring-0"
              />
            </div>
            {/* Quick add chips */}
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#1E293B]/60 text-xs">
              <span className="text-slate-500 text-[11px] mr-1">Adicionar:</span>
              {[10, 50, 100, 500].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => addQuickAmount(v)}
                  className="px-2 py-0.5 rounded bg-[#131D2E] hover:bg-[#1E2B40] text-slate-300 font-mono-nums border border-[#1E293B] transition-colors"
                >
                  +{v}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="ml-auto text-slate-500 hover:text-slate-300 text-[11px]"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Description & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descrição / Título
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Supermercado Pão de Açúcar"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00D2B5]" />
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition-colors"
              >
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subcategoria
              </label>
              {currentCategory && currentCategory.subcategories.length > 0 ? (
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition-colors"
                >
                  {currentCategory.subcategories.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Ex: Geral"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-[#090D16] border border-[#1E293B] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#00D2B5]" />
                Método de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition-colors"
              >
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="bank_transfer">Transferência / TED</option>
                <option value="cash">Dinheiro em Espécie</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00D2B5]" />
                Situação
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#090D16] p-1 rounded-xl border border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setStatus('paid')}
                  className={`py-1.5 text-xs rounded-lg font-medium transition-all ${
                    status === 'paid'
                      ? 'bg-[#00D2B5]/20 text-[#00D2B5] border border-[#00D2B5]/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Efetivado
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`py-1.5 text-xs rounded-lg font-medium transition-all ${
                    status === 'pending'
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pendente
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Accordion / Options: Parcelamento & Recorrência */}
          <div className="pt-2 border-t border-[#1E293B] space-y-3">
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-[#1E293B] text-[#00D2B5] focus:ring-0 bg-[#090D16] w-4 h-4 cursor-pointer"
                />
                <Repeat className="w-3.5 h-3.5 text-slate-400" />
                <span>Lançamento Recorrente (Fixo)</span>
              </label>

              {type === 'expense' && (
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={isInstallment}
                    onChange={(e) => setIsInstallment(e.target.checked)}
                    className="rounded border-[#1E293B] text-[#00D2B5] focus:ring-0 bg-[#090D16] w-4 h-4 cursor-pointer"
                  />
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Compra Parcelada</span>
                </label>
              )}
            </div>

            {/* Recurrence Options */}
            {isRecurring && (
              <div className="flex items-center gap-3 bg-[#090D16] p-3 rounded-xl border border-[#1E293B]">
                <span className="text-xs text-slate-400">Repetir:</span>
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as any)}
                  className="bg-[#131D2E] border border-[#1E293B] text-xs text-white rounded-lg px-2 py-1"
                >
                  <option value="monthly">Mensalmente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="yearly">Anualmente</option>
                </select>
              </div>
            )}

            {/* Installment Options */}
            {isInstallment && type === 'expense' && (
              <div className="flex items-center gap-4 bg-[#090D16] p-3 rounded-xl border border-[#1E293B] text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Parcela atual:</span>
                  <input
                    type="number"
                    min="1"
                    max={installmentTotal}
                    value={installmentCurrent}
                    onChange={(e) => setInstallmentCurrent(parseInt(e.target.value) || 1)}
                    className="w-14 bg-[#131D2E] border border-[#1E293B] rounded-lg px-2 py-1 text-center font-mono-nums text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">de:</span>
                  <select
                    value={installmentTotal}
                    onChange={(e) => setInstallmentTotal(parseInt(e.target.value))}
                    className="bg-[#131D2E] border border-[#1E293B] rounded-lg px-2 py-1 font-mono-nums text-white"
                  >
                    {[2, 3, 4, 5, 6, 8, 10, 12, 18, 24, 36, 48].map(n => (
                      <option key={n} value={n}>{n}x</option>
                    ))}
                  </select>
                </div>
                {amountStr && (
                  <span className="text-[#00D2B5] font-mono-nums ml-auto text-[11px]">
                    ≈ R$ {(parseFloat(amountStr) / installmentTotal).toFixed(2)}/mês
                  </span>
                )}
              </div>
            )}

            {/* Tags System */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-[#00D2B5]" />
                Etiquetas / Tags
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#131D2E] text-xs font-medium text-[#00D2B5] border border-[#1E293B]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar tag (ex: #trabalho, #viagem) e pressione Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  className="flex-1 bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="px-3 py-1.5 rounded-xl bg-[#131D2E] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-medium"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Notes / Observações */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Observações / Memo
              </label>
              <textarea
                rows={2}
                placeholder="Detalhes adicionais, comprovante ou observação..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none transition-colors"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-[#1E293B] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#1E293B] text-slate-300 hover:text-white hover:bg-[#131D2E] text-xs font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#00D2B5] hover:bg-[#00F0C8] text-[#090D16] text-xs font-extrabold shadow-[0_0_15px_rgba(0,210,181,0.35)] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              {editingTransaction ? 'Atualizar Lançamento' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
