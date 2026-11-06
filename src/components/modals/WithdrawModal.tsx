import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ArrowUpFromLine, ShieldCheck, AlertCircle } from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const { isWithdrawModalOpen, setIsWithdrawModalOpen, handleWithdrawal, user } = useApp();
  const [amount, setAmount] = useState<string>('100');
  const [method, setMethod] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState<string>('khush@okaxis');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [bankIfsc, setBankIfsc] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>(user.name);
  const [loading, setLoading] = useState(false);

  if (!isWithdrawModalOpen) return null;

  const currentBal = user.currentBalance;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    const target = method === 'upi' ? upiId : `${bankAccount} (${bankIfsc})`;

    setLoading(true);
    setTimeout(() => {
      const res = handleWithdrawal(num, target, method === 'upi' ? 'UPI' : 'Bank Transfer');
      setLoading(false);
      if (res.success) {
        setIsWithdrawModalOpen(false);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ArrowUpFromLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Withdraw Winnings
              </h3>
              <p className="text-[11px] text-slate-400">
                Withdrawable Cash: ₹{currentBal.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWithdrawModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Withdraw Amount (₹)
              </label>
              <button
                type="button"
                onClick={() => setAmount(Math.floor(currentBal).toString())}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Max: ₹{currentBal.toFixed(0)}
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-extrabold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="50"
                max={currentBal}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
                placeholder="100"
                required
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Min withdrawal ₹50 • 0% Commission Fee
            </span>
          </div>

          {/* Method tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Withdrawal Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                  method === 'upi'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                UPI ID (Instant)
              </button>
              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                  method === 'bank'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Bank Transfer (IMPS)
              </button>
            </div>
          </div>

          {/* Method Fields */}
          {method === 'upi' ? (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Your UPI ID / VPA
              </label>
              <input
                type="text"
                placeholder="e.g. mobile@upi, name@okhdfcbank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono placeholder:font-sans focus:outline-hidden focus:border-blue-600"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5010048192019"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono uppercase"
                  required
                />
              </div>
            </div>
          )}

          {/* Info pill */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900/60 flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Winnings are directly credited through automated IMPS/UPI gateway. TDS handled under government esports guidelines.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || currentBal < 50}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <span>Processing Withdrawal...</span> : <span>Confirm Withdrawal (₹{amount})</span>}
          </button>
        </form>
      </div>
    </div>
  );
};
