import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomeTab } from './components/tabs/HomeTab';
import { MyMatchesTab } from './components/tabs/MyMatchesTab';
import { StoreTab } from './components/tabs/StoreTab';
import { LeaderboardTab } from './components/tabs/LeaderboardTab';
import { MeTab } from './components/tabs/MeTab';
import { BottomNav } from './components/BottomNav';
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { JoinMatchModal } from './components/modals/JoinMatchModal';
import { JoinPrivateMatchModal } from './components/modals/JoinPrivateMatchModal';
import { RoomDetailsModal } from './components/modals/RoomDetailsModal';
import { AdminPanelModal } from './components/modals/AdminPanelModal';
import { ApkDownloadModal } from './components/modals/ApkDownloadModal';
import { AuthModal } from './components/modals/AuthModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { ToastContainer } from './components/ToastContainer';
import { Smartphone, Monitor } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'expanded'>('mobile');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col items-center justify-start">
      {/* Top Utility Bar for Desktop Previewers */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between px-4 py-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-bold text-[11px] tracking-wider uppercase text-blue-600 dark:text-blue-400">
          BEASTZBATTLE Esports Platform
        </span>
        <button
          onClick={() => setDeviceMode(deviceMode === 'mobile' ? 'expanded' : 'mobile')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold hover:border-blue-500 transition-colors cursor-pointer"
        >
          {deviceMode === 'mobile' ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-blue-500" />
              <span>Expand Width</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              <span>Phone Frame View</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container Frame */}
      <div
        className={`w-full transition-all duration-300 relative min-h-screen bg-slate-50 dark:bg-slate-900 shadow-2xl sm:my-1 sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 ${
          deviceMode === 'mobile' ? 'max-w-md' : 'max-w-3xl'
        }`}
      >
        {/* Render Tab Screens */}
        <main className="w-full min-h-screen">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'my-matches' && <MyMatchesTab />}
          {activeTab === 'store' && <StoreTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'me' && <MeTab />}
        </main>

        {/* Floating 5-Item Bottom Navigation Bar */}
        <BottomNav />
      </div>

      {/* Interactive Global Modals */}
      <DepositModal />
      <WithdrawModal />
      <JoinMatchModal />
      <JoinPrivateMatchModal />
      <RoomDetailsModal />
      <AdminPanelModal />
      <ApkDownloadModal />
      <AuthModal />
      <NotificationsModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
