import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../Header';
import { BalanceCards } from '../BalanceCards';
import { CategoryPills } from '../CategoryPills';
import { MatchCard } from '../MatchCard';
import { filterTournaments } from '../../utils/tournamentRules';
import { Search, Flame, ShieldAlert, Sparkles, Plus } from 'lucide-react';

export const HomeTab: React.FC = () => {
  const { tournaments } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL MATCHES');
  const [selectedGame, setSelectedGame] = useState<string>('ALL');

  const filteredTournaments = useMemo(() => {
    return filterTournaments(tournaments, selectedCategory, selectedGame, '');
  }, [tournaments, selectedCategory, selectedGame]);

  return (
    <div className="pb-28">
      {/* Top Header */}
      <Header />

      {/* Two Balance Cards + Deposit / Withdraw Actions */}
      <BalanceCards />

      {/* Category Pills & Top Events from Video 2 */}
      <CategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedGame={selectedGame}
        onSelectGame={setSelectedGame}
      />

      {/* Tournaments List */}
      <div className="px-4 py-2 space-y-3.5">
        {filteredTournaments.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 my-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No Tournaments Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No matches found for &quot;{selectedCategory}&quot;.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL MATCHES');
                setSelectedGame('ALL');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              View All Matches
            </button>
          </div>
        ) : (
          filteredTournaments.map((tourn) => (
            <MatchCard key={tourn.id} tournament={tourn} />
          ))
        )}
      </div>
    </div>
  );
};
