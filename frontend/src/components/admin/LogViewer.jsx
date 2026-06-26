import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  Filter,
  Info,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
  User,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../extras/Loader';

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    badge: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-300',
  },
  warning: {
    icon: AlertCircle,
    badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-300',
  },
  info: {
    icon: Info,
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-300',
  },
};

const userTypeConfig = {
  admin: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-300',
  officer: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/30 dark:bg-cyan-950/30 dark:text-cyan-300',
  user: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/30 dark:bg-violet-950/30 dark:text-violet-300',
};

const filtersInitialState = {
  userType: '',
  action: '',
  severity: '',
  page: 1,
  limit: 50,
  startDate: '',
  endDate: '',
};

const cardClassName = 'rounded-[28px] border border-green-100 bg-white/85 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80';
const inputClassName = 'h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-slate-900 dark:text-white';

const LogViewer = () => {
  const { getToken } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(filtersInitialState);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, count: 0 });
  const [errorState, setErrorState] = useState('');

  const BASE_API_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setErrorState('');
      const token = await getToken();
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      if (searchQuery.trim()) {
        queryParams.set('action', searchQuery.trim());
      }

      const response = await axios.get(`${BASE_API_URL}/api/logs?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLogs(response.data.logs || []);
      setPagination({
        total: response.data.total || 0,
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        count: response.data.count || 0,
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      setErrorState(error.response?.data?.error || 'Unable to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${BASE_API_URL}/api/logs/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching log stats:', error);
    }
  };

  const cleanupOldLogs = async () => {
    if (!window.confirm('Delete logs older than 90 days?')) return;

    try {
      const token = await getToken();
      await axios.delete(`${BASE_API_URL}/api/logs/cleanup?days=90`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await Promise.all([fetchLogs(), fetchStats()]);
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      alert('Failed to clean up old logs.');
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const severityStats = useMemo(() => {
    return stats?.severityStats || [
      { _id: 'info', count: 0 },
      { _id: 'warning', count: 0 },
      { _id: 'critical', count: 0 },
    ];
  }, [stats]);

  const recentActivityCount = useMemo(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    return logs.filter((log) => log.createdAt && new Date(log.createdAt).getTime() >= since).length;
  }, [logs]);

  const resolutionActivityCount = useMemo(() => {
    return logs.filter((log) => /resolve|status changed from .* to resolved/i.test(`${log.action} ${log.details}`)).length;
  }, [logs]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Municipal audit trail</p>
          <h2 className="font-heading mt-1 text-2xl font-bold text-zinc-950 dark:text-white">System activity logs</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Review status changes, issue actions, and operator activity across your scoped municipal workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              fetchLogs();
              fetchStats();
            }}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={cleanupOldLogs}
            className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-300"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Cleanup 90d+
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {severityStats.map((stat) => {
          const config = severityConfig[stat._id] || severityConfig.info;
          const Icon = config.icon;
          return (
            <div key={stat._id} className={`${cardClassName} p-4`}>
              <Icon className="mb-3 h-5 w-5 text-emerald-600" />
              <p className="text-3xl font-bold text-zinc-950 dark:text-white">{stat.count}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{stat._id} logs</p>
            </div>
          );
        })}
        <div className={`${cardClassName} p-4`}>
          <Activity className="mb-3 h-5 w-5 text-emerald-600" />
          <p className="text-3xl font-bold text-zinc-950 dark:text-white">{pagination.total || 0}</p>
          <p className="mt-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Total entries</p>
        </div>
      </div>

      <div className={`${cardClassName} p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-zinc-950 dark:text-white">Scoped audit summary</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Monitor operator actions, resolution activity, and recent system events across the current municipal scope.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-700 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-200">
              <Activity className="mr-1.5 inline h-3.5 w-3.5" />
              {recentActivityCount} in last 24h
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-200">
              <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" />
              {resolutionActivityCount} resolution events
            </span>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-700 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-200">
              <MapPin className="mr-1.5 inline h-3.5 w-3.5" />
              Municipal audit view
            </span>
          </div>
        </div>
      </div>

      <div className={`${cardClassName} p-4`}>
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-bold text-zinc-950 dark:text-white">Filters</span>
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[180px_180px_180px_180px_1fr_auto]">
          <select
            value={filters.userType}
            onChange={(e) => setFilters((prev) => ({ ...prev, userType: e.target.value, page: 1 }))}
            className={inputClassName}
          >
            <option value="">All users</option>
            <option value="admin">Admin</option>
            <option value="officer">Officer</option>
            <option value="user">Citizen</option>
          </select>
          <select
            value={filters.severity}
            onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value, page: 1 }))}
            className={inputClassName}
          >
            <option value="">All severity</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))}
            className={inputClassName}
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))}
            className={inputClassName}
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchLogs();
                }
              }}
              placeholder="Search by action or activity..."
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-3 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilters(filtersInitialState);
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
        </div>
      </div>

      <div className={`${cardClassName} overflow-hidden`}>
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800 lg:flex-row lg:items-center">
          <div>
            <h3 className="font-heading text-lg font-bold text-zinc-950 dark:text-white">Activity stream</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Showing {pagination.count || 0} entries on page {pagination.page || 1} of {pagination.totalPages || 1}.
            </p>
          </div>
          {errorState && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-200">
              <WifiOff className="h-4 w-4" />
              {errorState}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid h-64 place-items-center">
            <Loader />
          </div>
        ) : logs.length === 0 ? (
          <div className="grid gap-3 px-6 py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-zinc-400" />
            <p className="font-semibold text-zinc-900 dark:text-white">No logs match this view</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Adjust filters or wait for new municipal activity to be recorded.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {logs.map((log) => {
              const config = severityConfig[log.severity] || severityConfig.info;
              const SeverityIcon = config.icon;

              return (
                <div key={log._id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.4fr_120px_120px_180px] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.badge}`}>
                        <SeverityIcon className="mr-1.5 h-3.5 w-3.5" />
                        {log.severity || 'info'}
                      </span>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${userTypeConfig[log.userType] || userTypeConfig.user}`}>
                        <User className="mr-1.5 inline h-3.5 w-3.5" />
                        {log.userType || 'user'}
                      </span>
                    </div>
              <p className="mt-3 font-semibold text-zinc-950 dark:text-white">{log.action}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{log.details}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Actor</p>
              <p className="mt-2 text-sm font-medium capitalize text-zinc-900 dark:text-zinc-100">{log.userType || 'system'}</p>
              <p className="mt-1 break-all text-xs text-zinc-500 dark:text-zinc-400">{log.userId || 'N/A'}</p>
            </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Issue</p>
                    <p className="mt-2 break-all text-sm text-zinc-900 dark:text-zinc-100">{log.issueId || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="inline-flex items-center text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      Timestamp
                    </p>
                    <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col justify-between gap-3 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800 md:flex-row md:items-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {pagination.page || 1} of {pagination.totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={(pagination.page || 1) <= 1}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(pagination.totalPages || 1, prev.page + 1) }))}
              disabled={(pagination.page || 1) >= (pagination.totalPages || 1)}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogViewer;
