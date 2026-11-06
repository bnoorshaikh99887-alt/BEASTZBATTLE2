export type GameType = 'BGMI' | 'Free Fire' | 'COD Mobile';
export type MatchMode = 'SOLO BR' | 'DUO BR' | 'SQUAD BR' | 'TDM 4V4' | 'CLASH SQUAD';
export type MatchStatus = 'upcoming' | 'ongoing' | 'completed';

export interface User {
  id: string;
  name: string;
  ign: string;
  gameUid: string;
  phone: string;
  email: string;
  avatar: string;
  currentBalance: number;
  bonusBalance: number;
  isKycVerified: boolean;
  role: 'user' | 'admin';
  joinedMatches: string[];
  totalMatches: number;
  totalKills: number;
  totalEarnings: number;
}

export interface Tournament {
  id: string;
  title: string;
  game: GameType;
  mode: MatchMode;
  map: string;
  matchNo: string;
  dateTime: string;
  timestamp: number;
  entryFee: number;
  prizePool: number;
  perKill: number;
  totalSlots: number;
  filledSlots: number;
  status: MatchStatus;
  isPrivate: boolean;
  privateCode?: string;
  roomId?: string;
  roomPassword?: string;
  roomStatusText?: string;
  rules: string[];
  bannerUrl?: string;
  firstPlacePrize: number;
  secondPlacePrize: number;
  thirdPlacePrize: number;
  joinedPlayers?: {
    userId: string;
    ign: string;
    slotNo: number;
    joinedAt: string;
  }[];
  results?: {
    rank: number;
    teamName: string;
    ign: string;
    kills: number;
    prize: number;
  }[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'match_fee' | 'match_win' | 'bonus' | 'store_purchase';
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  date: string;
  description: string;
  refId: string;
  paymentMethod?: string;
  upiId?: string;
}

export interface StoreItem {
  id: string;
  name: string;
  category: 'UC / Diamonds' | 'Esports Gear' | 'Custom Room Cards' | 'Elite Passes';
  price: number;
  originalPrice: number;
  tag?: string;
  iconName: string;
  image: string;
  description: string;
  stock: number;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  ign: string;
  gameUid: string;
  avatar: string;
  winnings: number;
  kills: number;
  matchesPlayed: number;
  winRate: string;
  tier: 'Conqueror' | 'Grandmaster' | 'Legendary' | 'Ace Master';
}
