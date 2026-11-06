import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, QrCode, Copy, Check, ArrowDownToLine, ShieldCheck } from 'lucide-react';

export const DepositModal: React.FC = () => {
  const { isDepositModalOpen, setIsDepositModalOpen, handleDeposit, user } = useApp();
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [method, setMethod] = useState<'upi_qr' | 'gpay' | 'phonepe' | 'paytm'>('upi_qr');
  const [utr, setUtr] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isDepositModalOpen) return null;

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];
  const upiId = 'beastzbattle@okhdfcbank';

  const handleQuickAmount = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setAmount(num);
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = handleDeposit(amount, utr || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`, method.toUpperCase());
      setLoading(false);
      if (res.success) {
        setUtr('');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Add Cash to Wallet
              </h3>
              <p className="text-[11px] text-slate-400">
                Current Balance: ₹{user.currentBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDepositModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {/* Amount input */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Enter Deposit Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-extrabold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="10"
                max="50000"
                value={customAmount}
                onChange={handleCustomChange}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
                placeholder="100"
                required
              />
            </div>

            {/* Quick chips */}
            <div className="grid grid-cols-6 gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => handleQuickAmount(q)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    amount === q
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  ₹{q}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'upi_qr' as const, label: 'QR Code' },
                { id: 'gpay' as const, label: 'GPay' },
                { id: 'phonepe' as const, label: 'PhonePe' },
                { id: 'paytm' as const, label: 'Paytm' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                    method === m.id
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-2 border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* UPI QR & Payment Details Box */}
          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Merchant UPI ID:</span>
              <button
                type="button"
                onClick={copyUpi}
                className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>{upiId}</span>
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Simulated UPI QR Code SVG */}
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-lg p-2 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                <QrCode className="w-24 h-24 text-slate-800 dark:text-slate-200" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
                Scan with GPay, PhonePe, Paytm, or BHIM
              </span>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                Amount to pay: ₹{amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* UTR / Transaction Reference Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              UTR / 12-Digit UPI Transaction ID
            </label>
            <input
              type="text"
              placeholder="e.g. 432190823145 (or leave empty for instant demo)"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono placeholder:font-sans focus:outline-hidden focus:border-blue-600"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Auto-verified within 15 seconds after payment
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Verifying Deposit...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Deposit (₹{amount})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
