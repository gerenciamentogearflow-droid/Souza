export function formatCurrency(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function formatMonthName(monthStr: string): string {
  // input: "2026-11"
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [year, month] = monthStr.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mIndex = parseInt(month, 10) - 1;
  if (mIndex >= 0 && mIndex < 12) {
    return `${monthNames[mIndex]} de ${year}`;
  }
  return monthStr;
}

export function getCurrentMonthStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextMonthStr(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return getCurrentMonthStr();
  const [yearStr, mStr] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(mStr, 10) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getPreviousMonthStr(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return getCurrentMonthStr();
  const [yearStr, mStr] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(mStr, 10) - 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getBillDueStatus(dueDateStr: string, isPaid: boolean): {
  status: 'paid' | 'today' | 'overdue' | 'future';
  label: string;
  badgeClass: string;
} {
  if (isPaid) {
    return {
      status: 'paid',
      label: 'Pago',
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
  }

  const todayStr = getTodayDateStr();
  if (dueDateStr === todayStr) {
    return {
      status: 'today',
      label: 'Vence Hoje',
      badgeClass: 'text-amber-300 bg-amber-500/15 border-amber-500/30 font-semibold',
    };
  } else if (dueDateStr < todayStr) {
    return {
      status: 'overdue',
      label: 'Atrasada',
      badgeClass: 'text-rose-400 bg-rose-500/15 border-rose-500/30 font-semibold',
    };
  } else {
    // Calculando dias restantes
    const dueTime = new Date(dueDateStr + 'T00:00:00').getTime();
    const todayTime = new Date(todayStr + 'T00:00:00').getTime();
    const diffDays = Math.ceil((dueTime - todayTime) / (1000 * 60 * 60 * 24));
    return {
      status: 'future',
      label: `Vence em ${diffDays} dias`,
      badgeClass: 'text-slate-300 bg-slate-800/80 border-slate-700',
    };
  }
}
