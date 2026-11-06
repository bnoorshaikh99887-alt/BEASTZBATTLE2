import React from 'react';
import { Gamepad2, User, Users, Crosshair, Flame, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedGame: string;
  onSelectGame: (game: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedGame,
  onSelectGame,
}) => {
  const { setIsJoinPrivateMatchModalOpen } = useApp();

  // Exactly matching the categories from Video 2
  const modeCapsules = [
    { id: 'ALL MATCHES', label: 'All Modes', icon: Gamepad2 },
    { id: 'SOLO BR', label: 'Solo BR', icon: User },
    { id: 'DUO BR', label: 'Duo BR', icon: Users },
    { id: 'SQUAD BR', label: 'Squad BR', icon: Users },
    { id: 'CLASH SQUAD', label: 'CS 1v1', icon: Crosshair },
    { id: 'TDM 4V4', label: 'Lone Wolf', icon: Flame },
  ];

  return (
    <div className="px-4 py-2 space-y-2.5">
      {/* Top Events Heading & Shortcuts from Video 2 */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
          <span>Top Events</span>
        </h2>

        <div className="flex items-center gap-2">
          {/* Join Private Match button */}
          <button
            type="button"
            onClick={() => setIsJoinPrivateMatchModalOpen(true)}
            className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>Join Private Match</span>
          </button>
        </div>
      </div>

      {/* Mode Capsules Row - strictly ONE LINE, no line break, vibrant Blue for active */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 scroll-smooth">
        {modeCapsules.map((capsule) => {
          const Icon = capsule.icon;
          const isActive = selectedCategory === capsule.id;
          return (
            <button
              key={capsule.id}
              onClick={() => onSelectCategory(capsule.id)}
              className={`flex-shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-2xs ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-600/30'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap select-none">{capsule.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
