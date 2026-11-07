import React, { useState, useEffect } from 'react';
import { Bill, Expense, Income, MarketPriorityItem, MarketTrip, UserName } from './types';
import {
  getBills,
  getExpenses,
  getIncomes,
  getMarketPriorities,
  getMarketTrips,
  getStoredUser,
  purgeOldMockData,
  clearAllData,
  setStoredUser,
  saveExpenses,
  saveBills,
  saveIncomes,
  saveMarketPriorities,
  saveMarketTrips,
} from './utils/storage';
import { getCurrentMonthStr } from './utils/formatters';
import { LoginScreen } from './components/LoginScreen';
import { TopBar } from './components/TopBar';
import { HomeScreen } from './components/HomeScreen';
import { FinancialModule } from './components/financial/FinancialModule';
import { MarketModule } from './components/market/MarketModule';
import { BottomNav, MainNavTab } from './components/BottomNav';
import { auth, loginWithGoogle, onAuthStateChanged, type User } from './utils/firebase';
import {
  subscribeIncomes,
  subscribeExpenses,
  subscribeBills,
  subscribeMarketPriorities,
  subscribeMarketTrips,
  syncLocalStorageToFirestore,
  syncExpensesCollection,
  syncBillsCollection,
  syncIncomesCollection,
  syncPrioritiesCollection,
  syncTripsCollection,
} from './utils/firestoreService';
import { Cloud, Database, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserName | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isConnectingCloud, setIsConnectingCloud] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // App data states
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [marketPriorities, setMarketPriorities] = useState<MarketPriorityItem[]>([]);
  const [marketTrips, setMarketTrips] = useState<MarketTrip[]>([]);

  // Navigation
  const [currentScreen, setCurrentScreen] = useState<'home' | 'financial' | 'market'>('home');
  const [financialSubTab, setFinancialSubTab] = useState<'summary' | 'incomes' | 'expenses' | 'bills'>('summary');
  const [marketSubTab, setMarketSubTab] = useState<'calculator' | 'priorities' | 'history'>('calculator');

  // Month
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());

  // Carrega dados iniciais e sessão do localStorage (salvamento automático local)
  useEffect(() => {
    purgeOldMockData();
    loadAllLocalData();
    const stored = getStoredUser();
    if (stored) {
      setCurrentUser(stored);
    }
    setIsInitialized(true);

    // Observador de Autenticação Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          await syncLocalStorageToFirestore(user.uid);
        } catch (e) {
          console.error('Falha ao sincronizar dados:', e);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Assinatura em tempo real no Firestore quando o usuário está autenticado
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubIncomes = subscribeIncomes(firebaseUser.uid, (remoteIncomes) => {
      setIncomes(remoteIncomes);
    });

    const unsubExpenses = subscribeExpenses(firebaseUser.uid, (remoteExpenses) => {
      setExpenses(remoteExpenses);
    });

    const unsubBills = subscribeBills(firebaseUser.uid, (remoteBills) => {
      setBills(remoteBills);
    });

    const unsubPriorities = subscribeMarketPriorities(firebaseUser.uid, (remotePriorities) => {
      setMarketPriorities(remotePriorities);
    });

    const unsubTrips = subscribeMarketTrips(firebaseUser.uid, (remoteTrips) => {
      setMarketTrips(remoteTrips);
    });

    return () => {
      unsubIncomes();
      unsubExpenses();
      unsubBills();
      unsubPriorities();
      unsubTrips();
    };
  }, [firebaseUser]);

  const loadAllLocalData = () => {
    setExpenses(getExpenses());
    setBills(getBills());
    setIncomes(getIncomes());
    setMarketPriorities(getMarketPriorities());
    setMarketTrips(getMarketTrips());
  };

  const handleConnectCloud = async () => {
    try {
      setIsConnectingCloud(true);
      const user = await loginWithGoogle();
      setFirebaseUser(user);
      await syncLocalStorageToFirestore(user.uid);
    } catch (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
    } finally {
      setIsConnectingCloud(false);
    }
  };

  const handleSyncNow = async () => {
    if (!firebaseUser) return;
    try {
      setIsSyncing(true);
      await syncLocalStorageToFirestore(firebaseUser.uid);
    } catch (err) {
      console.error('Erro na sincronização manual:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Mutadores seguros com sincronização dupla: Firestore na Nuvem + LocalStorage
  const handleUpdateExpenses = (newExpenses: Expense[]) => {
    const prev = expenses;
    setExpenses(newExpenses);
    saveExpenses(newExpenses);
    if (firebaseUser) {
      syncExpensesCollection(newExpenses, prev, firebaseUser.uid).catch((err) => {
        console.error('Erro ao persistir despesas no Firestore:', err);
      });
    }
  };

  const handleUpdateBills = (newBills: Bill[]) => {
    const prev = bills;
    setBills(newBills);
    saveBills(newBills);
    if (firebaseUser) {
      syncBillsCollection(newBills, prev, firebaseUser.uid).catch((err) => {
        console.error('Erro ao persistir contas no Firestore:', err);
      });
    }
  };

  const handleUpdateIncomes = (newIncomes: Income[]) => {
    const prev = incomes;
    setIncomes(newIncomes);
    saveIncomes(newIncomes);
    if (firebaseUser) {
      syncIncomesCollection(newIncomes, prev, firebaseUser.uid).catch((err) => {
        console.error('Erro ao persistir receitas no Firestore:', err);
      });
    }
  };

  const handleUpdatePriorities = (newPriorities: MarketPriorityItem[]) => {
    const prev = marketPriorities;
    setMarketPriorities(newPriorities);
    saveMarketPriorities(newPriorities);
    if (firebaseUser) {
      syncPrioritiesCollection(newPriorities, prev, firebaseUser.uid).catch((err) => {
        console.error('Erro ao persistir prioridades no Firestore:', err);
      });
    }
  };

  const handleUpdateTrips = (newTrips: MarketTrip[]) => {
    const prev = marketTrips;
    setMarketTrips(newTrips);
    saveMarketTrips(newTrips);
    if (firebaseUser) {
      syncTripsCollection(newTrips, prev, firebaseUser.uid).catch((err) => {
        console.error('Erro ao persistir compras no Firestore:', err);
      });
    }
  };

  const handleLoginSuccess = (user: UserName) => {
    setCurrentUser(user);
    setStoredUser(user);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStoredUser(null);
    setCurrentScreen('home');
  };

  const handleSwitchUser = (newUser: UserName) => {
    setCurrentUser(newUser);
    setStoredUser(newUser);
  };

  const handleResetData = () => {
    clearAllData();
    loadAllLocalData();
  };

  const handleNavigateToFinancial = (subTab?: 'summary' | 'incomes' | 'expenses' | 'bills') => {
    if (subTab) setFinancialSubTab(subTab);
    setCurrentScreen('financial');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToMarket = (subTab?: 'calculator' | 'priorities' | 'history') => {
    if (subTab) setMarketSubTab(subTab);
    setCurrentScreen('market');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBottomNavChange = (tab: MainNavTab) => {
    if (tab === 'home') {
      setCurrentScreen('home');
    } else if (tab === 'financial') {
      setFinancialSubTab('summary');
      setCurrentScreen('financial');
    } else if (tab === 'bills') {
      setFinancialSubTab('bills');
      setCurrentScreen('financial');
    } else if (tab === 'market') {
      setCurrentScreen('market');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400 text-xs">
        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin mr-2" />
        Carregando Souza Gestão e Banco de Dados...
      </div>
    );
  }

  // Se não estiver logado, exibe tela de login fixo (Mafran / Naiely) com status do Banco
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        firebaseUser={firebaseUser}
        onConnectCloud={handleConnectCloud}
        isConnectingCloud={isConnectingCloud}
      />
    );
  }

  const pendingBillsCount = bills.filter((b) => !b.isPaid).length;

  let activeNavTab: MainNavTab = 'home';
  if (currentScreen === 'home') activeNavTab = 'home';
  else if (currentScreen === 'market') activeNavTab = 'market';
  else if (currentScreen === 'financial') {
    activeNavTab = financialSubTab === 'bills' ? 'bills' : 'financial';
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col">
      {/* Top Bar Fixa com Identificação do Usuário e Status do Banco Firestore */}
      <TopBar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onResetData={handleResetData}
        firebaseUser={firebaseUser}
        onConnectCloud={handleConnectCloud}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
      />



      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-20">
        {currentScreen === 'home' && (
          <HomeScreen
            currentUser={currentUser}
            expenses={expenses}
            bills={bills}
            incomes={incomes}
            marketPriorities={marketPriorities}
            marketTrips={marketTrips}
            selectedMonth={selectedMonth}
            onNavigateToFinancial={handleNavigateToFinancial}
            onNavigateToMarket={handleNavigateToMarket}
          />
        )}

        {currentScreen === 'financial' && (
          <FinancialModule
            currentUser={currentUser}
            expenses={expenses}
            bills={bills}
            incomes={incomes}
            onUpdateExpenses={handleUpdateExpenses}
            onUpdateBills={handleUpdateBills}
            onUpdateIncomes={handleUpdateIncomes}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onBackToHome={() => setCurrentScreen('home')}
            initialSubTab={financialSubTab}
          />
        )}

        {currentScreen === 'market' && (
          <MarketModule
            currentUser={currentUser}
            marketPriorities={marketPriorities}
            marketTrips={marketTrips}
            expenses={expenses}
            onUpdatePriorities={handleUpdatePriorities}
            onUpdateTrips={handleUpdateTrips}
            onUpdateExpenses={handleUpdateExpenses}
            selectedMonth={selectedMonth}
            onBackToHome={() => setCurrentScreen('home')}
            initialSubTab={marketSubTab}
          />
        )}
      </main>

      {/* Navegação Inferior para Polegar no Celular */}
      <BottomNav
        activeTab={activeNavTab}
        onChangeTab={handleBottomNavChange}
        pendingBillsCount={pendingBillsCount}
      />
    </div>
  );
}
