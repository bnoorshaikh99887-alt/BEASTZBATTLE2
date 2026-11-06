import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Wallet, ShieldCheck, Download, Smartphone } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, setIsNotificationsOpen, setIsDepositModalOpen, setActiveTab } = useApp();

  return (
    <header className="px-4 pt-3.5 pb-2 flex items-center justify-between">
      {/* User Greeting & Avatar - Clicking opens Profile / Me tab */}
      <button
        onClick={() => setActiveTab('me')}
        className="flex items-center gap-2.5 text-left group cursor-pointer"
        title="View Settings & Profile"
      >
        <div className="relative">
          <img
            src={user.avatar || '/icon-192.png'}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-600 shadow-2xs group-hover:ring-2 group-hover:ring-blue-400 transition-all"
          />
          <div className="absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900">
            <ShieldCheck className="w-2.5 h-2.5" />
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block leading-none">
            Hey,
          </span>
          <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight mt-0.5 group-hover:text-blue-600 transition-colors">
            {user.name}
          </h1>
        </div>
      </button>

      {/* Right Side: Balance Chip & Notification Bell */}
      <div className="flex items-center gap-2">
        {/* Balance Chip (As seen in Video 2: pill with blue icon and ₹ amount) */}
        <button
          onClick={() => setIsDepositModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-900 transition-all shadow-2xs cursor-pointer"
          title="Add Money / View Balance"
        >
          <div className="w-4 h-4 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px]">
            <Wallet className="w-2.5 h-2.5" />
          </div>
          <span className="text-xs font-black tabular-nums font-mono">
            ₹{user.currentBalance.toFixed(0)}
          </span>
        </button>

        {/* Notification Bell with red unread indicator */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-800"></span>
        </button>
      </div>
    </header>
  );
};
