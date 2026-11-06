import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Medal, Flame, Crosshair, Award } from 'lucide-react';

export const LeaderboardTab: React.FC = () => {
  const { leaderboard, user } = useApp();
  const [filterType, setFilterType] = useState<'winnings' | 'kills' | 'winrate'>('winnings');

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (filterType === 'kills') return b.kills - a.kills;
    return b.winnings - a.winnings;
  });

  const topThree = sortedLeaderboard.slice(0, 3);
  const remaining = sortedLeaderboard.slice(3);

  return (
    <div className="pb-28 px-4 pt-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Leaderboard</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Beastz Battle Season 9 Top Warriors & Hall of Fame
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-900 text-right">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
            Your Rank
          </span>
          <span className="text-xs font-black text-slate-900 dark:text-white">
            #2 Top Ace
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => setFilterType('winnings')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filterType === 'winnings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Top Winnings
        </button>
        <button
          onClick={() => setFilterType('kills')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filterType === 'kills'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Kill Leaders
        </button>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-3 gap-2 pt-2 items-end">
        {/* Rank 2 */}
        {topThree[1] && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-200 dark:border-slate-700 text-center relative flex flex-col items-center">
            <div className="absolute -top-3 w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-xs">
              2
            </div>
            <img
              src={topThree[1].avatar}
              alt={topThree[1].ign}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 mt-2 mb-1.5"
            />
            <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[85px]">
              {topThree[1].ign}
            </span>
            <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
              ₹{topThree[1].winnings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {topThree[1].kills} Kills
            </span>
          </div>
        )}

        {/* Rank 1 (Tallest) */}
        {topThree[0] && (
          <div className="bg-linear-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-800 rounded-3xl p-3.5 border-2 border-amber-400 dark:border-amber-500/50 text-center relative flex flex-col items-center shadow-md shadow-amber-500/10 -mt-2">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
              👑
            </div>
            <img
              src={topThree[0].avatar}
              alt={topThree[0].ign}
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 mt-2 mb-1.5 ring-2 ring-amber-300"
            />
            <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[95px]">
              {topThree[0].ign}
            </span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
              ₹{topThree[0].winnings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              {topThree[0].kills} Kills • {topThree[0].winRate}
            </span>
          </div>
        )}

        {/* Rank 3 */}
        {topThree[2] && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-200 dark:border-slate-700 text-center relative flex flex-col items-center">
            <div className="absolute -top-3 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-xs">
              3
            </div>
            <img
              src={topThree[2].avatar}
              alt={topThree[2].ign}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-700 mt-2 mb-1.5"
            />
            <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[85px]">
              {topThree[2].ign}
            </span>
            <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
              ₹{topThree[2].winnings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {topThree[2].kills} Kills
            </span>
          </div>
        )}
      </div>

      {/* Leaderboard Ranking List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-200/90 dark:border-slate-700/80 shadow-xs space-y-2">
        <div className="px-2 py-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Rank & Player</span>
          <span>Earnings & Stats</span>
        </div>

        {sortedLeaderboard.map((player) => {
          const isCurrentUser = player.id === user.id || player.ign === user.ign;
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl transition-colors ${
                isCurrentUser
                  ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center font-extrabold text-xs text-slate-500 dark:text-slate-400">
                  #{player.rank}
                </span>
                <img
                  src={player.avatar}
                  alt={player.ign}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {player.ign}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    UID: {player.gameUid} • {player.tier}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400 block">
                  ₹{player.winnings.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {player.kills} Kills • {player.winRate} Win
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
