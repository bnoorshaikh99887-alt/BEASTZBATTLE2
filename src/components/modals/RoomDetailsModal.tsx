import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, KeyRound, Copy, Check, ShieldCheck, Trophy, AlertTriangle, Users } from 'lucide-react';

export const RoomDetailsModal: React.FC = () => {
  const { selectedTournamentForDetails, setSelectedTournamentForDetails, user } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!selectedTournamentForDetails) return null;

  const t = selectedTournamentForDetails;
  const isJoined = user.joinedMatches.includes(t.id);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase">
                {t.game}
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold text-slate-700 dark:text-slate-300">
                {t.mode}
              </span>
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
              {t.title}
            </h3>
          </div>

          <button
            onClick={() => setSelectedTournamentForDetails(null)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-4">
          {/* Room Credentials Section */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Room Credentials</span>
              </div>
              {isJoined && (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">
                  UNLOCKED
                </span>
              )}
            </div>

            {isJoined && t.roomId ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Room ID
                    </span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {t.roomId}
                    </span>
                  </div>
                  <button
                    onClick={() => copy(t.roomId!, 'room_id')}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 text-slate-600 dark:text-slate-300"
                  >
                    {copiedKey === 'room_id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Password
                    </span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {t.roomPassword || 'None'}
                    </span>
                  </div>
                  {t.roomPassword && (
                    <button
                      onClick={() => copy(t.roomPassword!, 'room_pass')}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 text-slate-600 dark:text-slate-300"
                    >
                      {copiedKey === 'room_pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            ) : isJoined ? (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                Room credentials will be published 15 minutes before match start ({t.dateTime}).
              </div>
            ) : (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                Join this match to unlock the custom room ID and password!
              </div>
            )}
          </div>

          {/* Prize Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Prize Distribution
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-2xl border border-amber-200 dark:border-amber-900/60">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold block uppercase">
                  1st Place 🥇
                </span>
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  ₹{t.firstPlacePrize}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-extrabold block uppercase">
                  2nd Place 🥈
                </span>
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  ₹{t.secondPlacePrize}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-extrabold block uppercase">
                  3rd Place 🥉
                </span>
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  ₹{t.thirdPlacePrize}
                </span>
              </div>
            </div>
          </div>

          {/* Rules List */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Official Tournament Rules
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {t.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={() => setSelectedTournamentForDetails(null)}
          className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
