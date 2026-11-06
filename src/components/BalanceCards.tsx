import React from 'react';
import { useApp } from '../context/AppContext';
import { Wallet, Gift, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export const BalanceCards: React.FC = () => {
  const { user, setIsDepositModalOpen, setIsWithdrawModalOpen } = useApp();

  return (
    <div className="px-4 py-3 space-y-3">
      {/* 2 Balances Side-by-Side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current Balance */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Current Balance
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ₹{user.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Bonus Balance */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Bonus Balance
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ₹{user.bonusBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Action Buttons: Deposit & Withdraw */}
      <div className="grid grid-cols-2 gap-3">
        {/* Deposit Button (Solid Blue Accent) */}
        <button
          onClick={() => setIsDepositModalOpen(true)}
          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          aria-label="Deposit cash"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowDownToLine className="w-3.5 h-3.5" />
          </div>
          <span>Deposit</span>
        </button>

        {/* Withdraw Button (Clean White/Dark Card with Border) */}
        <button
          onClick={() => setIsWithdrawModalOpen(true)}
          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-[0.98] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-sm shadow-xs transition-all cursor-pointer"
          aria-label="Withdraw cash"
        >
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <ArrowUpFromLine className="w-3.5 h-3.5" />
          </div>
          <span>Withdraw</span>
        </button>
      </div>
    </div>
  );
};
