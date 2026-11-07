import { Bill, Expense, Income, MarketPriorityItem, MarketTrip, UserName } from '../types';

const STORAGE_KEYS = {
  USER: 'souza_logged_user',
  INCOMES: 'souza_incomes_v2',
  EXPENSES: 'souza_expenses_v2',
  BILLS: 'souza_bills_v2',
  PRIORITIES: 'souza_market_priorities_v2',
  MARKET_TRIPS: 'souza_market_trips_v2',
};

export const FIXED_USERS = {
  Mafran: {
    name: 'Mafran' as UserName,
    displayName: 'Mafran Souza',
    password: '96035060',
    avatarColor: 'from-emerald-500 to-teal-700',
    role: 'Administrador Familiar',
  },
  Naiely: {
    name: 'Naiely' as UserName,
    displayName: 'Naiely Souza',
    password: 'Nah22',
    avatarColor: 'from-purple-500 to-pink-600',
    role: 'Gestora Familiar',
  },
};

// Autenticação fixa solicitada
export function authenticateUser(username: string, password: string): UserName | null {
  const cleanUser = username.trim();
  if (cleanUser.toLowerCase() === 'mafran' && password === FIXED_USERS.Mafran.password) {
    return 'Mafran';
  }
  if (cleanUser.toLowerCase() === 'naiely' && password === FIXED_USERS.Naiely.password) {
    return 'Naiely';
  }
  return null;
}

export function getStoredUser(): UserName | null {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.USER);
    if (val === 'Mafran' || val === 'Naiely') return val;
    return null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserName | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (e) {
    console.error('Failed to set stored user', e);
  }
}

// REGRA CRÍTICA DE PRIVACIDADE:
// - O que Mafran lançar, SOMENTE Mafran pode ver. Naiely NÃO pode ver.
// - O que Naiely lançar, Mafran PODE ver (e Naiely vê o seu próprio).
export function filterIncomesByPrivacy(incomes: Income[], viewer: UserName): Income[] {
  return incomes.filter((item) => {
    if (item.userId === 'Mafran') {
      return viewer === 'Mafran';
    }
    if (item.userId === 'Naiely') {
      return true; // Mafran vê e Naiely vê
    }
    return false;
  });
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Error parsing ${key} from storage:`, e);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export function getIncomes(): Income[] {
  return getFromStorage<Income[]>(STORAGE_KEYS.INCOMES, []);
}

export function saveIncomes(incomes: Income[]): void {
  setToStorage(STORAGE_KEYS.INCOMES, incomes);
}

export function getExpenses(): Expense[] {
  return getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
}

export function saveExpenses(expenses: Expense[]): void {
  setToStorage(STORAGE_KEYS.EXPENSES, expenses);
}

export function getBills(): Bill[] {
  return getFromStorage<Bill[]>(STORAGE_KEYS.BILLS, []);
}

export function saveBills(bills: Bill[]): void {
  setToStorage(STORAGE_KEYS.BILLS, bills);
}

export function getMarketPriorities(): MarketPriorityItem[] {
  return getFromStorage<MarketPriorityItem[]>(STORAGE_KEYS.PRIORITIES, []);
}

export function saveMarketPriorities(priorities: MarketPriorityItem[]): void {
  setToStorage(STORAGE_KEYS.PRIORITIES, priorities);
}

export function getMarketTrips(): MarketTrip[] {
  return getFromStorage<MarketTrip[]>(STORAGE_KEYS.MARKET_TRIPS, []);
}

export function saveMarketTrips(trips: MarketTrip[]): void {
  setToStorage(STORAGE_KEYS.MARKET_TRIPS, trips);
}

// Limpa qualquer dado fake ou cache antigo da versão v1
export function purgeOldMockData(): void {
  try {
    const oldKeys = [
      'souza_initialized_v1',
      'souza_incomes_v1',
      'souza_expenses_v1',
      'souza_bills_v1',
      'souza_market_priorities_v1',
      'souza_market_trips_v1',
    ];
    oldKeys.forEach((key) => localStorage.removeItem(key));
  } catch (err) {
    console.error('Error purging old mock data:', err);
  }
}

export function clearAllData(): void {
  saveIncomes([]);
  saveExpenses([]);
  saveBills([]);
  saveMarketPriorities([]);
  saveMarketTrips([]);
  purgeOldMockData();
}
