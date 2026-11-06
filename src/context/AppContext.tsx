import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tournament, Transaction, User, StoreItem, LeaderboardUser } from '../types';
import {
  INITIAL_USER,
  INITIAL_ADMIN_USER,
  INITIAL_TOURNAMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_STORE_ITEMS,
  INITIAL_LEADERBOARD,
} from '../data/mockData';
import {
  validateDeposit,
  validateWithdrawal,
  canJoinTournament,
  validatePrivateCode,
} from '../utils/tournamentRules';
import confetti from 'canvas-confetti';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Theme & Nav
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: 'home' | 'my-matches' | 'store' | 'leaderboard' | 'me';
  setActiveTab: (tab: 'home' | 'my-matches' | 'store' | 'leaderboard' | 'me') => void;

  // User & Auth
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  switchUserRole: (role: 'user' | 'admin') => void;
  updateUserProfile: (data: Partial<User>) => void;

  // Data
  tournaments: Tournament[];
  transactions: Transaction[];
  storeItems: StoreItem[];
  leaderboard: LeaderboardUser[];

  // Actions
  handleDeposit: (amount: number, upiRef: string, method: string) => { success: boolean; error?: string };
  handleWithdrawal: (amount: number, upiOrBank: string, method: string) => { success: boolean; error?: string };
  handleJoinTournament: (tournamentId: string) => { success: boolean; error?: string };
  handleJoinPrivateMatch: (code: string) => { success: boolean; error?: string; tournament?: Tournament };
  handleBuyStoreItem: (item: StoreItem) => { success: boolean; error?: string; code?: string };

  // Admin Actions
  handleCreateTournament: (newTourn: Omit<Tournament, 'id' | 'filledSlots' | 'status'>) => void;
  handleUpdateRoomDetails: (tournamentId: string, roomId: string, roomPass: string) => void;
  handleUpdateTournamentStatus: (tournamentId: string, status: Tournament['status']) => void;
  handleApproveTransaction: (txId: string) => void;
  handleRejectTransaction: (txId: string) => void;

  // Modals
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  selectedTournamentForJoin: Tournament | null;
  setSelectedTournamentForJoin: (t: Tournament | null) => void;
  isJoinPrivateMatchModalOpen: boolean;
  setIsJoinPrivateMatchModalOpen: (open: boolean) => void;
  selectedTournamentForDetails: Tournament | null;
  setSelectedTournamentForDetails: (t: Tournament | null) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isApkModalOpen: boolean;
  setIsApkModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state - Light mode by default as in Video 2
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('beastz_v2_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('beastz_v2_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Nav state
  const [activeTab, setActiveTab] = useState<'home' | 'my-matches' | 'store' | 'leaderboard' | 'me'>('home');

  // User state
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('beastz_v2_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  useEffect(() => {
    localStorage.setItem('beastz_v2_user', JSON.stringify(user));
  }, [user]);

  // Data states
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem('beastz_v2_tournaments');
    return saved ? JSON.parse(saved) : INITIAL_TOURNAMENTS;
  });

  useEffect(() => {
    localStorage.setItem('beastz_v2_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('beastz_v2_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem('beastz_v2_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const [storeItems] = useState<StoreItem[]>(INITIAL_STORE_ITEMS);
  const [leaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);

  // Modals state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedTournamentForJoin, setSelectedTournamentForJoin] = useState<Tournament | null>(null);
  const [isJoinPrivateMatchModalOpen, setIsJoinPrivateMatchModalOpen] = useState(false);
  const [selectedTournamentForDetails, setSelectedTournamentForDetails] = useState<Tournament | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch role helper
  const switchUserRole = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setUser(INITIAL_ADMIN_USER);
      addToast('Switched to Admin', 'Logged in as Beastz Tournament Administrator', 'info');
    } else {
      setUser(INITIAL_USER);
      addToast('Switched to Player', 'Logged in as Khush Chauhan (BEAST_KHUSH)', 'info');
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...data }));
    addToast('Profile Updated', 'Your profile details have been successfully saved.', 'success');
  };

  // Deposit handler
  const handleDeposit = (amount: number, upiRef: string, method: string) => {
    const check = validateDeposit(amount);
    if (!check.valid) {
      addToast('Deposit Failed', check.error || 'Invalid deposit amount', 'error');
      return { success: false, error: check.error };
    }
    if (!upiRef || upiRef.trim().length < 6) {
      const err = 'Please enter a valid 12-digit UTR or Transaction Reference number';
      addToast('Invalid UTR', err, 'error');
      return { success: false, error: err };
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'deposit',
      amount,
      status: 'completed',
      date: 'Just now',
      description: `Deposit via ${method} (Ref: ${upiRef.trim()})`,
      refId: upiRef.trim(),
      paymentMethod: method,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setUser((prev) => ({
      ...prev,
      currentBalance: prev.currentBalance + amount,
    }));

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Confetti failover
    }

    addToast('Deposit Successful!', `₹${amount.toFixed(2)} added to your Current Balance.`, 'success');
    setIsDepositModalOpen(false);
    return { success: true };
  };

  // Withdrawal handler
  const handleWithdrawal = (amount: number, upiOrBank: string, method: string) => {
    const check = validateWithdrawal(amount, user.currentBalance, upiOrBank);
    if (!check.valid) {
      addToast('Withdrawal Failed', check.error || 'Invalid withdrawal request', 'error');
      return { success: false, error: check.error };
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'withdraw',
      amount,
      status: 'completed',
      date: 'Just now',
      description: `Withdrawal to ${method}: ${upiOrBank}`,
      refId: `WD${Date.now().toString().slice(-8)}`,
      paymentMethod: method,
      upiId: upiOrBank,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setUser((prev) => ({
      ...prev,
      currentBalance: prev.currentBalance - amount,
    }));

    addToast(
      'Withdrawal Processed!',
      `₹${amount.toFixed(2)} sent to ${upiOrBank}. Ref: ${newTx.refId}`,
      'success'
    );
    setIsWithdrawModalOpen(false);
    return { success: true };
  };

  // Join Tournament handler
  const handleJoinTournament = (tournamentId: string) => {
    const tourn = tournaments.find((t) => t.id === tournamentId);
    if (!tourn) {
      addToast('Match Not Found', 'Tournament match could not be found.', 'error');
      return { success: false, error: 'Tournament not found' };
    }

    const check = canJoinTournament(tourn, user);
    if (!check.canJoin) {
      addToast('Cannot Join Match', check.reason || 'Eligibility check failed', 'error');
      return { success: false, error: check.reason };
    }

    // Deduct fee: first from bonus balance if possible, remainder from current
    let remFee = tourn.entryFee;
    let newBonus = user.bonusBalance;
    let newCurrent = user.currentBalance;

    if (newBonus >= remFee) {
      newBonus -= remFee;
      remFee = 0;
    } else {
      remFee -= newBonus;
      newBonus = 0;
      newCurrent -= remFee;
    }

    // Update user
    setUser((prev) => ({
      ...prev,
      bonusBalance: newBonus,
      currentBalance: newCurrent,
      joinedMatches: [...prev.joinedMatches, tournamentId],
      totalMatches: prev.totalMatches + 1,
    }));

    // Update tournament slots
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const joinedPlayers = t.joinedPlayers || [];
          return {
            ...t,
            filledSlots: t.filledSlots + 1,
            joinedPlayers: [
              ...joinedPlayers,
              {
                userId: user.id,
                ign: user.ign,
                slotNo: t.filledSlots + 1,
                joinedAt: 'Just now',
              },
            ],
          };
        }
        return t;
      })
    );

    // Add transaction
    if (tourn.entryFee > 0) {
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'match_fee',
        amount: tourn.entryFee,
        status: 'completed',
        date: 'Just now',
        description: `Entry Fee: ${tourn.title} (${tourn.matchNo})`,
        refId: `JOIN_${tourn.id}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti failover
    }

    addToast(
      'Joined Successfully!',
      `You are registered for ${tourn.title}. Room details are now visible in My Matches.`,
      'success'
    );
    setSelectedTournamentForJoin(null);
    return { success: true };
  };

  // Join Private Match handler
  const handleJoinPrivateMatch = (code: string) => {
    const matchedTournament = validatePrivateCode(code, tournaments);
    if (!matchedTournament) {
      const err = 'Invalid Private Match Code. Please verify with tournament host.';
      addToast('Invalid Room Code', err, 'error');
      return { success: false, error: err };
    }

    // Check if user already in match
    if (user.joinedMatches.includes(matchedTournament.id)) {
      addToast('Already Joined', 'You are already registered for this private match.', 'info');
      setIsJoinPrivateMatchModalOpen(false);
      setSelectedTournamentForDetails(matchedTournament);
      return { success: true, tournament: matchedTournament };
    }

    // Join it
    const joinResult = handleJoinTournament(matchedTournament.id);
    if (joinResult.success) {
      setIsJoinPrivateMatchModalOpen(false);
      setSelectedTournamentForDetails(matchedTournament);
      return { success: true, tournament: matchedTournament };
    } else {
      return { success: false, error: joinResult.error };
    }
  };

  // Buy Store Item
  const handleBuyStoreItem = (item: StoreItem) => {
    if (user.currentBalance < item.price) {
      const err = `Insufficient balance! You need ₹${item.price.toFixed(2)}, current balance is ₹${user.currentBalance.toFixed(2)}.`;
      addToast('Insufficient Funds', err, 'error');
      setIsDepositModalOpen(true);
      return { success: false, error: err };
    }

    const redeemCode = `BZ-${item.category.slice(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    setUser((prev) => ({
      ...prev,
      currentBalance: prev.currentBalance - item.price,
    }));

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'store_purchase',
      amount: item.price,
      status: 'completed',
      date: 'Just now',
      description: `Store Purchase: ${item.name}`,
      refId: redeemCode,
    };
    setTransactions((prev) => [newTx, ...prev]);

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti failover
    }

    addToast(
      'Order Confirmed!',
      `Redeem Code: ${redeemCode} for ${item.name}. Saved in your wallet history.`,
      'success'
    );
    return { success: true, code: redeemCode };
  };

  // Admin: Create tournament
  const handleCreateTournament = (newTourn: Omit<Tournament, 'id' | 'filledSlots' | 'status'>) => {
    const id = `tourn_custom_${Date.now()}`;
    const created: Tournament = {
      ...newTourn,
      id,
      filledSlots: 0,
      status: 'upcoming',
      joinedPlayers: [],
    };
    setTournaments((prev) => [created, ...prev]);
    addToast('Tournament Created!', `${created.title} has been published successfully.`, 'success');
  };

  // Admin: Update room ID & password
  const handleUpdateRoomDetails = (tournamentId: string, roomId: string, roomPass: string) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          return {
            ...t,
            roomId,
            roomPassword: roomPass,
            roomStatusText: 'Room ID & Password announced by Admin!',
          };
        }
        return t;
      })
    );
    addToast('Room Details Updated', `Room ID: ${roomId} & Pass shared with registered players.`, 'success');
  };

  // Admin: Update tournament status
  const handleUpdateTournamentStatus = (tournamentId: string, status: Tournament['status']) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          return { ...t, status };
        }
        return t;
      })
    );
    addToast('Status Updated', `Tournament status changed to ${status.toUpperCase()}.`, 'info');
  };

  // Admin: Approve transaction
  const handleApproveTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, status: 'completed' } : tx))
    );
    addToast('Transaction Approved', `Transaction ${txId} marked as completed.`, 'success');
  };

  // Admin: Reject transaction
  const handleRejectTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, status: 'rejected' } : tx))
    );
    addToast('Transaction Rejected', `Transaction ${txId} was rejected.`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        user,
        setUser,
        switchUserRole,
        updateUserProfile,
        tournaments,
        transactions,
        storeItems,
        leaderboard,
        handleDeposit,
        handleWithdrawal,
        handleJoinTournament,
        handleJoinPrivateMatch,
        handleBuyStoreItem,
        handleCreateTournament,
        handleUpdateRoomDetails,
        handleUpdateTournamentStatus,
        handleApproveTransaction,
        handleRejectTransaction,
        isDepositModalOpen,
        setIsDepositModalOpen,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        selectedTournamentForJoin,
        setSelectedTournamentForJoin,
        isJoinPrivateMatchModalOpen,
        setIsJoinPrivateMatchModalOpen,
        selectedTournamentForDetails,
        setSelectedTournamentForDetails,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isApkModalOpen,
        setIsApkModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
