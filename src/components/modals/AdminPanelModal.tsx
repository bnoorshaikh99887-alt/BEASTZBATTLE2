import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GameType, MatchMode, Tournament } from '../../types';
import {
  X,
  PlusCircle,
  KeyRound,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Flame,
  Swords,
  Trophy,
} from 'lucide-react';

export const AdminPanelModal: React.FC = () => {
  const {
    isAdminModalOpen,
    setIsAdminModalOpen,
    tournaments,
    transactions,
    handleCreateTournament,
    handleUpdateRoomDetails,
    handleUpdateTournamentStatus,
    handleApproveTransaction,
    handleRejectTransaction,
  } = useApp();

  const [tab, setTab] = useState<'create' | 'rooms' | 'transactions'>('rooms');

  // Form states for creating a tournament
  const [title, setTitle] = useState('');
  const [game, setGame] = useState<GameType>('BGMI');
  const [mode, setMode] = useState<MatchMode>('SQUAD BR');
  const [mapName, setMapName] = useState('Erangel');
  const [matchNo, setMatchNo] = useState('Match #146');
  const [dateTime, setDateTime] = useState('Today, 11:45 PM');
  const [entryFee, setEntryFee] = useState<number>(50);
  const [prizePool, setPrizePool] = useState<number>(4000);
  const [perKill, setPerKill] = useState<number>(25);
  const [totalSlots, setTotalSlots] = useState<number>(100);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [privateCode, setPrivateCode] = useState<string>('');

  // States for updating room ID
  const [selectedTournId, setSelectedTournId] = useState<string>(tournaments[0]?.id || '');
  const [roomIdInput, setRoomIdInput] = useState<string>('');
  const [roomPassInput, setRoomPassInput] = useState<string>('');

  if (!isAdminModalOpen) return null;

  const onPublishRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournId || !roomIdInput) return;
    handleUpdateRoomDetails(selectedTournId, roomIdInput, roomPassInput);
    setRoomIdInput('');
    setRoomPassInput('');
  };

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateTournament({
      title: title || `${game} ${mode} Custom Scrims`,
      game,
      mode,
      map: mapName,
      matchNo,
      dateTime,
      timestamp: Date.now() + 3600000,
      entryFee,
      prizePool,
      perKill,
      totalSlots,
      isPrivate,
      privateCode: isPrivate ? privateCode : undefined,
      firstPlacePrize: Math.round(prizePool * 0.5),
      secondPlacePrize: Math.round(prizePool * 0.3),
      thirdPlacePrize: Math.round(prizePool * 0.2),
      rules: [
        'Strictly Mobile Only. No iPads or Emulators allowed.',
        'Record POV video in case of any hack allegations.',
      ],
    });
    setTitle('');
    setTab('rooms');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-3xl p-5 border-2 border-amber-500/50 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center">
              ⚡
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Beastz Admin Dashboard
              </h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                Tournament Host & Wallet Management System
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 my-3 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
          <button
            onClick={() => setTab('rooms')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tab === 'rooms'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Room ID & Pass
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Tournament
          </button>
          <button
            onClick={() => setTab('transactions')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tab === 'transactions'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* TAB 1: Publish Room Credentials */}
        {tab === 'rooms' && (
          <div className="space-y-4">
            <form onSubmit={onPublishRoom} className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                Publish Custom Room ID & Password
              </h4>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Select Active Match
                </label>
                <select
                  value={selectedTournId}
                  onChange={(e) => setSelectedTournId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.matchNo}) - {t.status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Room ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8492019"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. beastz99"
                    value={roomPassInput}
                    onChange={(e) => setRoomPassInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
              >
                Broadcast Credentials to Players
              </button>
            </form>

            {/* List of current tournaments status switcher */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Manage Match Statuses
              </span>
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
                      {t.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ID: {t.roomId || 'Not set'} • Pass: {t.roomPassword || 'Not set'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateTournamentStatus(t.id, 'ongoing')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        t.status === 'ongoing' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Live
                    </button>
                    <button
                      onClick={() => handleUpdateTournamentStatus(t.id, 'completed')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        t.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Create Tournament */}
        {tab === 'create' && (
          <form onSubmit={onCreate} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tournament Title
              </label>
              <input
                type="text"
                placeholder="e.g. BGMI Sunday Grand Invitational"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Game
                </label>
                <select
                  value={game}
                  onChange={(e) => setGame(e.target.value as GameType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="BGMI">BGMI</option>
                  <option value="Free Fire">Free Fire</option>
                  <option value="COD Mobile">COD Mobile</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as MatchMode)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="SOLO BR">SOLO BR</option>
                  <option value="DUO BR">DUO BR</option>
                  <option value="SQUAD BR">SQUAD BR</option>
                  <option value="TDM 4V4">TDM 4V4</option>
                  <option value="CLASH SQUAD">CLASH SQUAD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Entry Fee (₹)</label>
                <input
                  type="number"
                  value={entryFee}
                  onChange={(e) => setEntryFee(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Prize Pool (₹)</label>
                <input
                  type="number"
                  value={prizePool}
                  onChange={(e) => setPrizePool(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Per Kill (₹)</label>
                <input
                  type="number"
                  value={perKill}
                  onChange={(e) => setPerKill(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <input
                type="checkbox"
                id="isPrivateCheck"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <label htmlFor="isPrivateCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Make this a Private Match (Requires Room Code)
              </label>
            </div>

            {isPrivate && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Private Match Room Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIPSCREAMS88"
                  value={privateCode}
                  onChange={(e) => setPrivateCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono uppercase text-slate-900 dark:text-white"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase shadow-md transition-all cursor-pointer"
            >
              Publish Tournament
            </button>
          </form>
        )}

        {/* TAB 3: Transactions */}
        {tab === 'transactions' && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Recent Transactions Queue
            </span>
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {tx.description}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {tx.refId} • {tx.date}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-white">
                    ₹{tx.amount}
                  </span>
                  {tx.status === 'completed' ? (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold px-1.5 py-0.5 rounded">
                      Approved
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleApproveTransaction(tx.id)}
                        className="p-1 rounded-lg bg-emerald-500 text-white"
                        title="Approve"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRejectTransaction(tx.id)}
                        className="p-1 rounded-lg bg-rose-500 text-white"
                        title="Reject"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
