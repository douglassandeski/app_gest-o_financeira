import { Account, Budget, Category, FinancialGoal, Transaction } from '../types/finance';
import { INITIAL_ACCOUNTS, INITIAL_BUDGETS, INITIAL_CATEGORIES, INITIAL_GOALS, INITIAL_TRANSACTIONS } from '../data/initialData';

const KEYS = {
  TRANSACTIONS: 'tradefin_transactions',
  ACCOUNTS: 'tradefin_accounts',
  CATEGORIES: 'tradefin_categories',
  BUDGETS: 'tradefin_budgets',
  GOALS: 'tradefin_goals',
  HIDE_VALUES: 'tradefin_hide_values',
  CLEAN_FLAG: 'tradefin_clean_v1_zeroed',
};

// Check if old mock data needs to be cleared for clean zeroed first access
const checkAndClearLegacyTestData = () => {
  try {
    if (typeof window !== 'undefined' && localStorage.getItem(KEYS.CLEAN_FLAG) !== 'true') {
      localStorage.removeItem(KEYS.TRANSACTIONS);
      localStorage.removeItem(KEYS.ACCOUNTS);
      localStorage.removeItem(KEYS.BUDGETS);
      localStorage.removeItem(KEYS.GOALS);
      localStorage.setItem(KEYS.CLEAN_FLAG, 'true');
    }
  } catch (e) {
    console.error('Error clearing legacy data', e);
  }
};

checkAndClearLegacyTestData();

export const loadStoredTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading transactions', e);
  }
  return INITIAL_TRANSACTIONS;
};

export const saveStoredTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions', e);
  }
};

export const loadStoredAccounts = (): Account[] => {
  try {
    const data = localStorage.getItem(KEYS.ACCOUNTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading accounts', e);
  }
  return INITIAL_ACCOUNTS;
};

export const saveStoredAccounts = (accounts: Account[]) => {
  try {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving accounts', e);
  }
};

export const loadStoredCategories = (): Category[] => {
  try {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading categories', e);
  }
  return INITIAL_CATEGORIES;
};

export const saveStoredCategories = (categories: Category[]) => {
  try {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories', e);
  }
};

export const loadStoredBudgets = (): Budget[] => {
  try {
    const data = localStorage.getItem(KEYS.BUDGETS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading budgets', e);
  }
  return INITIAL_BUDGETS;
};

export const saveStoredBudgets = (budgets: Budget[]) => {
  try {
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (e) {
    console.error('Error saving budgets', e);
  }
};

export const loadStoredGoals = (): FinancialGoal[] => {
  try {
    const data = localStorage.getItem(KEYS.GOALS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading goals', e);
  }
  return INITIAL_GOALS;
};

export const saveStoredGoals = (goals: FinancialGoal[]) => {
  try {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Error saving goals', e);
  }
};

export const resetToSeedData = () => {
  localStorage.removeItem(KEYS.TRANSACTIONS);
  localStorage.removeItem(KEYS.ACCOUNTS);
  localStorage.removeItem(KEYS.CATEGORIES);
  localStorage.removeItem(KEYS.BUDGETS);
  localStorage.removeItem(KEYS.GOALS);
};
