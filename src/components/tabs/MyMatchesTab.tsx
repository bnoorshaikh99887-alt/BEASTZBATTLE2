import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, Copy, Check, Clock, Swords, CheckCircle2, Trophy } from 'lucide-react';

export const MyMatchesTab: React.FC = () => {
  const { user, tournaments, setActiveTab, setSelectedTournamentForDetails, addToast } = useApp();
  const [filter, setFilter] = useState<'upcoming' | 'ongoing' | 'completed'>('ongoing');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Matches joined by this user
  const userMatches = tournaments.filter((t) => user.joinedMatches.includes(t.id));

  const filteredMatches = userMatches.filter((t) => {
    if (filter === 'upcoming') return t.status === 'upcoming';
    if (filter === 'ongoing') return t.status === 'ongoing';
    return t.status === 'completed';
  });

  const copyCredentials = (roomId: string, pass: string, id: string) => {
    navigator.clipboard.writeText(`Room ID: ${roomId} | Password: ${pass}`);
    setCopiedId(id);
    addToast('Credentials Copied', `Room ID: ${roomId} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Tournaments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Track your registered rooms, active matches, and cash winnings
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Joined
          </span>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {userMatches.length} Matches
          </span>
        </div>
      </div>

      {/* Sub Tabs: Upcoming, Live, Results */}
      <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === 'upcoming'
              ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Upcoming ({userMatches.filter((t) => t.status === 'upcoming').length})
        </button>
        <button
          onClick={() => setFilter('ongoing')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === 'ongoing'
              ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Live ({userMatches.filter((t) => t.status === 'ongoing').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Results ({userMatches.filter((t) => t.status === 'completed').length})
        </button>
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No {filter} matches
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {filter === 'upcoming'
              ? 'You have not joined any upcoming matches yet. Join a scrim from the home tab to get your Room ID!'
              : `You have no ${filter} tournaments at this moment.`}
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            Browse Tournaments
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                      {t.game}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {t.map} · {t.mode}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {t.title} ({t.matchNo})
                  </h3>
                </div>
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 shrink-0">
                  Pool: ₹{t.prizePool}
                </span>
              </div>

              {/* Match Time & Registered IGN */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Match Time</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t.dateTime}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Registered IGN</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">{user.ign}</span>
                </div>
              </div>

              {/* High-Contrast IDP Box (Exactly matching BEASTz-BATTLE repo) */}
              <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-3 flex items-center justify-between text-white shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block">
                      CUSTOM ROOM CREDENTIALS (IDP)
                    </span>
                  </div>
                  {t.roomId ? (
                    <div className="text-xs text-white font-mono mt-0.5 font-bold flex items-center gap-2">
                      <span>ID: <strong className="text-sky-300 font-black text-sm">{t.roomId}</strong></span>
                      <span>PASS: <strong className="text-sky-300 font-black text-sm">{t.roomPassword || 'None'}</strong></span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-300 font-medium">
                      <Clock className="w-3 h-3 inline text-sky-400 mr-1" />
                      Room ID & Pass published 10 mins before match start.
                    </span>
                  )}
                </div>

                {t.roomId && (
                  <button
                    type="button"
                    onClick={() => copyCredentials(t.roomId!, t.roomPassword || '', t.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] rounded-lg shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    {copiedId === t.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-300" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Bottom footer */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Status: <strong className="text-emerald-600 uppercase font-black">{t.status}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTournamentForDetails(t)}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  View Match Rules &gt;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
