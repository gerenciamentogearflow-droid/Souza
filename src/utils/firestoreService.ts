import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Bill, Expense, Income, MarketPriorityItem, MarketTrip } from '../types';
import {
  getBills,
  getExpenses,
  getIncomes,
  getMarketPriorities,
  getMarketTrips,
  saveBills,
  saveExpenses,
  saveIncomes,
  saveMarketPriorities,
  saveMarketTrips,
} from './storage';

// Incomes Firestore Operations
export async function saveIncomeDoc(income: Income, ownerUid: string): Promise<void> {
  const path = `incomes/${income.id}`;
  try {
    const payload = {
      id: income.id,
      description: income.description,
      amount: Number(income.amount),
      date: income.date,
      userId: income.userId,
      createdAt: income.createdAt || Date.now(),
      ownerUid,
      ...(income.category ? { category: income.category } : {}),
      ...(income.receiptImage ? { receiptImage: income.receiptImage } : {}),
    };
    await setDoc(doc(db, 'incomes', income.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteIncomeDoc(incomeId: string): Promise<void> {
  const path = `incomes/${incomeId}`;
  try {
    await deleteDoc(doc(db, 'incomes', incomeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeIncomes(
  ownerUid: string,
  onUpdate: (incomes: Income[]) => void
): Unsubscribe {
  const path = 'incomes';
  const q = query(collection(db, path), where('ownerUid', '==', ownerUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Income[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id,
          description: data.description,
          amount: data.amount,
          date: data.date,
          userId: data.userId,
          category: data.category,
          receiptImage: data.receiptImage,
          createdAt: data.createdAt,
        });
      });
      // Ordena por data decrescente
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(items);
      saveIncomes(items); // Sincroniza cache local
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Expenses Firestore Operations
export async function saveExpenseDoc(expense: Expense, ownerUid: string): Promise<void> {
  const path = `expenses/${expense.id}`;
  try {
    const payload = {
      id: expense.id,
      description: expense.description,
      amount: Number(expense.amount),
      date: expense.date,
      userId: expense.userId,
      category: expense.category,
      type: expense.type,
      paymentMethod: expense.paymentMethod,
      createdAt: expense.createdAt || Date.now(),
      ownerUid,
      ...(expense.dueDay !== undefined ? { dueDay: Number(expense.dueDay) } : {}),
      ...(expense.durationMonths !== undefined ? { durationMonths: String(expense.durationMonths) } : {}),
      ...(expense.fixedEndDate ? { fixedEndDate: expense.fixedEndDate } : {}),
      ...(expense.barcodeOrPix ? { barcodeOrPix: expense.barcodeOrPix } : {}),
      ...(expense.isNextMonthInvoice !== undefined ? { isNextMonthInvoice: expense.isNextMonthInvoice } : {}),
    };
    await setDoc(doc(db, 'expenses', expense.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExpenseDoc(expenseId: string): Promise<void> {
  const path = `expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeExpenses(
  ownerUid: string,
  onUpdate: (expenses: Expense[]) => void
): Unsubscribe {
  const path = 'expenses';
  const q = query(collection(db, path), where('ownerUid', '==', ownerUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Expense[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id,
          description: data.description,
          amount: data.amount,
          date: data.date,
          userId: data.userId,
          category: data.category,
          type: data.type,
          paymentMethod: data.paymentMethod,
          dueDay: data.dueDay,
          durationMonths: data.durationMonths === 'indefinite' ? 'indefinite' : (data.durationMonths ? Number(data.durationMonths) : undefined),
          fixedEndDate: data.fixedEndDate,
          barcodeOrPix: data.barcodeOrPix,
          isNextMonthInvoice: data.isNextMonthInvoice,
          createdAt: data.createdAt,
        });
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(items);
      saveExpenses(items); // Sincroniza cache local
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Bills Firestore Operations
export async function saveBillDoc(bill: Bill, ownerUid: string): Promise<void> {
  const path = `bills/${bill.id}`;
  try {
    const payload = {
      id: bill.id,
      name: bill.name,
      amount: Number(bill.amount),
      dueDate: bill.dueDate,
      isPaid: Boolean(bill.isPaid),
      category: bill.category,
      ownerUid,
      ...(bill.paidAt ? { paidAt: bill.paidAt } : {}),
      ...(bill.userId ? { userId: bill.userId } : {}),
      ...(bill.barcodeOrPix ? { barcodeOrPix: bill.barcodeOrPix } : {}),
      ...(bill.isInstallment !== undefined ? { isInstallment: bill.isInstallment } : {}),
      ...(bill.installmentCurrent !== undefined ? { installmentCurrent: Number(bill.installmentCurrent) } : {}),
      ...(bill.installmentTotal !== undefined ? { installmentTotal: Number(bill.installmentTotal) } : {}),
      ...(bill.installmentAmount !== undefined ? { installmentAmount: Number(bill.installmentAmount) } : {}),
      ...(bill.originalInstallmentId ? { originalInstallmentId: bill.originalInstallmentId } : {}),
      ...(bill.createdAt ? { createdAt: bill.createdAt } : { createdAt: Date.now() }),
    };
    await setDoc(doc(db, 'bills', bill.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBillDoc(billId: string): Promise<void> {
  const path = `bills/${billId}`;
  try {
    await deleteDoc(doc(db, 'bills', billId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeBills(
  ownerUid: string,
  onUpdate: (bills: Bill[]) => void
): Unsubscribe {
  const path = 'bills';
  const q = query(collection(db, path), where('ownerUid', '==', ownerUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Bill[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id,
          name: data.name,
          amount: data.amount,
          dueDate: data.dueDate,
          barcodeOrPix: data.barcodeOrPix,
          isPaid: data.isPaid,
          paidAt: data.paidAt,
          category: data.category,
          userId: data.userId,
          isInstallment: data.isInstallment,
          installmentCurrent: data.installmentCurrent,
          installmentTotal: data.installmentTotal,
          installmentAmount: data.installmentAmount,
          originalInstallmentId: data.originalInstallmentId,
          createdAt: data.createdAt,
        });
      });
      items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      onUpdate(items);
      saveBills(items); // Sincroniza cache local
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Market Priorities Firestore Operations
export async function savePriorityDoc(
  item: MarketPriorityItem,
  ownerUid: string
): Promise<void> {
  const path = `marketPriorities/${item.id}`;
  try {
    const payload = {
      id: item.id,
      name: item.name,
      category: item.category,
      isCompleted: Boolean(item.isCompleted),
      addedBy: item.addedBy,
      month: item.month,
      ownerUid,
      ...(item.quantity ? { quantity: item.quantity } : {}),
      ...(item.estimatedPrice !== undefined ? { estimatedPrice: Number(item.estimatedPrice) } : {}),
      ...(item.createdAt ? { createdAt: item.createdAt } : { createdAt: Date.now() }),
    };
    await setDoc(doc(db, 'marketPriorities', item.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePriorityDoc(itemId: string): Promise<void> {
  const path = `marketPriorities/${itemId}`;
  try {
    await deleteDoc(doc(db, 'marketPriorities', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeMarketPriorities(
  ownerUid: string,
  onUpdate: (items: MarketPriorityItem[]) => void
): Unsubscribe {
  const path = 'marketPriorities';
  const q = query(collection(db, path), where('ownerUid', '==', ownerUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MarketPriorityItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id,
          name: data.name,
          category: data.category,
          quantity: data.quantity,
          isCompleted: data.isCompleted,
          estimatedPrice: data.estimatedPrice,
          addedBy: data.addedBy,
          month: data.month,
          createdAt: data.createdAt,
        });
      });
      onUpdate(items);
      saveMarketPriorities(items); // Sincroniza cache local
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Market Trips Firestore Operations
export async function saveTripDoc(trip: MarketTrip, ownerUid: string): Promise<void> {
  const path = `marketTrips/${trip.id}`;
  try {
    const payload = {
      id: trip.id,
      date: trip.date,
      month: trip.month,
      supermarketName: trip.supermarketName,
      totalAmount: Number(trip.totalAmount),
      items: trip.items || [],
      createdAt: trip.createdAt || Date.now(),
      ownerUid,
      ...(trip.notes ? { notes: trip.notes } : {}),
      ...(trip.syncedToFinance !== undefined ? { syncedToFinance: trip.syncedToFinance } : {}),
    };
    await setDoc(doc(db, 'marketTrips', trip.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTripDoc(tripId: string): Promise<void> {
  const path = `marketTrips/${tripId}`;
  try {
    await deleteDoc(doc(db, 'marketTrips', tripId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeMarketTrips(
  ownerUid: string,
  onUpdate: (trips: MarketTrip[]) => void
): Unsubscribe {
  const path = 'marketTrips';
  const q = query(collection(db, path), where('ownerUid', '==', ownerUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MarketTrip[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id,
          date: data.date,
          month: data.month,
          supermarketName: data.supermarketName,
          totalAmount: data.totalAmount,
          items: data.items || [],
          notes: data.notes,
          syncedToFinance: data.syncedToFinance,
          createdAt: data.createdAt,
        });
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(items);
      saveMarketTrips(items); // Sincroniza cache local
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Sincronização automática de coleções com detecção de adições, modificações e exclusões
export async function syncIncomesCollection(
  newIncomes: Income[],
  previousIncomes: Income[],
  ownerUid: string
): Promise<void> {
  const newMap = new Map(newIncomes.map((item) => [item.id, item]));
  const prevMap = new Map(previousIncomes.map((item) => [item.id, item]));

  // Adições e atualizações
  for (const item of newIncomes) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      await saveIncomeDoc(item, ownerUid);
    }
  }

  // Exclusões
  for (const prev of previousIncomes) {
    if (!newMap.has(prev.id)) {
      await deleteIncomeDoc(prev.id);
    }
  }
}

export async function syncExpensesCollection(
  newExpenses: Expense[],
  previousExpenses: Expense[],
  ownerUid: string
): Promise<void> {
  const newMap = new Map(newExpenses.map((item) => [item.id, item]));
  const prevMap = new Map(previousExpenses.map((item) => [item.id, item]));

  for (const item of newExpenses) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      await saveExpenseDoc(item, ownerUid);
    }
  }

  for (const prev of previousExpenses) {
    if (!newMap.has(prev.id)) {
      await deleteExpenseDoc(prev.id);
    }
  }
}

export async function syncBillsCollection(
  newBills: Bill[],
  previousBills: Bill[],
  ownerUid: string
): Promise<void> {
  const newMap = new Map(newBills.map((item) => [item.id, item]));
  const prevMap = new Map(previousBills.map((item) => [item.id, item]));

  for (const item of newBills) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      await saveBillDoc(item, ownerUid);
    }
  }

  for (const prev of previousBills) {
    if (!newMap.has(prev.id)) {
      await deleteBillDoc(prev.id);
    }
  }
}

export async function syncPrioritiesCollection(
  newPriorities: MarketPriorityItem[],
  previousPriorities: MarketPriorityItem[],
  ownerUid: string
): Promise<void> {
  const newMap = new Map(newPriorities.map((item) => [item.id, item]));
  const prevMap = new Map(previousPriorities.map((item) => [item.id, item]));

  for (const item of newPriorities) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      await savePriorityDoc(item, ownerUid);
    }
  }

  for (const prev of previousPriorities) {
    if (!newMap.has(prev.id)) {
      await deletePriorityDoc(prev.id);
    }
  }
}

export async function syncTripsCollection(
  newTrips: MarketTrip[],
  previousTrips: MarketTrip[],
  ownerUid: string
): Promise<void> {
  const newMap = new Map(newTrips.map((item) => [item.id, item]));
  const prevMap = new Map(previousTrips.map((item) => [item.id, item]));

  for (const item of newTrips) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      await saveTripDoc(item, ownerUid);
    }
  }

  for (const prev of previousTrips) {
    if (!newMap.has(prev.id)) {
      await deleteTripDoc(prev.id);
    }
  }
}

// Sincronização inicial: envia qualquer dado que já existia no localStorage para o Firestore
export async function syncLocalStorageToFirestore(ownerUid: string): Promise<number> {
  let count = 0;
  try {
    const localIncomes = getIncomes();
    const localExpenses = getExpenses();
    const localBills = getBills();
    const localPriorities = getMarketPriorities();
    const localTrips = getMarketTrips();

    for (const inc of localIncomes) {
      await saveIncomeDoc(inc, ownerUid);
      count++;
    }
    for (const exp of localExpenses) {
      await saveExpenseDoc(exp, ownerUid);
      count++;
    }
    for (const b of localBills) {
      await saveBillDoc(b, ownerUid);
      count++;
    }
    for (const p of localPriorities) {
      await savePriorityDoc(p, ownerUid);
      count++;
    }
    for (const t of localTrips) {
      await saveTripDoc(t, ownerUid);
      count++;
    }
  } catch (err) {
    console.error('Erro ao sincronizar dados locais para o Firestore:', err);
  }
  return count;
}

