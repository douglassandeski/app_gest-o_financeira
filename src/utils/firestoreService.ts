import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  deleteDoc, 
  onSnapshot 
} from '../lib/firebase';
import { 
  Transaction, 
  Account, 
  Category, 
  Budget, 
  FinancialGoal 
} from '../types/finance';

/**
 * Realtime sync hook for user's transactions from Firestore
 */
export const subscribeToTransactions = (
  userId: string, 
  onUpdate: (txs: Transaction[]) => void
) => {
  const txCol = collection(db, 'users', userId, 'transactions');
  return onSnapshot(txCol, (snapshot) => {
    const list: Transaction[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Transaction);
    });
    // Sort descending by date
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    onUpdate(list);
  }, (err) => {
    console.error('Erro ao escutar transações:', err);
  });
};

/**
 * Realtime sync hook for user's accounts from Firestore
 */
export const subscribeToAccounts = (
  userId: string, 
  onUpdate: (accs: Account[]) => void
) => {
  const accCol = collection(db, 'users', userId, 'accounts');
  return onSnapshot(accCol, (snapshot) => {
    const list: Account[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Account);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Erro ao escutar contas:', err);
  });
};

/**
 * Realtime sync hook for user's categories from Firestore
 */
export const subscribeToCategories = (
  userId: string, 
  onUpdate: (cats: Category[]) => void
) => {
  const catCol = collection(db, 'users', userId, 'categories');
  return onSnapshot(catCol, (snapshot) => {
    const list: Category[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Category);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Erro ao escutar categorias:', err);
  });
};

/**
 * Realtime sync hook for user's budgets from Firestore
 */
export const subscribeToBudgets = (
  userId: string, 
  onUpdate: (budgets: Budget[]) => void
) => {
  const bCol = collection(db, 'users', userId, 'budgets');
  return onSnapshot(bCol, (snapshot) => {
    const list: Budget[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Budget);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Erro ao escutar orçamentos:', err);
  });
};

/**
 * Realtime sync hook for user's financial goals from Firestore
 */
export const subscribeToGoals = (
  userId: string, 
  onUpdate: (goals: FinancialGoal[]) => void
) => {
  const gCol = collection(db, 'users', userId, 'goals');
  return onSnapshot(gCol, (snapshot) => {
    const list: FinancialGoal[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as FinancialGoal);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Erro ao escutar metas:', err);
  });
};

/**
 * Save or update transaction in Firestore
 */
export const saveTransactionToFirestore = async (userId: string, tx: Transaction) => {
  const ref = doc(db, 'users', userId, 'transactions', tx.id);
  await setDoc(ref, tx, { merge: true });
};

/**
 * Delete transaction from Firestore
 */
export const deleteTransactionFromFirestore = async (userId: string, txId: string) => {
  const ref = doc(db, 'users', userId, 'transactions', txId);
  await deleteDoc(ref);
};

/**
 * Save account in Firestore
 */
export const saveAccountToFirestore = async (userId: string, acc: Account) => {
  const ref = doc(db, 'users', userId, 'accounts', acc.id);
  await setDoc(ref, acc, { merge: true });
};

/**
 * Delete account from Firestore
 */
export const deleteAccountFromFirestore = async (userId: string, accId: string) => {
  const ref = doc(db, 'users', userId, 'accounts', accId);
  await deleteDoc(ref);
};

/**
 * Save budget in Firestore
 */
export const saveBudgetToFirestore = async (userId: string, b: Budget) => {
  const ref = doc(db, 'users', userId, 'budgets', b.id);
  await setDoc(ref, b, { merge: true });
};

/**
 * Save financial goal in Firestore
 */
export const saveGoalToFirestore = async (userId: string, g: FinancialGoal) => {
  const ref = doc(db, 'users', userId, 'goals', g.id);
  await setDoc(ref, g, { merge: true });
};

/**
 * Seed user's Firestore with default categories on first login if empty.
 * Never seeds fake/demo transactions or accounts.
 */
export const seedUserFirestoreIfEmpty = async (
  userId: string, 
  initialCats: Category[]
) => {
  // Only save default category list
  for (const cat of initialCats) {
    const ref = doc(db, 'users', userId, 'categories', cat.id);
    await setDoc(ref, cat, { merge: true });
  }
};

/**
 * Wipe all user transactions, accounts, budgets, and goals from Firestore
 * so the user can start with a 100% clean account.
 */
export const clearAllUserDataFromFirestore = async (userId: string) => {
  try {
    const collectionsToWipe = ['transactions', 'accounts', 'budgets', 'goals'];
    for (const colName of collectionsToWipe) {
      const colRef = collection(db, 'users', userId, colName);
      const snap = await getDocs(colRef);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    }
  } catch (err) {
    console.error('Erro ao limpar dados do Firestore:', err);
  }
};
