import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/Notifications';
import { useAuth } from '../../contexts/AuthContext';

const timeAgo = (value) => {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function NotificationBell({ dark = false }) {
  const { isSignedIn, getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);
  const seenIdsRef = useRef(new Set());
  const bootstrappedRef = useRef(false);

  const loadNotifications = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await getMyNotifications(token, 10);
      const nextItems = data.notifications || [];
      setItems(nextItems);
      setUnreadCount(data.unreadCount || 0);

      const unseenUnread = nextItems.filter((item) => !item.readAt && !seenIdsRef.current.has(item._id));
      if (bootstrappedRef.current) {
        unseenUnread.slice(0, 2).forEach((item) => {
          toast(
            <div className="flex gap-3 p-1">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-300">{item.message}</p>
              </div>
            </div>,
            { icon: false }
          );
        });
      }

      nextItems.forEach((item) => seenIdsRef.current.add(item._id));
      bootstrappedRef.current = true;
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return undefined;
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 20000);
    return () => window.clearInterval(interval);
  }, [isSignedIn, loadNotifications]);

  useEffect(() => {
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!isSignedIn) return null;

  const handleRead = async (notificationId) => {
    try {
      const token = await getToken();
      if (!token) return;
      await markNotificationRead(notificationId, token);
      setItems((prev) => prev.map((item) => (item._id === notificationId ? { ...item, readAt: new Date().toISOString() } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const handleReadAll = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      await markAllNotificationsRead(token);
      setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications read:', error);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
          dark
            ? 'border-zinc-800 bg-slate-900/85 text-zinc-100 hover:border-emerald-500/30 hover:bg-slate-800'
            : 'border-white/20 bg-white/80 text-zinc-800 hover:border-emerald-500/30 hover:bg-white'
        }`}
        aria-label="Open notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[1.15rem] rounded-full bg-emerald-500 px-1 py-0.5 text-center text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 mt-3 w-[21rem] overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl ${
          dark
            ? 'border-white/10 bg-slate-950/95 text-white'
            : 'border-white/30 bg-white/92 text-zinc-900'
        }`}>
          <div className={`flex items-center justify-between border-b px-4 py-3 ${
            dark ? 'border-white/10' : 'border-zinc-200/80'
          }`}>
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className={`text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Live civic workflow updates</p>
            </div>
            <button
              type="button"
              onClick={handleReadAll}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                dark ? 'bg-white/5 text-emerald-300 hover:bg-white/10' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Read all
            </button>
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {loading && !items.length ? (
              <div className={`px-4 py-5 text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Loading alerts...</div>
            ) : items.length ? (
              items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleRead(item._id)}
                  className={`block w-full border-b px-4 py-3 text-left transition ${
                    dark
                      ? 'border-white/5 hover:bg-white/5'
                      : 'border-zinc-100 hover:bg-zinc-50'
                  } ${item.readAt ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.readAt ? 'bg-zinc-500/40' : 'bg-emerald-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <span className={`shrink-0 text-[11px] ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{timeAgo(item.createdAt)}</span>
                      </div>
                      <p className={`mt-1 text-sm leading-6 ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>{item.message}</p>
                      {item.ctaLabel ? (
                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          dark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {item.ctaLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className={`px-4 py-8 text-center text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                No alerts yet. New issue routing and status updates will appear here.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
