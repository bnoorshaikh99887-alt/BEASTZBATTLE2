export const validateDeposit = (amount: number) => {
  if (!amount || amount <= 0) return { valid: false, error: 'Enter a valid amount' };
  return { valid: true };
};

export const validateWithdrawal = (amount: number, balance: number, upi: string) => {
  if (!amount || amount <= 0) return { valid: false, error: 'Enter a valid amount' };
  if (amount > balance) return { valid: false, error: 'Insufficient balance' };
  if (!upi || upi.trim().length < 3) return { valid: false, error: 'Enter valid UPI ID or Bank details' };
  return { valid: true };
};

export const canJoinTournament = (tournament: any, user: any) => {
  if (tournament.filledSlots >= tournament.totalSlots) {
    return { canJoin: false, reason: 'Tournament is already full' };
  }
  const totalBal = (user.currentBalance || 0) + (user.bonusBalance || 0);
  if (totalBal < tournament.entryFee) {
    return { canJoin: false, reason: 'Insufficient wallet balance' };
  }
  return { canJoin: true };
};

export const validatePrivateCode = (code: string, tournaments: any[]) => {
  if (!code) return null;
  const cleanCode = code.trim().toLowerCase();
  return tournaments.find(
    (t) => t.id.toLowerCase() === cleanCode || (t.roomPassword && t.roomPassword.toLowerCase() === cleanCode)
  );
};

export const filterTournaments = (items: any[], category?: string, game?: string, search?: string) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    if (category && category !== 'ALL MATCHES' && item.category !== category) {
      return false;
    }
    if (game && game !== 'ALL' && item.game !== game) {
      return false;
    }
    return true;
  });
};
