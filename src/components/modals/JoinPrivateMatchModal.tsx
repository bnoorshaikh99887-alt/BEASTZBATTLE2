import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, KeyRound, ShieldAlert, CheckCircle2, Flame } from 'lucide-react';

export const JoinPrivateMatchModal: React.FC = () => {
  const { isJoinPrivateMatchModalOpen, setIsJoinPrivateMatchModalOpen, handleJoinPrivateMatch } = useApp();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isJoinPrivateMatchModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please enter a private match room code.');
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const res = handleJoinPrivateMatch(roomCode);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Invalid Private Match Code.');
      } else {
        setRoomCode('');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            {/* Exactly "JOIN PRIVATE MATCH" per user's prompt */}
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight uppercase">
              JOIN PRIVATE MATCH
            </h3>
          </div>

          <button
            onClick={() => setIsJoinPrivateMatchModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Enter Private Room Passcode
            </label>
            <input
              type="text"
              placeholder="e.g. BEASTZ777"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase());
                setError(null);
              }}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-mono font-black text-center tracking-widest text-blue-600 dark:text-blue-400 placeholder:font-sans placeholder:font-normal placeholder:text-xs placeholder:text-slate-400 uppercase focus:outline-hidden focus:border-blue-600"
              autoFocus
              required
            />
          </div>

          {/* Quick Demo Hint */}
          <div className="bg-blue-50 dark:bg-blue-950/60 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs">
            <span className="text-blue-800 dark:text-blue-300 font-medium text-[11px]">
              Available Demo Code:
            </span>
            <button
              type="button"
              onClick={() => setRoomCode('BEASTZ777')}
              className="font-mono font-black text-blue-600 dark:text-blue-400 hover:underline px-2 py-0.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs text-[11px]"
            >
              BEASTZ777
            </button>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <span>Verifying Room Code...</span> : <span>JOIN PRIVATE MATCH</span>}
          </button>
        </form>
      </div>
    </div>
  );
};
