import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  X, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  Check, 
  Trash2,
  DollarSign
} from 'lucide-react';
import { Account, AccountType } from '../types/finance';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: Omit<Account, 'id'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  editingAccount?: Account | null;
}

const COMMON_INSTITUTIONS = [
  'Sicredi',
  'Nubank',
  'Banco do Brasil',
  'Itaú',
  'Bradesco',
  'Caixa',
  'Santander',
  'Inter',
  'C6 Bank',
  'XP Investimentos',
  'BTG Pactual',
  'Dinheiro / Carteira',
  'Outra Instituição'
];

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: any }[] = [
  { type: 'checking', label: 'Conta Corrente', icon: Building2 },
  { type: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
  { type: 'wallet', label: 'Carteira Física', icon: Wallet },
  { type: 'investment', label: 'Investimentos', icon: TrendingUp },
];

const COLOR_OPTIONS = [
  '#00D2B5', // TradeMap Teal
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8A05BE', // Purple (Nubank)
  '#EC7000', // Orange (Itaú)
  '#EF4444', // Red (Bradesco / Santander)
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#64748B', // Slate
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingAccount,
}) => {
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('Sicredi');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState<number>(0);
  const [color, setColor] = useState('#00D2B5');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setInstitution(editingAccount.institution);
      setType(editingAccount.type);
      setBalance(editingAccount.balance);
      setColor(editingAccount.color);
      setAccountNumber(editingAccount.accountNumber || '');
    } else {
      setName('');
      setInstitution('Sicredi');
      setType('checking');
      setBalance(0);
      setColor('#00D2B5');
      setAccountNumber('');
    }
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        institution: institution.trim() || 'Minha Conta',
        type,
        balance: Number(balance) || 0,
        color,
        icon: type === 'credit' ? 'CreditCard' : type === 'wallet' ? 'Wallet' : type === 'investment' ? 'TrendingUp' : 'Building2',
        accountNumber: accountNumber.trim() || undefined,
      },
      editingAccount?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0D1424] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center border"
            style={{ backgroundColor: `${color}20`, borderColor: `${color}50` }}
          >
            <Building2 className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {editingAccount ? 'Editar Conta / Carteira' : 'Nova Conta ou Carteira'}
            </h3>
            <p className="text-xs text-slate-400">
              Cadastre suas instituições bancárias ou carteira
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Name */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Nome da Conta / Identificação *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Sicredi Conta Corrente, Carteira, Nubank"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
            />
          </div>

          {/* Institution / Bank */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Instituição Financeira / Banco
            </label>
            <input
              type="text"
              list="institutions-list"
              placeholder="Ex: Sicredi, Nubank, Itaú, Dinheiro..."
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
            />
            <datalist id="institutions-list">
              {COMMON_INSTITUTIONS.map((inst) => (
                <option key={inst} value={inst} />
              ))}
            </datalist>
          </div>

          {/* Account Type */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Tipo de Conta
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNT_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setType(t.type)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all text-left ${
                      isSelected
                        ? 'bg-[#131D2E] border-[#00D2B5] text-[#00D2B5]'
                        : 'bg-[#090D16] border-[#1E293B] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Saldo Inicial (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={balance === 0 ? '' : balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-600 outline-none font-mono-nums transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Pode ser 0,00 ou o saldo que você tem atualmente nesta conta.
            </p>
          </div>

          {/* Color Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Cor de Destaque
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 flex-shrink-0"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Details */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Observação / Agência (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Agência 0718 / C/C 12345"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#00D2B5] rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#1E293B]">
            {editingAccount && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Deseja excluir a conta "${editingAccount.name}"?`)) {
                    onDelete(editingAccount.id);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl border border-rose-900/50 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Excluir Conta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#1E293B] text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#00D2B5] hover:bg-[#00F0C8] text-[#090D16] text-xs font-extrabold shadow-md transition-all active:scale-98"
            >
              {editingAccount ? 'Salvar Alterações' : 'Adicionar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
