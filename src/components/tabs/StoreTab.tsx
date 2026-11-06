import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StoreItem } from '../../types';
import { ShoppingBag, Zap, Check, Sparkles, AlertCircle } from 'lucide-react';

export const StoreTab: React.FC = () => {
  const { storeItems, user, handleBuyStoreItem } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [purchasedCodes, setPurchasedCodes] = useState<Record<string, string>>({});

  const categories = ['All', 'UC / Diamonds', 'Esports Gear', 'Custom Room Cards'];

  const filteredItems = storeItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const onBuy = (item: StoreItem) => {
    const res = handleBuyStoreItem(item);
    if (res.success && res.code) {
      setPurchasedCodes((prev) => ({ ...prev, [item.id]: res.code! }));
    }
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Beastz Store</span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase">
              Official
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Redeem UC, Free Fire Diamonds, Custom Room Cards & Merch
          </p>
        </div>

        {/* User Balance Chip */}
        <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs text-right">
          <span className="text-[10px] text-slate-400 block font-semibold leading-none">
            Balance
          </span>
          <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
            ₹{user.currentBalance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredItems.map((item) => {
          const code = purchasedCodes[item.id];
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-3.5 border border-slate-200/90 dark:border-slate-700/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-3 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {item.tag && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-sm">
                      {item.tag}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      ₹{item.price}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    In Stock ({item.stock})
                  </span>
                </div>

                {code ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase">
                      Your Redeem Code
                    </span>
                    <span className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-200">
                      {code}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => onBuy(item)}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Redeem for ₹{item.price}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
