export type UserName = 'Mafran' | 'Naiely';

export interface UserProfile {
  name: UserName;
  displayName: string;
  avatarColor: string;
  role: string;
}

export type PaymentMethod = 'Pix' | 'Dinheiro' | 'Débito' | 'Crédito';
export type ExpenseCategory = 'Família' | 'Individual';
export type ExpenseType = 'Fixo' | 'Variável';

// Regra de privacidade:
// - O que Mafran lança: SOMENTE Mafran pode ver (Naiely NÃO vê).
// - O que Naiely lança: Mafran PODE ver (e Naiely também vê o seu próprio).
export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  userId: UserName; // Quem lançou
  category?: string;
  receiptImage?: string; // Base64 data URL
  createdAt: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  userId: UserName; // Quem gastou: Mafran ou Naiely
  category: ExpenseCategory; // 'Família' | 'Individual'
  type: ExpenseType; // 'Fixo' | 'Variável'
  paymentMethod: PaymentMethod;
  // Campos específicos para fixos
  dueDay?: number; // Dia de vencimento (1 a 31)
  durationMonths?: number | 'indefinite'; // Quantidade de meses ou indeterminado
  fixedEndDate?: string; // Mês limite se especificado
  barcodeOrPix?: string; // Dados para pagamento (Código de barras, boleto ou Pix)
  isNextMonthInvoice?: boolean; // Se for crédito, cai na fatura do mês seguinte
  createdAt: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  barcodeOrPix?: string;
  isPaid: boolean;
  paidAt?: string;
  category: ExpenseCategory;
  userId?: UserName;
  isInstallment?: boolean;
  installmentCurrent?: number; // Ex: 3
  installmentTotal?: number; // Ex: 12
  installmentAmount?: number; // Ex: 243.00
  originalInstallmentId?: string;
  createdAt?: number;
}

export interface MarketPriorityItem {
  id: string;
  name: string;
  category: string;
  quantity?: string;
  isCompleted: boolean;
  estimatedPrice?: number;
  addedBy: UserName;
  month: string; // YYYY-MM
  createdAt?: number;
}

export interface CartLiveItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface MarketTrip {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  supermarketName: string;
  totalAmount: number;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  notes?: string;
  syncedToFinance?: boolean;
  createdAt: number;
}
