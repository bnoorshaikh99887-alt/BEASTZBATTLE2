import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Swords, ShoppingBag, Trophy } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();

  // Exactly the 5 options requested by the user:
  // 1. Home
  // 2. My Match
  // 3. Beastz Store
  // 4. Leaderboard
  // 5. Me (with user logo/avatar that opens settings)
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'my-matches' as const, label: 'My Match', icon: Swords },
    { id: 'store' as const, label: 'Beastz Store', icon: ShoppingBag },
    { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-3 pb-3 pointer-events-none">
      <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-md text-white rounded-3xl p-1.5 px-2 border border-slate-800/80 shadow-2xl flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-400 bg-blue-950/40 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label={tab.label}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 5th Tab: ME with profile logo / avatar */}
        <button
          onClick={() => setActiveTab('me')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'me'
              ? 'text-blue-400 bg-blue-950/40 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Me and Settings"
        >
          <div className="relative">
            <img
              src={user.avatar}
              alt="Me"
              className={`w-5 h-5 rounded-full object-cover border ${
                activeTab === 'me' ? 'border-blue-400 ring-2 ring-blue-500/30' : 'border-slate-500'
              }`}
            />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">
            Me
          </span>
        </button>
      </div>
    </nav>
  );
};
