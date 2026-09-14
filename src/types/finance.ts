export type TransactionType = 'expense' | 'income' | 'investment' | 'transfer';

export type PaymentMethod = 
  | 'pix' 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'bank_transfer' 
  | 'boleto';

export type TransactionStatus = 'paid' | 'pending';

export type AccountType = 'checking' | 'credit' | 'wallet' | 'investment';

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  balance: number;
  color: string;
  icon: string;
  accountNumber?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  subcategories: string[];
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  subCategory?: string;
  accountId: string;
  destinationAccountId?: string; // For transfers
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
  isInstallment?: boolean;
  installmentCurrent?: number;
  installmentTotal?: number;
  tags: string[];
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  category: string;
}

export type ActiveScreen = 'dashboard' | 'transactions' | 'spreadsheet' | 'budgets' | 'reports';
