import { PaymentMethod, TransactionType } from '../types/finance';

export const formatCurrency = (value: number, hideValues = false): string => {
  if (hideValues) return '••••••';
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(num);
};

export const formatCompactCurrency = (value: number, hideValues = false): string => {
  if (hideValues) return '••••';
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  if (Math.abs(num) >= 1000000) {
    return `R$ ${(num / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1000) {
    return `R$ ${(num / 1000).toFixed(1)}k`;
  }
  return formatCurrency(num, hideValues);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const formatMonthYear = (dateStr: string): string => {
  const [year, month] = dateStr.split('-');
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthIdx = parseInt(month, 10) - 1;
  return `${months[monthIdx]} de ${year}`;
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const map: Record<PaymentMethod, string> = {
    pix: 'PIX',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    cash: 'Dinheiro em Espécie',
    bank_transfer: 'Transferência / TED',
    boleto: 'Boleto Bancário',
  };
  return map[method] || method;
};

export const getTransactionTypeLabel = (type: TransactionType): string => {
  const map: Record<TransactionType, string> = {
    expense: 'Despesa',
    income: 'Receita',
    investment: 'Investimento',
    transfer: 'Transferência',
  };
  return map[type] || type;
};

export const exportTransactionsToCSV = (
  transactions: any[], 
  categories: Record<string, any>, 
  accounts: Record<string, any>
) => {
  const headers = [
    'ID',
    'Data',
    'Tipo',
    'Descricao',
    'Categoria',
    'Subcategoria',
    'Conta',
    'Metodo_Pagamento',
    'Status',
    'Valor_R$',
    'Parcela',
    'Tags',
    'Observacoes'
  ];

  const rows = transactions.map(t => {
    const cat = categories[t.categoryId]?.name || 'Geral';
    const acc = accounts[t.accountId]?.name || 'Geral';
    const installment = t.isInstallment && t.installmentTotal 
      ? `${t.installmentCurrent || 1}/${t.installmentTotal}` 
      : 'Unica';
    const cleanDesc = (t.description || '').replace(/;/g, ',');
    const cleanNotes = (t.notes || '').replace(/;/g, ',');
    const cleanTags = (t.tags || []).join(' | ');

    return [
      t.id,
      formatDate(t.date),
      getTransactionTypeLabel(t.type),
      `"${cleanDesc}"`,
      `"${cat}"`,
      `"${t.subCategory || ''}"`,
      `"${acc}"`,
      `"${getPaymentMethodLabel(t.paymentMethod)}"`,
      t.status === 'paid' ? 'Pago' : 'Pendente',
      t.amount.toFixed(2).replace('.', ','),
      installment,
      `"${cleanTags}"`,
      `"${cleanNotes}"`
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tradefin_extrato_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
