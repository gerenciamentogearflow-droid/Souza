import { Bill, Expense, Income, MarketPriorityItem, MarketTrip, UserName } from '../types';

const STORAGE_KEYS = {
  USER: 'souza_logged_user',
  INCOMES: 'souza_incomes_v2',
  EXPENSES: 'souza_expenses_v2',
  BILLS: 'souza_bills_v2',
  PRIORITIES: 'souza_market_priorities_v2',
  MARKET_TRIPS: 'souza_market_trips_v2',
  EXPENSES_BACKUP: 'souza_expenses_backup',
  BILLS_BACKUP: 'souza_bills_backup',
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

export function filterIncomesByPrivacy(incomes: Income[], viewer: UserName): Income[] {
  return incomes.filter((item) => {
    if (item.userId === 'Mafran') {
      return viewer === 'Mafran';
    }
    if (item.userId === 'Naiely') {
      return true;
    }
    return false;
  });
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item) as T;
    return parsed;
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
  if (expenses.length > 0) {
    setToStorage(STORAGE_KEYS.EXPENSES_BACKUP, expenses);
  }
}

export function getBills(): Bill[] {
  return getFromStorage<Bill[]>(STORAGE_KEYS.BILLS, []);
}

export function saveBills(bills: Bill[]): void {
  setToStorage(STORAGE_KEYS.BILLS, bills);
  if (bills.length > 0) {
    setToStorage(STORAGE_KEYS.BILLS_BACKUP, bills);
  }
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

export interface DiscoveredCacheBackup {
  storageKey: string;
  source: 'localStorage' | 'sessionStorage';
  itemCount: number;
  totalAmount: number;
  sampleDescriptions: string[];
  data: any[];
}

// Varre todas as chaves do navegador em busca de edições salvas anteriormente
export function scanBrowserStorageForBackups(): DiscoveredCacheBackup[] {
  const discovered: DiscoveredCacheBackup[] = [];

  const checkStorage = (storage: Storage, source: 'localStorage' | 'sessionStorage') => {
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;
        const val = storage.getItem(key);
        if (!val || (!val.startsWith('[') && !val.startsWith('{'))) continue;

        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Verifica se parece com lista de despesas ou contas
            const isExpensesOrBills = parsed.some(
              (item) => item && typeof item === 'object' && ('amount' in item || 'description' in item || 'name' in item)
            );

            if (isExpensesOrBills) {
              const totalAmount = parsed.reduce(
                (sum, item) => sum + (Number(item.amount) || 0),
                0
              );
              const sampleDescriptions = parsed
                .slice(0, 5)
                .map((item) => item.description || item.name || 'Sem nome');

              discovered.push({
                storageKey: key,
                source,
                itemCount: parsed.length,
                totalAmount,
                sampleDescriptions,
                data: parsed,
              });
            }
          }
        } catch {
          // Ignora se não for JSON válido
        }
      }
    } catch (e) {
      console.warn('Erro ao escanear armazenamento local:', e);
    }
  };

  if (typeof window !== 'undefined') {
    if (window.localStorage) checkStorage(window.localStorage, 'localStorage');
    if (window.sessionStorage) checkStorage(window.sessionStorage, 'sessionStorage');
  }

  return discovered;
}

export function clearAllData(): void {
  saveIncomes([]);
  saveExpenses([]);
  saveBills([]);
  saveMarketPriorities([]);
  saveMarketTrips([]);
  try {
    localStorage.removeItem(STORAGE_KEYS.EXPENSES_BACKUP);
    localStorage.removeItem(STORAGE_KEYS.BILLS_BACKUP);
  } catch {}
}

export function purgeOldMockData(): void {
  // Mantém backups seguros no navegador
}
