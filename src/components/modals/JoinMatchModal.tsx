import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trophy, Swords, Flame, CheckCircle, ShieldCheck } from 'lucide-react';

export const JoinMatchModal: React.FC = () => {
  const {
    selectedTournamentForJoin,
    setSelectedTournamentForJoin,
    handleJoinTournament,
    user,
    setIsDepositModalOpen,
  } = useApp();

  const [loading, setLoading] = useState(false);

  if (!selectedTournamentForJoin) return null;

  const t = selectedTournamentForJoin;
  const totalBalance = user.currentBalance + user.bonusBalance;
  const hasEnough = totalBalance >= t.entryFee;

  const onConfirm = () => {
    if (!hasEnough) {
      setSelectedTournamentForJoin(null);
      setIsDepositModalOpen(true);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      handleJoinTournament(t.id);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400">
              Registration Confirmation
            </span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
              {t.title}
            </h3>
          </div>

          <button
            onClick={() => setSelectedTournamentForJoin(null)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Match info grid */}
        <div className="my-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Game & Map</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.game} • {t.map}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Mode & Schedule</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.mode} • {t.dateTime}</span>
            </div>
          </div>

          {/* Player details */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-2xl border border-blue-200/80 dark:border-blue-900/60">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
              Participating In-Game Profile
            </span>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white">IGN: {user.ign}</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">UID: {user.gameUid}</span>
            </div>
          </div>

          {/* Pricing summary */}
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Tournament Entry Fee</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Your Usable Balance</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">₹{totalBalance.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-extrabold text-sm text-slate-900 dark:text-white">
              <span>Payable Amount</span>
              <span>₹{t.entryFee}</span>
            </div>
          </div>

          {!hasEnough && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
              Insufficient balance! Please add ₹{(t.entryFee - totalBalance).toFixed(2)} to register.
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTournamentForJoin(null)}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {loading
              ? 'Registering...'
              : hasEnough
              ? `Pay ₹${t.entryFee} & Join`
              : 'Deposit Cash to Join'}
          </button>
        </div>
      </div>
    </div>
  );
};
