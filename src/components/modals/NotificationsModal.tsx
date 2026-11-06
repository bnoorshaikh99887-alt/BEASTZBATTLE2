import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, Trophy, KeyRound, ArrowDownToLine, Zap } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  badgeType: string;
}

export const NotificationsModal: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNotificationsOpen) {
      setLoading(true);
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data.success && Array.isArray(data.notifications) && data.notifications.length > 0) {
            setNotifications(
              data.notifications.map((n: any) => ({
                id: n.id,
                title: n.title,
                desc: n.message,
                time: n.time || 'Recent',
                badgeType: n.badgeType || 'SYSTEM',
              }))
            );
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isNotificationsOpen]);

  if (!isNotificationsOpen) return null;

  const getIconForBadge = (badge: string) => {
    switch (badge) {
      case 'ROOM_IDP':
        return { icon: KeyRound, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60' };
      case 'DEPOSIT':
      case 'CASHFREE':
        return { icon: Zap, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' };
      case 'RESULTS_ANNOUNCED':
      case 'WINNER':
        return { icon: Trophy, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' };
      default:
        return { icon: Bell, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Notifications
            </h3>
          </div>

          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-3 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No notifications yet.</div>
          ) : (
            notifications.map((n) => {
              const { icon: Icon, color } = getIconForBadge(n.badgeType);
              return (
                <div
                  key={n.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {n.desc}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => setIsNotificationsOpen(false)}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
