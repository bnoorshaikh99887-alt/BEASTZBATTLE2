import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User as UserIcon,
  Moon,
  Sun,
  KeyRound,
  ShieldCheck,
  CreditCard,
  Download,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Copy,
  Check,
  Bell,
  Volume2,
  FileText,
  Smartphone,
  Shield,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Lock,
} from 'lucide-react';

export const MeTab: React.FC = () => {
  const {
    user,
    darkMode,
    toggleDarkMode,
    setIsDepositModalOpen,
    setIsWithdrawModalOpen,
    setIsJoinPrivateMatchModalOpen,
    setIsAdminModalOpen,
    setIsApkModalOpen,
    setIsAuthModalOpen,
    switchUserRole,
    transactions,
    addToast,
    updateUserProfile,
  } = useApp();

  const [copiedUid, setCopiedUid] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editIgn, setEditIgn] = useState(user.ign);
  const [editUid, setEditUid] = useState(user.gameUid);
  const [editName, setEditName] = useState(user.name);

  const copyUid = () => {
    navigator.clipboard.writeText(user.gameUid);
    setCopiedUid(true);
    addToast('UID Copied', `${user.gameUid} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName.trim() || user.name,
      ign: editIgn.trim() || user.ign,
      gameUid: editUid.trim() || user.gameUid,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="pb-32 px-4 pt-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Settings & Profile</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage your account, game UID, wallet, and tournament settings
          </p>
        </div>

        {/* Edit profile button */}
        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          {isEditingProfile ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Edit Profile Form */}
      {isEditingProfile && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white dark:bg-slate-800 rounded-3xl p-4 border-2 border-blue-500/40 shadow-xs space-y-3"
        >
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Update Gaming Profile
          </h3>
          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                In-Game Name (IGN)
              </label>
              <input
                type="text"
                value={editIgn}
                onChange={(e) => setEditIgn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Game UID (Character ID)
              </label>
              <input
                type="text"
                value={editUid}
                onChange={(e) => setEditUid(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      )}

      {/* User Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/90 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-600 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 border-2 border-white dark:border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                {user.name}
              </h3>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">
                KYC Verified
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-lg">
                IGN: {user.ign}
              </span>
              <button
                onClick={copyUid}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg font-mono transition-colors"
                title="Copy Game UID"
              >
                <span>UID: {user.gameUid}</span>
                {copiedUid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 truncate mt-1">
              {user.email} • {user.phone}
            </p>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Matches</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">{user.totalMatches}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Kills</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">{user.totalKills}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Winnings</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">₹{user.totalEarnings}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Win Rate</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">59%</span>
          </div>
        </div>
      </div>

      {/* Section 1: Tournament & Private Match (User explicitly emphasized "JOIN PRIVATE MATCH") */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-200/90 dark:border-slate-700/80 shadow-xs space-y-1">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1 block">
          Tournaments
        </span>

        {/* Join Private Match - Prominent Blue Highlight */}
        <button
          onClick={() => setIsJoinPrivateMatchModalOpen(true)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors text-left border border-blue-200 dark:border-blue-900/60 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm text-blue-900 dark:text-blue-200 block">
                JOIN PRIVATE MATCH
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                Enter room code to participate in private tournament scrims
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Section 2: Wallet & Transactions */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-200/90 dark:border-slate-700/80 shadow-xs space-y-1">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1 block">
          Wallet & Cash
        </span>

        {/* Wallet Balances Mini */}
        <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-2xl mb-1">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Current Balance</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              ₹{user.currentBalance.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Bonus Balance</span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
              ₹{user.bonusBalance.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsDepositModalOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                Deposit Funds
              </span>
              <span className="text-[11px] text-slate-400">Instant UPI, QR Code, GPay, Paytm</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setIsWithdrawModalOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ArrowUpFromLine className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                Withdraw Winnings
              </span>
              <span className="text-[11px] text-slate-400">Direct transfer to your UPI or Bank</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                Transaction History
              </span>
              <span className="text-[11px] text-slate-400">View deposits, withdrawals, prize history</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Expanded Transaction List */}
        {showTransactions && (
          <div className="pt-2 px-1 space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {tx.description}
                  </span>
                  <span className="text-[10px] text-slate-400">{tx.date}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-black ${
                      tx.type === 'deposit' || tx.type === 'match_win' || tx.type === 'bonus'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'deposit' || tx.type === 'match_win' || tx.type === 'bonus' ? '+' : '-'}₹
                    {tx.amount}
                  </span>
                  <span className="block text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: App Appearance & Preferences (Dark Mode inside Me section) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-200/90 dark:border-slate-700/80 shadow-xs space-y-1">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1 block">
          Appearance & Settings
        </span>

        {/* Dark Mode Toggle - User explicitly requested: "dark mode ka option me wale section mein dena" */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                Dark Mode Theme
              </span>
              <span className="text-[11px] text-slate-400">
                {darkMode ? 'Night view active' : 'Day / Light view active'}
              </span>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              darkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
            aria-label="Toggle Dark Mode"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Fast APK Download */}
        <button
          onClick={() => setIsApkModalOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                Download Android APK (v2.4.0)
              </span>
              <span className="text-[11px] text-slate-400">Install lag-free 60FPS mobile app</span>
            </div>
          </div>
          <Download className="w-4 h-4 text-blue-600" />
        </button>

        {/* Sound Effects Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                Sound & Haptics
              </span>
              <span className="text-[11px] text-slate-400">Match alerts & victory sounds</span>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              soundEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Section 4: Administration (User requested: "ADMIN PANEL ACCESS HOGA ADMIN PANEL CHANGE MAT KARNA PURNA HI REHNE DENA THA") */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 border-2 border-amber-400/40 dark:border-amber-500/30 shadow-xs space-y-1">
        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-3 py-1 block">
          Administration & Management
        </span>

        <button
          onClick={() => setIsAdminModalOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block">
                Tournament Admin Panel
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Create scrims, set Room ID/Password, approve deposits & withdrawals
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-500" />
        </button>

        {/* Quick role switcher */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 mt-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Current Role: <span className="uppercase text-blue-600">{user.role}</span>
          </span>
          <button
            onClick={() => switchUserRole(user.role === 'admin' ? 'user' : 'admin')}
            className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white transition-colors"
          >
            Switch to {user.role === 'admin' ? 'Player' : 'Admin'}
          </button>
        </div>
      </div>

      {/* Section 5: Support & Fairplay */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-200/90 dark:border-slate-700/80 shadow-xs space-y-1">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1 block">
          Help & Legal
        </span>

        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                24/7 WhatsApp Tournament Support
              </span>
              <span className="text-[11px] text-slate-400">Instant query resolution & disputes</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </a>

        <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                Fairplay & Anti-Cheat Policy
              </span>
              <span className="text-[11px] text-slate-400">Strict zero-hack & mobile-only rules</span>
            </div>
          </div>
          <Shield className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Logout / Switch User */}
      <button
        onClick={() => setIsAuthModalOpen(true)}
        className="w-full py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Switch Account / Log Out</span>
      </button>

      {/* App Version Info */}
      <div className="text-center pt-2">
        <span className="text-[11px] text-slate-400 font-semibold block">
          BEASTZBATTLE Esports v2.4.0 (Lag-Free Build)
        </span>
        <span className="text-[10px] text-slate-400">
          Crafted with Blue Theme for High-Speed Competitive Gaming
        </span>
      </div>
    </div>
  );
};
