import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  ArrowDownToLine, 
  Zap, 
  ShieldCheck, 
  ExternalLink, 
  RotateCw, 
  CreditCard,
  Smartphone,
  AlertCircle
} from 'lucide-react';

declare global {
  interface Window {
    Cashfree?: any;
  }
}

export const DepositModal: React.FC = () => {
  const { 
    isDepositModalOpen, 
    setIsDepositModalOpen, 
    handleDeposit, 
    handleCashfreeDepositSuccess,
    user,
    addToast 
  } = useApp();

  // Mode: 'instant_cashfree' (Instant PG) or 'manual_upi' (Direct QR)
  const [depositMode, setDepositMode] = useState<'instant_cashfree' | 'manual_upi'>('instant_cashfree');
  
  // Amounts
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  
  // Manual UPI state
  const [upiMethod, setUpiMethod] = useState<'upi_qr' | 'gpay' | 'phonepe' | 'paytm'>('upi_qr');
  const [utr, setUtr] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [merchantUpiId, setMerchantUpiId] = useState<string>('9878385810@upi');

  // Cashfree PG State
  const [cfLoading, setCfLoading] = useState<boolean>(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [cfSessionId, setCfSessionId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [pollingActive, setPollingActive] = useState<boolean>(false);
  const [verifyMessage, setVerifyMessage] = useState<string>('');

  // Fetch live settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config?.adminUpiId) {
          setMerchantUpiId(data.config.adminUpiId);
        }
      })
      .catch(() => {});
  }, []);

  // Poll Cashfree order status while active
  useEffect(() => {
    let timer: any = null;
    if (pollingActive && activeOrderId) {
      timer = setInterval(async () => {
        try {
          const res = await fetch('/api/cashfree/verify-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: activeOrderId, userId: user.id }),
          });
          const data = await res.json();
          if (data.success && data.status === 'PAID') {
            setPollingActive(false);
            setCfLoading(false);
            setActiveOrderId(null);
            handleCashfreeDepositSuccess(data.amount || amount, data.newBalance, activeOrderId);
          }
        } catch {
          // ignore transient poll error
        }
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [pollingActive, activeOrderId, amount, user.id, handleCashfreeDepositSuccess]);

  if (!isDepositModalOpen) return null;

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

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
    navigator.clipboard.writeText(merchantUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Launch Cashfree Instant Deposit Flow
  const launchCashfreePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 10) {
      addToast('Minimum Deposit ₹10', 'Please enter an amount of at least ₹10 to continue.', 'error');
      return;
    }

    setCfLoading(true);
    setVerifyMessage('Initializing secure Cashfree Payment Session...');

    try {
      const res = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          userId: user.id,
          customerName: user.name || 'BeastzPlayer',
          customerPhone: user.phone || '9878385810',
          customerEmail: user.email || 'player@beastzbattle.com',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.paymentSessionId) {
        setCfLoading(false);
        addToast('Gateway Notice', data.error || 'Could not initiate Cashfree session. Try UPI QR.', 'error');
        return;
      }

      setActiveOrderId(data.orderId);
      setCfSessionId(data.paymentSessionId);
      setCheckoutUrl(data.checkoutUrl);
      setPollingActive(true);
      setVerifyMessage('Payment gateway opened. Complete payment in UPI/Card app.');

      // Try invoking Cashfree Official SDK v3
      let sdkLaunched = false;
      if (typeof window !== 'undefined' && window.Cashfree) {
        try {
          const cashfree = window.Cashfree({
            mode: data.environment === 'SANDBOX' ? 'sandbox' : 'production',
          });

          cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: '_modal', // seamless in-page popup modal
          }).then((result: any) => {
            if (result.error) {
              console.warn('[Cashfree SDK Error]', result.error);
            }
            if (result.paymentDetails) {
              // verify immediately
              verifyCashfreePayment(data.orderId);
            }
          });
          sdkLaunched = true;
        } catch (err) {
          console.warn('[Cashfree SDK launch fallback]', err);
        }
      }

      // Fallback: If SDK failed or mobile window popup preferred
      if (!sdkLaunched && data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setCfLoading(false);
      console.error('[Cashfree error]', err);
      addToast('Connection Error', 'Could not connect to Cashfree payment server.', 'error');
    }
  };

  // Manual Check / Verify Cashfree Status
  const verifyCashfreePayment = async (orderIdToCheck?: string) => {
    const targetId = orderIdToCheck || activeOrderId;
    if (!targetId) return;

    setCfLoading(true);
    setVerifyMessage('Checking payment status with Cashfree server...');

    try {
      const res = await fetch('/api/cashfree/verify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: targetId, userId: user.id }),
      });

      const data = await res.json();
      setCfLoading(false);

      if (data.success && data.status === 'PAID') {
        setPollingActive(false);
        setActiveOrderId(null);
        handleCashfreeDepositSuccess(data.amount || amount, data.newBalance, targetId);
      } else if (data.status === 'ACTIVE') {
        setVerifyMessage('Payment session is still active. Please finish authorization on your UPI app and click Verify.');
        addToast('Payment Pending', 'Transaction is pending in UPI. Complete payment and click Verify.', 'info');
      } else {
        setVerifyMessage(data.message || 'Payment has not been completed yet.');
        addToast('Not Completed', data.message || 'Payment was not confirmed. Please retry or contact support.', 'error');
      }
    } catch (err) {
      setCfLoading(false);
      addToast('Verify Error', 'Could not check payment status. Please try again.', 'error');
    }
  };

  // Manual UTR submission
  const onSubmitManualUpi = (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    setTimeout(() => {
      const res = handleDeposit(
        amount, 
        utr || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`, 
        upiMethod.toUpperCase()
      );
      setManualLoading(false);
      if (res.success) {
        setUtr('');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/90 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Add Cash to Wallet
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Current Balance: <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">₹{user.currentBalance.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDepositModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Deposit Channel Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setDepositMode('instant_cashfree')}
            className={`py-2.5 px-3 rounded-xl font-black text-xs transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
              depositMode === 'instant_cashfree'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Instant Deposit</span>
            </div>
            <span className="text-[9px] font-bold tracking-wider uppercase opacity-90">
              Cashfree PG (Auto-Credit)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDepositMode('manual_upi')}
            className={`py-2.5 px-3 rounded-xl font-black text-xs transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
              depositMode === 'manual_upi'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" />
              <span>Direct UPI QR</span>
            </div>
            <span className="text-[9px] font-bold tracking-wider uppercase opacity-80">
              Manual UTR Ref
            </span>
          </button>
        </div>

        {/* Amount Input Section (Shared for both methods) */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            Enter Deposit Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">
              ₹
            </span>
            <input
              type="number"
              min="10"
              max="50000"
              value={customAmount}
              onChange={handleCustomChange}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 font-mono"
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
                className={`py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  amount === q
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                ₹{q}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OPTION 1: INSTANT DEPOSIT VIA CASHFREE */}
        {/* ========================================================================= */}
        {depositMode === 'instant_cashfree' && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-150">
            {/* Gateway Highlights Box */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Official Cashfree Payment Gateway
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  Instant Auto-Credit
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center pt-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-800 flex items-center justify-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                  <span>All UPI Apps</span>
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-800 flex items-center justify-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Debit / Cards</span>
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-800 flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>NetBanking</span>
                </div>
              </div>
            </div>

            {/* Active Session Status / Re-check block */}
            {activeOrderId && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
                  <span className="text-xs font-black text-amber-800 dark:text-amber-200">
                    Payment Session #{activeOrderId.slice(-8)} Active
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                  {verifyMessage || 'Complete the payment in your UPI app or gateway window. Your wallet balance will auto-credit once confirmed.'}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => verifyCashfreePayment()}
                    disabled={cfLoading}
                    className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${cfLoading ? 'animate-spin' : ''}`} />
                    <span>Verify Payment Status</span>
                  </button>

                  {checkoutUrl && (
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 no-underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Re-open</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <button
              type="button"
              onClick={launchCashfreePayment}
              disabled={cfLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {cfLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to Cashfree...</span>
                </div>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Instant Pay ₹{amount.toFixed(2)} with Cashfree</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit SSL Encrypted & RBI Compliant PG</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OPTION 2: DIRECT MANUAL UPI QR / UTR */}
        {/* ========================================================================= */}
        {depositMode === 'manual_upi' && (
          <form onSubmit={onSubmitManualUpi} className="mt-4 space-y-4 animate-in fade-in duration-150">
            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Select UPI App
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
                    onClick={() => setUpiMethod(m.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      upiMethod === m.id
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-2 border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* UPI QR & Payment Details Box */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Merchant UPI ID:</span>
                <button
                  type="button"
                  onClick={copyUpi}
                  className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <span>{merchantUpiId}</span>
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Dynamic QR Code */}
              <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-32 h-32 bg-slate-100 dark:bg-slate-950 rounded-lg p-2 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                  <QrCode className="w-24 h-24 text-slate-800 dark:text-slate-200" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2 text-center">
                  Scan & Pay ₹{amount.toFixed(2)} on any UPI app
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
                placeholder="e.g. 432190823145"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono placeholder:font-sans focus:outline-hidden focus:border-blue-600"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Submitted UTR will be verified and credited to your wallet
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={manualLoading}
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {manualLoading ? (
                <span>Submitting Deposit...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Deposit (₹{amount.toFixed(2)})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
