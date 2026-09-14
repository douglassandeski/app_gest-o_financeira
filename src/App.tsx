import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TransactionModal } from './components/TransactionModal';
import { AccountModal } from './components/AccountModal';
import { AboutModal } from './components/AboutModal';
import { getFixedCreatorPhoto, syncCreatorPhotoToServerAndFirestore } from './utils/creatorProfile';
import { DashboardScreen } from './screens/DashboardScreen';
import { TransactionsScreen } from './screens/TransactionsScreen';
import { SpreadsheetScreen } from './screens/SpreadsheetScreen';
import { BudgetsScreen } from './screens/BudgetsScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { LoginScreen } from './screens/LoginScreen';
import { 
  Account, 
  ActiveScreen, 
  Budget, 
  Category, 
  FinancialGoal, 
  Transaction, 
  TransactionType 
} from './types/finance';
import { 
  loadStoredAccounts, 
  loadStoredBudgets, 
  loadStoredCategories, 
  loadStoredGoals, 
  loadStoredTransactions, 
  resetToSeedData, 
  saveStoredAccounts, 
  saveStoredBudgets, 
  saveStoredGoals, 
  saveStoredTransactions 
} from './utils/storage';
import { exportTransactionsToCSV } from './utils/formatters';
import { auth, onAuthStateChanged, logoutUser, User } from './lib/firebase';
import { 
  subscribeToTransactions, 
  subscribeToAccounts, 
  subscribeToCategories, 
  subscribeToBudgets, 
  subscribeToGoals, 
  saveTransactionToFirestore, 
  deleteTransactionFromFirestore, 
  saveAccountToFirestore, 
  deleteAccountFromFirestore,
  saveBudgetToFirestore, 
  saveGoalToFirestore,
  seedUserFirestoreIfEmpty 
} from './utils/firestoreService';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [guestMode, setGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('tradefin_guest_mode') === 'true';
  });

  // Navigation
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('dashboard');
  
  // Current period (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Privacy toggle (hide numbers)
  const [hideValues, setHideValues] = useState<boolean>(() => {
    return localStorage.getItem('tradefin_hide_values') === 'true';
  });

  // Financial Data State
  const [transactions, setTransactions] = useState<Transaction[]>(loadStoredTransactions);
  const [accounts, setAccounts] = useState<Account[]>(loadStoredAccounts);
  const [categories, setCategories] = useState<Category[]>(loadStoredCategories);
  const [budgets, setBudgets] = useState<Budget[]>(loadStoredBudgets);
  const [goals, setGoals] = useState<FinancialGoal[]>(loadStoredGoals);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('expense');

  // Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // About Creator Modal State
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [creatorPhoto, setCreatorPhoto] = useState<string>(() => {
    return localStorage.getItem('douglas_custom_photo') || '/creator-photo.jpg';
  });

  useEffect(() => {
    getFixedCreatorPhoto().then((url) => {
      if (url) setCreatorPhoto(url);
    });
    syncCreatorPhotoToServerAndFirestore(currentUser?.email, currentUser?.photoURL);
  }, [currentUser?.email, currentUser?.photoURL]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setGuestMode(false);
        localStorage.removeItem('tradefin_guest_mode');
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.uid;

    // Listen to realtime collections
    const unsubTxs = subscribeToTransactions(userId, (txs) => {
      if (txs.length > 0) {
        setTransactions(txs);
      } else {
        // If user has no transactions yet in Firestore, seed their account with initial data
        seedUserFirestoreIfEmpty(
          userId, 
          transactions, 
          accounts, 
          categories, 
          budgets, 
          goals
        );
      }
    });

    const unsubAccs = subscribeToAccounts(userId, (accs) => {
      if (accs.length > 0) setAccounts(accs);
    });

    const unsubCats = subscribeToCategories(userId, (cats) => {
      if (cats.length > 0) setCategories(cats);
    });

    const unsubBudgets = subscribeToBudgets(userId, (b) => {
      if (b.length > 0) setBudgets(b);
    });

    const unsubGoals = subscribeToGoals(userId, (g) => {
      if (g.length > 0) setGoals(g);
    });

    return () => {
      unsubTxs();
      unsubAccs();
      unsubCats();
      unsubBudgets();
      unsubGoals();
    };
  }, [currentUser]);

  // Local Storage Backups (For guest mode or offline fallback)
  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveStoredBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveStoredGoals(goals);
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('tradefin_hide_values', String(hideValues));
  }, [hideValues]);

  // Open Add Transaction
  const handleOpenNewTransaction = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setModalInitialType(type);
    setIsModalOpen(true);
  };

  // Open Edit Transaction
  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalInitialType(tx.type);
    setIsModalOpen(true);
  };

  // Save Transaction (Create or Update)
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Editing existing
      const existingTx = transactions.find(t => t.id === existingId);
      const updatedTx: Transaction = {
        ...existingTx,
        ...data,
        id: existingId,
        createdAt: existingTx?.createdAt || new Date().toISOString(),
      };

      setTransactions(prev => prev.map(t => t.id === existingId ? updatedTx : t));

      if (currentUser) {
        await saveTransactionToFirestore(currentUser.uid, updatedTx);
      }
    } else {
      // Creating new
      const newTx: Transaction = {
        ...data,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };

      setTransactions(prev => [newTx, ...prev]);

      // Update account balance
      const updatedAccounts = accounts.map(acc => {
        if (acc.id === data.accountId) {
          let balanceDelta = 0;
          if (data.type === 'income') balanceDelta = data.amount;
          else if (data.type === 'expense' || data.type === 'investment') balanceDelta = -data.amount;
          else if (data.type === 'transfer') balanceDelta = -data.amount;
          return { ...acc, balance: acc.balance + balanceDelta };
        }
        if (data.type === 'transfer' && acc.id === data.destinationAccountId) {
          return { ...acc, balance: acc.balance + data.amount };
        }
        return acc;
      });

      setAccounts(updatedAccounts);

      if (currentUser) {
        await saveTransactionToFirestore(currentUser.uid, newTx);
        for (const acc of updatedAccounts) {
          await saveAccountToFirestore(currentUser.uid, acc);
        }
      }
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    if (window.confirm(`Deseja excluir "${tx.description}"?`)) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (currentUser) {
        await deleteTransactionFromFirestore(currentUser.uid, id);
      }
    }
  };

  // Toggle Status (Pago / Pendente)
  const handleToggleStatus = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    const updated: Transaction = {
      ...tx,
      status: tx.status === 'paid' ? 'pending' : 'paid',
    };
    setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    if (currentUser) {
      await saveTransactionToFirestore(currentUser.uid, updated);
    }
  };

  // Duplicate Transaction
  const handleDuplicateTransaction = async (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: `tx_${Date.now()}`,
      description: `${tx.description} (Cópia)`,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [duplicated, ...prev]);
    if (currentUser) {
      await saveTransactionToFirestore(currentUser.uid, duplicated);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const catMap = categories.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
    const accMap = accounts.reduce((acc, a) => ({ ...acc, [a.id]: a }), {});
    exportTransactionsToCSV(transactions, catMap, accMap);
  };

  // Reset to seed
  const handleResetData = () => {
    resetToSeedData();
    window.location.reload();
  };

  // Update Budget limit
  const handleUpdateBudget = async (categoryId: string, limit: number) => {
    let targetBudget: Budget | undefined;
    setBudgets(prev => {
      const exists = prev.find(b => b.categoryId === categoryId);
      if (exists) {
        targetBudget = { ...exists, monthlyLimit: limit };
        return prev.map(b => b.categoryId === categoryId ? targetBudget! : b);
      }
      targetBudget = { id: `b_${Date.now()}`, categoryId, monthlyLimit: limit };
      return [...prev, targetBudget];
    });

    if (currentUser && targetBudget) {
      await saveBudgetToFirestore(currentUser.uid, targetBudget);
    }
  };

  // Add funds to goal
  const handleUpdateGoalProgress = async (goalId: string, addedAmount: number) => {
    const target = goals.find(g => g.id === goalId);
    if (!target) return;
    const updated: FinancialGoal = {
      ...target,
      currentAmount: Math.max(0, target.currentAmount + addedAmount),
    };

    setGoals(prev => prev.map(g => g.id === goalId ? updated : g));

    if (currentUser) {
      await saveGoalToFirestore(currentUser.uid, updated);
    }
  };

  // Add new goal
  const handleAddNewGoal = async (newGoal: Omit<FinancialGoal, 'id'>) => {
    const created: FinancialGoal = {
      ...newGoal,
      id: `goal_${Date.now()}`,
    };
    setGoals(prev => [...prev, created]);

    if (currentUser) {
      await saveGoalToFirestore(currentUser.uid, created);
    }
  };

  // Open Add Account
  const handleOpenNewAccount = () => {
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };

  // Open Edit Account
  const handleEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setIsAccountModalOpen(true);
  };

  // Save Account (Create or Edit)
  const handleSaveAccount = async (accountData: Omit<Account, 'id'>, existingId?: string) => {
    if (existingId) {
      const updated: Account = { ...accountData, id: existingId };
      setAccounts(prev => prev.map(a => a.id === existingId ? updated : a));
      if (currentUser) {
        await saveAccountToFirestore(currentUser.uid, updated);
      }
    } else {
      const newAcc: Account = {
        ...accountData,
        id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
      setAccounts(prev => [...prev, newAcc]);
      if (currentUser) {
        await saveAccountToFirestore(currentUser.uid, newAcc);
      }
    }
  };

  // Delete Account
  const handleDeleteAccount = async (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    if (currentUser) {
      await deleteAccountFromFirestore(currentUser.uid, id);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logoutUser();
    setGuestMode(false);
    localStorage.removeItem('tradefin_guest_mode');
  };

  // Continue as Guest (local storage only)
  const handleContinueAsGuest = () => {
    setGuestMode(true);
    localStorage.setItem('tradefin_guest_mode', 'true');
  };

  // Loading Screen while verifying auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-3 border-[#00D2B5] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-medium tracking-wide">
          Iniciando Gestão Financeira...
        </span>
      </div>
    );
  }

  // Show Login Screen if user is NOT logged in and NOT in guest mode
  if (!currentUser && !guestMode) {
    return <LoginScreen onContinueAsGuest={handleContinueAsGuest} />;
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-[#E2E8F0] flex flex-col font-sans selection:bg-[#00D2B5] selection:text-[#090D16]">
      {/* Top Navigation Header with User Profile & Cloud Sync */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        hideValues={hideValues}
        onToggleHideValues={() => setHideValues(prev => !prev)}
        onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => setGuestMode(false)}
      />

      {/* Main Content Area Rendering the Active Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            selectedMonth={selectedMonth}
            hideValues={hideValues}
            onOpenNewTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
            onToggleTransactionStatus={handleToggleStatus}
            onNavigateToTransactions={() => setCurrentScreen('transactions')}
            onNavigateToSpreadsheet={() => setCurrentScreen('spreadsheet')}
            onAddAccount={handleOpenNewAccount}
            onEditAccount={handleEditAccount}
          />
        )}

        {currentScreen === 'transactions' && (
          <TransactionsScreen
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            selectedMonth={selectedMonth}
            hideValues={hideValues}
            onOpenNewTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onToggleStatus={handleToggleStatus}
            onDuplicateTransaction={handleDuplicateTransaction}
            onExportCSV={handleExportCSV}
          />
        )}

        {currentScreen === 'spreadsheet' && (
          <SpreadsheetScreen
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            hideValues={hideValues}
            onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onToggleStatus={handleToggleStatus}
            onExportCSV={handleExportCSV}
          />
        )}

        {currentScreen === 'budgets' && (
          <BudgetsScreen
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            goals={goals}
            selectedMonth={selectedMonth}
            hideValues={hideValues}
            onUpdateBudget={handleUpdateBudget}
            onUpdateGoalProgress={handleUpdateGoalProgress}
            onAddNewGoal={handleAddNewGoal}
          />
        )}

        {currentScreen === 'reports' && (
          <ReportsScreen
            transactions={transactions}
            categories={categories}
            selectedMonth={selectedMonth}
            hideValues={hideValues}
          />
        )}
      </main>

      {/* Área Sobre o Criador ao Fim da Página */}
      <footer className="w-full border-t border-[#1E293B] bg-[#070B12] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="bg-[#0D1424] border border-[#1E293B] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-14 h-14 rounded-2xl border-2 border-[#00D2B5]/50 overflow-hidden bg-[#131D2E] shadow-lg shadow-[#00D2B5]/10 flex-shrink-0 flex items-center justify-center">
                <img
                  src={creatorPhoto}
                  alt="Douglas Sandeski"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/creator-avatar.svg';
                  }}
                />

              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black text-white">
                    Douglas Sandeski
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D2B5]/15 text-[#00D2B5] font-bold border border-[#00D2B5]/30">
                    Criador do Aplicativo
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ciências Econômicas (Unioeste Cascavel) • TIC (UEPG) • Sicredi Guaraniaçu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#131D2E] hover:bg-[#1A253A] border border-[#1E293B] hover:border-[#00D2B5]/50 text-xs text-slate-200 hover:text-[#00D2B5] font-semibold transition-all cursor-pointer shadow-sm"
              >
                Ver Detalhes do Criador
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500">
            © {new Date().getFullYear()} Gestão Financeira Pessoal • Desenvolvido por Douglas Sandeski • Cascavel / Guaraniaçu - PR
          </div>
        </div>
      </footer>

      {/* Detailed Transaction Creation & Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        categories={categories}
        accounts={accounts}
        initialType={modalInitialType}
      />

      {/* Account Creation & Edit Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
        editingAccount={editingAccount}
      />

      {/* About Creator Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
