import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, User, Phone, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { INITIAL_USER, INITIAL_ADMIN_USER } from '../../data/mockData';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, addToast } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [ign, setIgn] = useState('');
  const [name, setName] = useState('');
  const [gameUid, setGameUid] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...INITIAL_USER,
      name: name || INITIAL_USER.name,
      email: emailOrPhone.includes('@') ? emailOrPhone : INITIAL_USER.email,
      phone: !emailOrPhone.includes('@') && emailOrPhone ? emailOrPhone : INITIAL_USER.phone,
    });
    addToast('Logged in Successfully', `Welcome back, ${INITIAL_USER.name}!`, 'success');
    setIsAuthModalOpen(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      id: `usr_${Date.now()}`,
      name: name || 'New Beastz Warrior',
      ign: ign || 'WARRIOR_01',
      gameUid: gameUid || '5192840192',
      phone: emailOrPhone,
      email: `${ign.toLowerCase() || 'player'}@beastzbattle.in`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      currentBalance: 100, // free starter balance
      bonusBalance: 50,
      isKycVerified: true,
      role: 'user',
      joinedMatches: [],
      totalMatches: 0,
      totalKills: 0,
      totalEarnings: 0,
    });
    addToast('Account Created!', 'Welcome to BeastzBattle! ₹100 starter cash + ₹50 bonus credited.', 'success');
    setIsAuthModalOpen(false);
  };

  const quickLoginAs = (type: 'player' | 'admin') => {
    if (type === 'admin') {
      setUser(INITIAL_ADMIN_USER);
      addToast('Admin Logged In', 'Beastz Chief Admin account active', 'info');
    } else {
      setUser(INITIAL_USER);
      addToast('Player Logged In', 'Khush Chauhan (BEAST_KHUSH) active', 'info');
    }
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
              BEASTZBATTLE AUTH
            </span>
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              {tab === 'login' ? 'Sign In to Play' : 'Create Gamer Account'}
            </h3>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 my-3 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Quick Demo Logins */}
        <div className="space-y-1.5 mb-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            1-Click Instant Login
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => quickLoginAs('player')}
              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-left hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-extrabold text-blue-700 dark:text-blue-300 block">
                Player Account
              </span>
              <span className="text-[9px] text-slate-500 truncate block">BEAST_KHUSH</span>
            </button>
            <button
              type="button"
              onClick={() => quickLoginAs('admin')}
              className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-left hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 block">
                Admin Panel
              </span>
              <span className="text-[9px] text-slate-500 truncate block">Beastz Chief</span>
            </button>
          </div>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Mobile Number or Email
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210 or user@gmail.com"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Log In to BeastzBattle
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Khush Chauhan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                  In-Game Name (IGN)
                </label>
                <input
                  type="text"
                  placeholder="BEAST_PRO"
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                  Character UID
                </label>
                <input
                  type="text"
                  placeholder="5129482194"
                  value={gameUid}
                  onChange={(e) => setGameUid(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer mt-1"
            >
              Create Account & Get ₹150 Bonus
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
