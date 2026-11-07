import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
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

const FAMILY_ID = 'souza';

// ==========================================
// Incomes Firestore Operations
// ==========================================
export async function saveIncomeDoc(income: Income): Promise<void> {
  const path = `incomes/${income.id}`;
  try {
    const payload = {
      id: income.id,
      description: income.description,
      amount: Number(income.amount),
      date: income.date,
      userId: income.userId,
      createdAt: income.createdAt || Date.now(),
      familyId: FAMILY_ID,
      ...(income.category ? { category: income.category } : {}),
      ...(income.receiptImage ? { receiptImage: income.receiptImage } : {}),
      ...(income.ownerUid ? { ownerUid: income.ownerUid } : {}),
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
  onUpdate: (incomes: Income[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'incomes';
  const q = query(collection(db, path));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Income[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id,
          description: data.description,
          amount: Number(data.amount),
          date: data.date,
          userId: data.userId,
          category: data.category,
          receiptImage: data.receiptImage,
          createdAt: data.createdAt,
          ownerUid: data.ownerUid,
        });
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(items);
      saveIncomes(items);
    },
    (error) => {
      console.warn('Incomes onSnapshot error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// ==========================================
// Expenses Firestore Operations
// ==========================================
export async function saveExpenseDoc(expense: Expense): Promise<void> {
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
      familyId: FAMILY_ID,
      ...(expense.dueDay !== undefined ? { dueDay: Number(expense.dueDay) } : {}),
      ...(expense.durationMonths !== undefined ? { durationMonths: String(expense.durationMonths) } : {}),
      ...(expense.fixedEndDate ? { fixedEndDate: expense.fixedEndDate } : {}),
      ...(expense.barcodeOrPix ? { barcodeOrPix: expense.barcodeOrPix } : {}),
      ...(expense.isNextMonthInvoice !== undefined ? { isNextMonthInvoice: expense.isNextMonthInvoice } : {}),
      ...(expense.ownerUid ? { ownerUid: expense.ownerUid } : {}),
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
  onUpdate: (expenses: Expense[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'expenses';
  const q = query(collection(db, path));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Expense[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id,
          description: data.description,
          amount: Number(data.amount),
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
          ownerUid: data.ownerUid,
        });
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(items);
      saveExpenses(items);
    },
    (error) => {
      console.warn('Expenses onSnapshot error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// ==========================================
// Bills Firestore Operations
// ==========================================
export async function saveBillDoc(bill: Bill): Promise<void> {
  const path = `bills/${bill.id}`;
  try {
    const payload = {
      id: bill.id,
      name: bill.name,
      amount: Number(bill.amount),
      dueDate: bill.dueDate,
      isPaid: Boolean(bill.isPaid),
      category: bill.category,
      familyId: FAMILY_ID,
      ...(bill.paidAt ? { paidAt: bill.paidAt } : {}),
      ...(bill.userId ? { userId: bill.userId } : {}),
      ...(bill.barcodeOrPix ? { barcodeOrPix: bill.barcodeOrPix } : {}),
      ...(bill.isInstallment !== undefined ? { isInstallment: bill.isInstallment } : {}),
      ...(bill.installmentCurrent !== undefined ? { installmentCurrent: Number(bill.installmentCurrent) } : {}),
      ...(bill.installmentTotal !== undefined ? { installmentTotal: Number(bill.installmentTotal) } : {}),
      ...(bill.installmentAmount !== undefined ? { installmentAmount: Number(bill.installmentAmount) } : {}),
      ...(bill.originalInstallmentId ? { originalInstallmentId: bill.originalInstallmentId } : {}),
      ...(bill.createdAt ? { createdAt: bill.createdAt } : { createdAt: Date.now() }),
      ...(bill.ownerUid ? { ownerUid: bill.ownerUid } : {}),
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
  onUpdate: (bills: Bill[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'bills';
  const q = query(collection(db, path));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Bill[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id,
          name: data.name,
          amount: Number(data.amount),
          dueDate: data.dueDate,
          barcodeOrPix: data.barcodeOrPix,
          isPaid: Boolean(data.isPaid),
          paidAt: data.paidAt,
          category: data.category,
          userId: data.userId,
          isInstallment: data.isInstallment,
          installmentCurrent: data.installmentCurrent,
          installmentTotal: data.installmentTotal,
          installmentAmount: data.installmentAmount,
          originalInstallmentId: data.originalInstallmentId,
          createdAt: data.createdAt,
          ownerUid: data.ownerUid,
        });
      });
      items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      onUpdate(items);
      saveBills(items);
    },
    (error) => {
      console.warn('Bills onSnapshot error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// ==========================================
// Market Priorities Firestore Operations
// ==========================================
export async function savePriorityDoc(item: MarketPriorityItem): Promise<void> {
  const path = `marketPriorities/${item.id}`;
  try {
    const payload = {
      id: item.id,
      name: item.name,
      category: item.category,
      isCompleted: Boolean(item.isCompleted),
      addedBy: item.addedBy,
      month: item.month,
      familyId: FAMILY_ID,
      ...(item.quantity ? { quantity: item.quantity } : {}),
      ...(item.estimatedPrice !== undefined ? { estimatedPrice: Number(item.estimatedPrice) } : {}),
      ...(item.createdAt ? { createdAt: item.createdAt } : { createdAt: Date.now() }),
      ...(item.ownerUid ? { ownerUid: item.ownerUid } : {}),
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
  onUpdate: (items: MarketPriorityItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'marketPriorities';
  const q = query(collection(db, path));

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
          isCompleted: Boolean(data.isCompleted),
          estimatedPrice: data.estimatedPrice !== undefined ? Number(data.estimatedPrice) : undefined,
          addedBy: data.addedBy,
          month: data.month,
          createdAt: data.createdAt,
          ownerUid: data.ownerUid,
        });
      });
      onUpdate(items);
      saveMarketPriorities(items);
    },
    (error) => {
      console.warn('Priorities onSnapshot error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// ==========================================
// Market Trips Firestore Operations
// ==========================================
export async function saveTripDoc(trip: MarketTrip): Promise<void> {
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
      familyId: FAMILY_ID,
      ...(trip.notes ? { notes: trip.notes } : {}),
      ...(trip.syncedToFinance !== undefined ? { syncedToFinance: trip.syncedToFinance } : {}),
      ...(trip.ownerUid ? { ownerUid: trip.ownerUid } : {}),
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
  onUpdate: (trips: MarketTrip[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'marketTrips';
  const q = query(collection(db, path));

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
          totalAmount: Number(data.totalAmount),
          items: data.items || [],
          notes: data.notes,
          syncedToFinance: data.syncedToFinance,
          createdAt: data.createdAt,
          ownerUid: data.ownerUid,
        });
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(items);
      saveMarketTrips(items);
    },
    (error) => {
      console.warn('Trips onSnapshot error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// ==========================================
// Limpar todas as contas e registros da nuvem (Firestore)
// ==========================================
export async function clearAllFirestoreDocs(): Promise<void> {
  const collections = ['expenses', 'bills', 'incomes', 'marketPriorities', 'marketTrips'];
  for (const colName of collections) {
    try {
      const snap = await getDocs(collection(db, colName));
      const deletePromises = snap.docs.map((docSnap) => deleteDoc(doc(db, colName, docSnap.id)));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error(`Erro ao limpar coleção ${colName}:`, err);
    }
  }
}

// ==========================================
// Collection Synchronization
// ==========================================
export async function syncIncomesCollection(
  newIncomes: Income[],
  previousIncomes: Income[]
): Promise<void> {
  const newMap = new Map(newIncomes.map((item) => [item.id, item]));
  const prevMap = new Map(previousIncomes.map((item) => [item.id, item]));

  for (const item of newIncomes) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      await saveIncomeDoc(item);
    }
  }

  for (const prev of previousIncomes) {
    if (!newMap.has(prev.id)) {
      await deleteIncomeDoc(prev.id);
    }
  }
}

export async function syncExpensesCollection(
  newExpenses: Expense[],
  previousExpenses: Expense[]
): Promise<void> {
  const newMap = new Map(newExpenses.map((item) => [item.id, item]));
  const prevMap = new Map(previousExpenses.map((item) => [item.id, item]));

  for (const item of newExpenses) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      await saveExpenseDoc(item);
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
  previousBills: Bill[]
): Promise<void> {
  const newMap = new Map(newBills.map((item) => [item.id, item]));
  const prevMap = new Map(previousBills.map((item) => [item.id, item]));

  for (const item of newBills) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      await saveBillDoc(item);
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
  previousPriorities: MarketPriorityItem[]
): Promise<void> {
  const newMap = new Map(newPriorities.map((item) => [item.id, item]));
  const prevMap = new Map(previousPriorities.map((item) => [item.id, item]));

  for (const item of newPriorities) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      await savePriorityDoc(item);
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
  previousTrips: MarketTrip[]
): Promise<void> {
  const newMap = new Map(newTrips.map((item) => [item.id, item]));
  const prevMap = new Map(previousTrips.map((item) => [item.id, item]));

  for (const item of newTrips) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      await saveTripDoc(item);
    }
  }

  for (const prev of previousTrips) {
    if (!newMap.has(prev.id)) {
      await deleteTripDoc(prev.id);
    }
  }
}

// Sincronização de todos os dados locais para a nuvem Firestore
export async function syncLocalStorageToFirestore(): Promise<{
  incomes: number;
  expenses: number;
  bills: number;
  priorities: number;
  trips: number;
}> {
  const result = {
    incomes: 0,
    expenses: 0,
    bills: 0,
    priorities: 0,
    trips: 0,
  };

  try {
    const localIncomes = getIncomes();
    const localExpenses = getExpenses();
    const localBills = getBills();
    const localPriorities = getMarketPriorities();
    const localTrips = getMarketTrips();

    for (const inc of localIncomes) {
      await saveIncomeDoc(inc);
      result.incomes++;
    }
    for (const exp of localExpenses) {
      await saveExpenseDoc(exp);
      result.expenses++;
    }
    for (const b of localBills) {
      await saveBillDoc(b);
      result.bills++;
    }
    for (const p of localPriorities) {
      await savePriorityDoc(p);
      result.priorities++;
    }
    for (const t of localTrips) {
      await saveTripDoc(t);
      result.trips++;
    }
  } catch (err) {
    console.error('Erro ao sincronizar dados locais para o Firestore:', err);
  }
  return result;
}

// Carregamento inicial direto de todas as coleções do Firestore
export async function fetchRemoteCollectionsOnce(): Promise<{
  incomes: Income[];
  expenses: Expense[];
  bills: Bill[];
  priorities: MarketPriorityItem[];
  trips: MarketTrip[];
}> {
  const result = {
    incomes: [] as Income[],
    expenses: [] as Expense[],
    bills: [] as Bill[],
    priorities: [] as MarketPriorityItem[],
    trips: [] as MarketTrip[],
  };

  try {
    const [incSnap, expSnap, billSnap, prioSnap, tripSnap] = await Promise.all([
      getDocs(collection(db, 'incomes')),
      getDocs(collection(db, 'expenses')),
      getDocs(collection(db, 'bills')),
      getDocs(collection(db, 'marketPriorities')),
      getDocs(collection(db, 'marketTrips')),
    ]);

    incSnap.forEach((docSnap) => {
      const d = docSnap.data();
      result.incomes.push({
        id: d.id,
        description: d.description,
        amount: Number(d.amount),
        date: d.date,
        userId: d.userId,
        category: d.category,
        receiptImage: d.receiptImage,
        createdAt: d.createdAt,
      });
    });

    expSnap.forEach((docSnap) => {
      const d = docSnap.data();
      result.expenses.push({
        id: d.id,
        description: d.description,
        amount: Number(d.amount),
        date: d.date,
        userId: d.userId,
        category: d.category,
        type: d.type,
        paymentMethod: d.paymentMethod,
        dueDay: d.dueDay,
        durationMonths: d.durationMonths === 'indefinite' ? 'indefinite' : (d.durationMonths ? Number(d.durationMonths) : undefined),
        fixedEndDate: d.fixedEndDate,
        barcodeOrPix: d.barcodeOrPix,
        isNextMonthInvoice: d.isNextMonthInvoice,
        createdAt: d.createdAt,
      });
    });

    billSnap.forEach((docSnap) => {
      const d = docSnap.data();
      result.bills.push({
        id: d.id,
        name: d.name,
        amount: Number(d.amount),
        dueDate: d.dueDate,
        barcodeOrPix: d.barcodeOrPix,
        isPaid: Boolean(d.isPaid),
        paidAt: d.paidAt,
        category: d.category,
        userId: d.userId,
        isInstallment: d.isInstallment,
        installmentCurrent: d.installmentCurrent,
        installmentTotal: d.installmentTotal,
        installmentAmount: d.installmentAmount,
        originalInstallmentId: d.originalInstallmentId,
        createdAt: d.createdAt,
      });
    });

    prioSnap.forEach((docSnap) => {
      const d = docSnap.data();
      result.priorities.push({
        id: d.id,
        name: d.name,
        category: d.category,
        quantity: d.quantity,
        isCompleted: Boolean(d.isCompleted),
        estimatedPrice: d.estimatedPrice !== undefined ? Number(d.estimatedPrice) : undefined,
        addedBy: d.addedBy,
        month: d.month,
        createdAt: d.createdAt,
      });
    });

    tripSnap.forEach((docSnap) => {
      const d = docSnap.data();
      result.trips.push({
        id: d.id,
        date: d.date,
        month: d.month,
        supermarketName: d.supermarketName,
        totalAmount: Number(d.totalAmount),
        items: d.items || [],
        notes: d.notes,
        syncedToFinance: d.syncedToFinance,
        createdAt: d.createdAt,
      });
    });
  } catch (err) {
    console.error('Erro ao buscar dados remotos do Firestore:', err);
  }

  return result;
}
