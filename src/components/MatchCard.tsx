import React from 'react';
import { Tournament } from '../types';
import { useApp } from '../context/AppContext';
import { Clock, CheckCircle2, Shield } from 'lucide-react';

interface MatchCardProps {
  tournament: Tournament;
}

export const MatchCard: React.FC<MatchCardProps> = ({ tournament }) => {
  const { user, setSelectedTournamentForJoin, setSelectedTournamentForDetails } = useApp();

  const isJoined = user.joinedMatches.includes(tournament.id);
  const isFull = tournament.filledSlots >= tournament.totalSlots;
  const spotsLeft = Math.max(0, tournament.totalSlots - tournament.filledSlots);
  const fillPct = Math.min(100, Math.round((tournament.filledSlots / tournament.totalSlots) * 100));

  // Map image based on tournament map
  const getMapThumbnail = (map?: string) => {
    const m = String(map || 'BERMUDA').toUpperCase();
    switch (m) {
      case 'BERMUDA':
        return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80';
      case 'IRON CAGE':
        return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80';
      case 'PURGATORY':
        return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80';
      case 'COLOSSEUM':
        return 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=200&q=80';
      case 'ERANGEL':
        return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80';
      default:
        return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80';
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition">
      {/* Top badges: Game + Map/Mode + Status */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
            {tournament.game === 'Free Fire' ? 'Free Fire MAX' : tournament.game}
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {tournament.map} · {tournament.mode}
          </span>
        </div>

        {tournament.status === 'ongoing' ? (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            ONGOING
          </span>
        ) : (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {isFull ? 'FULL' : 'UPCOMING'}
          </span>
        )}
      </div>

      {/* Title & Map Thumbnail from Video 2 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug tracking-tight">
            {tournament.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {tournament.dateTime}
            </span>
            <span>·</span>
            <span>{tournament.matchNo}</span>
          </div>
        </div>

        {/* Small map badge thumbnail */}
        <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-2xs">
          <img
            src={getMapThumbnail(tournament.map)}
            alt={tournament.map}
            className="w-full h-full object-cover opacity-85"
            loading="lazy"
          />
          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-extrabold text-center py-0.5 uppercase tracking-wider">
            {tournament.map}
          </span>
        </div>
      </div>

      {/* 3 Metric Chips (Prize Pool, Per Kill, Entry Fee) */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 mb-3 text-center text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block font-semibold">Prize Pool</span>
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 tabular-nums font-mono">
            ₹{tournament.prizePool.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block font-semibold">Per Kill</span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
            {tournament.perKill > 0 ? `+₹${tournament.perKill.toFixed(2)}` : 'Rank Basis'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block font-semibold">Entry Fee</span>
          <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums font-mono">
            {tournament.entryFee > 0 ? `₹${tournament.entryFee.toFixed(2)}` : 'FREE'}
          </span>
        </div>
      </div>

      {/* Slots Progress Bar */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span className="text-slate-500 dark:text-slate-400">
            Slots:{' '}
            <strong className="text-slate-900 dark:text-white">
              {tournament.filledSlots}/{tournament.totalSlots}
            </strong>
          </span>
          <span className="text-blue-600 dark:text-blue-400">{spotsLeft} left</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
          Win:{' '}
          <strong className="text-blue-600 dark:text-blue-400">
            ₹{tournament.firstPlacePrize >= 1000 ? `${(tournament.firstPlacePrize / 1000).toFixed(1)}k` : tournament.firstPlacePrize}
          </strong>{' '}
          for 1st
        </span>

        {isJoined ? (
          <button
            type="button"
            onClick={() => setSelectedTournamentForDetails(tournament)}
            className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Joined (Room ID)</span>
          </button>
        ) : isFull ? (
          <button
            disabled
            className="py-2 px-4 bg-slate-200 dark:bg-slate-800 text-slate-400 font-extrabold text-xs rounded-xl cursor-not-allowed"
          >
            FULL
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSelectedTournamentForJoin(tournament)}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            Join · {tournament.entryFee > 0 ? `₹${tournament.entryFee.toFixed(2)}` : 'FREE'}
          </button>
        )}
      </div>
    </div>
  );
};
