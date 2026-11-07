import React, { useState, useEffect, useRef } from 'react';
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
import { CacheRecoveryModal } from './components/CacheRecoveryModal';
import { testConnection } from './utils/firebase';
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
  clearAllFirestoreDocs,
} from './utils/firestoreService';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserName | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cloud Database Status
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // App data states (in-memory + cached in localStorage + synchronized with Firestore)
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

  // 1. Carregamento inicial do cache local e verificação de sessão
  useEffect(() => {
    purgeOldMockData();
    loadAllLocalData();
    const stored = getStoredUser();
    if (stored) {
      setCurrentUser(stored);
    }
    setIsInitialized(true);
  }, []);

  // 2. Conexão em tempo real com o Firestore na Nuvem (ativo para todos os dispositivos)
  useEffect(() => {
    let isSubscribed = true;

    // Testa conectividade inicial com o Firestore
    testConnection()
      .then(() => {
        if (isSubscribed) setIsCloudConnected(true);
      })
      .catch((err) => {
        console.warn('Conexão offline ou falha:', err);
        if (isSubscribed) setIsCloudConnected(false);
      });

    // Inicia assinaturas em tempo real em todas as coleções familiares
    const unsubIncomes = subscribeIncomes(
      (remoteIncomes) => {
        if (!isSubscribed) return;
        setIncomes(remoteIncomes);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    const unsubExpenses = subscribeExpenses(
      (remoteExpenses) => {
        if (!isSubscribed) return;
        setExpenses(remoteExpenses);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    const unsubBills = subscribeBills(
      (remoteBills) => {
        if (!isSubscribed) return;
        setBills(remoteBills);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    const unsubPriorities = subscribeMarketPriorities(
      (remotePriorities) => {
        if (!isSubscribed) return;
        setMarketPriorities(remotePriorities);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    const unsubTrips = subscribeMarketTrips(
      (remoteTrips) => {
        if (!isSubscribed) return;
        setMarketTrips(remoteTrips);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    return () => {
      isSubscribed = false;
      unsubIncomes();
      unsubExpenses();
      unsubBills();
      unsubPriorities();
      unsubTrips();
    };
  }, []);

  const loadAllLocalData = () => {
    setExpenses(getExpenses());
    setBills(getBills());
    setIncomes(getIncomes());
    setMarketPriorities(getMarketPriorities());
    setMarketTrips(getMarketTrips());
  };

  // Força upload de dados deste dispositivo para a nuvem
  const handleForceSyncToCloud = async () => {
    try {
      setIsSyncing(true);
      setSyncFeedback(null);
      const res = await syncLocalStorageToFirestore();
      setSyncFeedback(`Sincronizado! ${res.expenses + res.bills + res.incomes + res.priorities + res.trips} itens salvos na nuvem.`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err) {
      console.error('Erro no upload para a nuvem:', err);
      setSyncFeedback('Erro ao conectar ao banco de dados.');
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const [showCacheRecovery, setShowCacheRecovery] = useState(false);

  const handleDataRestored = (restoredExpenses: Expense[], restoredBills?: Bill[]) => {
    if (restoredExpenses && restoredExpenses.length > 0) {
      setExpenses(restoredExpenses);
    }
    if (restoredBills && restoredBills.length > 0) {
      setBills(restoredBills);
    }
    setSyncFeedback('Dados do cache restaurados e sincronizados com a nuvem!');
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Mutadores com sincronização bidirecional em tempo real:
  // Salva no Firestore na nuvem E atualiza cache local imediatamente
  const handleUpdateExpenses = (newExpenses: Expense[]) => {
    const prev = expenses;
    setExpenses(newExpenses);
    saveExpenses(newExpenses);
    syncExpensesCollection(newExpenses, prev).catch((err) => {
      console.error('Erro ao persistir despesas no Firestore:', err);
    });
  };

  const handleUpdateBills = (newBills: Bill[]) => {
    const prev = bills;
    setBills(newBills);
    saveBills(newBills);
    syncBillsCollection(newBills, prev).catch((err) => {
      console.error('Erro ao persistir contas no Firestore:', err);
    });
  };

  const handleUpdateIncomes = (newIncomes: Income[]) => {
    const prev = incomes;
    setIncomes(newIncomes);
    saveIncomes(newIncomes);
    syncIncomesCollection(newIncomes, prev).catch((err) => {
      console.error('Erro ao persistir receitas no Firestore:', err);
    });
  };

  const handleUpdatePriorities = (newPriorities: MarketPriorityItem[]) => {
    const prev = marketPriorities;
    setMarketPriorities(newPriorities);
    saveMarketPriorities(newPriorities);
    syncPrioritiesCollection(newPriorities, prev).catch((err) => {
      console.error('Erro ao persistir prioridades no Firestore:', err);
    });
  };

  const handleUpdateTrips = (newTrips: MarketTrip[]) => {
    const prev = marketTrips;
    setMarketTrips(newTrips);
    saveMarketTrips(newTrips);
    syncTripsCollection(newTrips, prev).catch((err) => {
      console.error('Erro ao persistir compras no Firestore:', err);
    });
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

  const handleResetData = async () => {
    try {
      setIsSyncing(true);
      clearAllData();
      await clearAllFirestoreDocs();
      setExpenses([]);
      setBills([]);
      setIncomes([]);
      setMarketPriorities([]);
      setMarketTrips([]);
      setSyncFeedback('Todas as contas foram apagadas do app e da nuvem!');
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err) {
      console.error('Erro ao resetar dados:', err);
    } finally {
      setIsSyncing(false);
    }
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
        Carregando Souza Gestão e Banco de Dados na Nuvem...
      </div>
    );
  }

  // Se não estiver logado, exibe tela de login fixo (Mafran / Naiely)
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        isCloudConnected={isCloudConnected}
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
      {/* Top Bar Fixa com Identificação do Usuário e Status do Banco na Nuvem */}
      <TopBar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onResetData={handleResetData}
        isCloudConnected={isCloudConnected}
        onForceSyncToCloud={handleForceSyncToCloud}
        onOpenCacheRecovery={() => setShowCacheRecovery(true)}
        isSyncing={isSyncing}
        syncFeedback={syncFeedback}
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

      {/* Modal de Recuperação de Cache do Aparelho */}
      <CacheRecoveryModal
        isOpen={showCacheRecovery}
        onClose={() => setShowCacheRecovery(false)}
        onDataRestored={handleDataRestored}
      />
    </div>
  );
}
