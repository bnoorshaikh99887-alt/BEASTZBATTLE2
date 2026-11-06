import { Tournament, User } from '../types';

export const MIN_DEPOSIT_AMOUNT = 10;
export const MAX_DEPOSIT_AMOUNT = 50000;
export const MIN_WITHDRAW_AMOUNT = 50;
export const MAX_WITHDRAW_AMOUNT = 25000;

/**
 * Validates a deposit amount.
 */
export function validateDeposit(amount: number): { valid: boolean; error?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Please enter a valid deposit amount.' };
  }
  if (amount < MIN_DEPOSIT_AMOUNT) {
    return { valid: false, error: `Minimum deposit amount is ₹${MIN_DEPOSIT_AMOUNT}.` };
  }
  if (amount > MAX_DEPOSIT_AMOUNT) {
    return { valid: false, error: `Maximum deposit per transaction is ₹${MAX_DEPOSIT_AMOUNT}.` };
  }
  return { valid: true };
}

/**
 * Validates a withdrawal request against user balance and limits.
 */
export function validateWithdrawal(
  amount: number,
  currentBalance: number,
  upiOrBankId: string
): { valid: boolean; error?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Please enter a valid withdrawal amount.' };
  }
  if (amount < MIN_WITHDRAW_AMOUNT) {
    return { valid: false, error: `Minimum withdrawal amount is ₹${MIN_WITHDRAW_AMOUNT}.` };
  }
  if (amount > MAX_WITHDRAW_AMOUNT) {
    return { valid: false, error: `Maximum withdrawal limit is ₹${MAX_WITHDRAW_AMOUNT}.` };
  }
  if (amount > currentBalance) {
    return { valid: false, error: `Insufficient Current Balance! You have ₹${currentBalance.toFixed(2)}.` };
  }
  if (!upiOrBankId || upiOrBankId.trim().length < 4) {
    return { valid: false, error: 'Please provide a valid UPI ID or Bank Account.' };
  }
  return { valid: true };
}

/**
 * Calculates remaining available slots.
 */
export function calculateSlotsLeft(total: number, filled: number): number {
  return Math.max(0, total - filled);
}

/**
 * Validates if a user can join a specific tournament.
 */
export function canJoinTournament(
  tournament: Tournament,
  user: User
): { canJoin: boolean; reason?: string } {
  if (tournament.status === 'completed') {
    return { canJoin: false, reason: 'This tournament has already concluded.' };
  }
  if (user.joinedMatches.includes(tournament.id)) {
    return { canJoin: false, reason: 'You have already registered for this tournament.' };
  }
  if (tournament.filledSlots >= tournament.totalSlots) {
    return { canJoin: false, reason: 'All tournament slots are filled! Match is full.' };
  }
  const totalUsableBalance = user.currentBalance + user.bonusBalance;
  if (tournament.entryFee > 0 && totalUsableBalance < tournament.entryFee) {
    return {
      canJoin: false,
      reason: `Insufficient balance! Entry fee is ₹${tournament.entryFee}, your total balance is ₹${totalUsableBalance.toFixed(2)}. Please deposit cash.`,
    };
  }
  return { canJoin: true };
}

/**
 * Filters tournaments based on category pill, game filter, and search query.
 */
export function filterTournaments(
  tournaments: Tournament[],
  categoryPill: string,
  gameFilter: string,
  searchQuery: string
): Tournament[] {
  return tournaments.filter((tournament) => {
    // Game filter
    if (gameFilter !== 'ALL' && tournament.game !== gameFilter) {
      return false;
    }

    // Category pill filter (e.g. 'ALL MATCHES', 'SOLO BR', 'SQUAD BR', 'DUO BR', 'TDM 4V4', 'CLASH SQUAD')
    if (categoryPill !== 'ALL MATCHES' && tournament.mode !== categoryPill) {
      return false;
    }

    // Search query
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = tournament.title.toLowerCase().includes(q);
      const matchMap = tournament.map.toLowerCase().includes(q);
      const matchGame = tournament.game.toLowerCase().includes(q);
      const matchMode = tournament.mode.toLowerCase().includes(q);
      const matchNo = tournament.matchNo.toLowerCase().includes(q);
      return matchTitle || matchMap || matchGame || matchMode || matchNo;
    }

    return true;
  });
}

/**
 * Validates private room code for joining private tournaments.
 */
export function validatePrivateCode(
  code: string,
  tournaments: Tournament[]
): Tournament | null {
  const normalizedCode = code.trim().toUpperCase();
  const match = tournaments.find(
    (t) => t.isPrivate && t.privateCode && t.privateCode.toUpperCase() === normalizedCode
  );
  return match || null;
}
