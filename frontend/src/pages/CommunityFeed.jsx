import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, Globe, MapPin, Search, SlidersHorizontal, ThumbsUp, UserRound, WifiOff, X } from 'lucide-react';
import MapUI from '../components/MapUI';
import IssuePopup from '../components/IssuePopup';
import { demoIssues, getCategoryConfig, getStatusConfig } from '../data/demoIssues';

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const CommunityFeed = () => {
  const [issues, setIssues] = useState(demoIssues);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [search, setSearch] = useState('');
  const [mapView, setMapView] = useState('street');
  const [filters, setFilters] = useState({ status: '', city: '', category: '', sortBy: 'priority' });
  const [lastUpdated, setLastUpdated] = useState(null);
  const BASE_API_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.city) params.append('city', filters.city);
      if (filters.category) params.append('category', filters.category);
      params.append('limit', '50');
      const response = await axios.get(`${BASE_API_URL}/api/issues?${params.toString()}`);
      const liveIssues = response.data.issues || response.data || [];
      setIssues(liveIssues);
      setUsingDemo(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.warn('Using demo issues while backend data is unavailable.');
      setIssues(demoIssues);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, [BASE_API_URL, filters.status, filters.city, filters.category]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchIssues();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [fetchIssues]);

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = issues.filter((issue) => {
      const matchesSearch = !query || [
        issue.title,
        issue.userMessage,
        issue.category,
        issue.city,
        issue.state,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus = !filters.status || issue.status === filters.status;
      const matchesCity = !filters.city || String(issue.city || '').toLowerCase().includes(filters.city.toLowerCase());
      const matchesCategory = !filters.category || issue.category === filters.category;
      return matchesSearch && matchesStatus && matchesCity && matchesCategory;
    });

    return result.sort((a, b) => {
      if (filters.sortBy === 'votes') return (b.votes || 0) - (a.votes || 0);
      if (filters.sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return (b.priorityScore || 0) - (a.priorityScore || 0) || new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [issues, search, filters]);

  useEffect(() => {
    if (!selectedIssue) return;
    const stillVisible = filteredIssues.some((issue) => issue._id === selectedIssue._id);
    if (!stillVisible) {
      setSelectedIssue(null);
    }
  }, [filteredIssues, selectedIssue]);

  const categories = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      const key = issue.category || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        config: getCategoryConfig(name),
      }));
  }, [issues]);

  const stats = {
    total: filteredIssues.length,
    open: filteredIssues.filter((issue) => ['open', 'pending'].includes(issue.status)).length,
    resolved: filteredIssues.filter((issue) => issue.status === 'resolved').length,
    votes: filteredIssues.reduce((sum, issue) => sum + (issue.votes || 0), 0),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50/20 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-green-950/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
        >
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Community verification</p>
            <h1 className="font-heading mt-2 text-3xl font-bold text-zinc-950 dark:text-white">Live civic issue map</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Explore reported issues, validate what you see nearby, and help local teams prioritize the most urgent repairs.
            </p>
          </div>
          {usingDemo && (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-200">
              <WifiOff className="h-4 w-4" />
              Showing seeded coverage data until live issue volume builds up
            </div>
          )}
        </motion.div>

        {/* ── Portal Cards ── */}
        <div className="mb-6">
          <div className="rounded-[28px] border border-green-100 bg-white/85 p-5 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-zinc-950 dark:text-white">Citizen portal</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  Use this map to verify local issues, inspect category clusters, and push recurring problems higher in the queue.
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {usingDemo
                    ? 'Live backend unavailable, showing seeded civic coverage.'
                    : `Live civic feed${lastUpdated ? ` refreshed at ${lastUpdated.toLocaleTimeString()}` : ''}.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {[
            ['Visible issues', stats.total],
            ['Needs action', stats.open],
            ['Resolved', stats.resolved],
            ['Validations', stats.votes],
          ].map(([label, value], index) => (
            <motion.div
              key={label}
              variants={fadeUp}
              custom={index}
              className="rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 p-4 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
              <p className="font-mono mt-2 text-3xl font-bold text-zinc-950 dark:text-white">{value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Category Filter Chips ── */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, category: '' }))}
            className={`rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] ${
              !filters.category ? 'border-zinc-950 bg-zinc-950 text-white shadow-md dark:border-white dark:bg-white dark:text-zinc-950' : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-200'
            }`}
          >
            All categories
          </button>
          {categories.map(({ name, count, config }) => (
            <button
              key={name}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, category: prev.category === name ? '' : name }))}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] ${
                filters.category === name ? 'border-zinc-950 bg-zinc-950 text-white shadow-md dark:border-white dark:bg-white dark:text-zinc-950' : `${config.badge} bg-white dark:bg-slate-900`
              }`}
            >
              {config.label} <span className="ml-1 text-xs opacity-80">{count}</span>
            </button>
          ))}
        </div>

        {/* ── Filter Bar ── */}
        <div className="mb-6 rounded-[28px] border border-green-100 bg-white/85 p-4 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_160px_160px_200px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, category, city, or description"
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-3 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="h-11 appearance-none rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="in progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="h-11 appearance-none rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All categories</option>
              {categories.map(({ name, config }) => (
                <option key={name} value={name}>{config.label}</option>
              ))}
            </select>
            <input
              value={filters.city}
              onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="City"
              className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
            />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
              className="h-11 appearance-none rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="priority">Highest priority</option>
              <option value="votes">Most validated</option>
              <option value="oldest">Oldest first</option>
            </select>
            <button
              type="button"
              onClick={() => { setSearch(''); setFilters({ status: '', city: '', category: '', sortBy: 'priority' }); }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <X className="mr-2 h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* ── Map + Issue Sidebar ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
          {/* Map Section */}
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-[28px] border border-green-100 bg-white/85 p-4 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading flex items-center text-lg font-bold text-zinc-950 dark:text-white">
                <MapPin className="mr-2 h-5 w-5 text-emerald-600" />
                Issue locations
              </h2>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => setMapView('street')}
                    className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${mapView === 'street' ? 'bg-white text-zinc-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    <MapPin className="mr-1.5 h-3.5 w-3.5" />
                    Street
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapView('satellite')}
                    className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${mapView === 'satellite' ? 'bg-white text-zinc-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    <Globe className="mr-1.5 h-3.5 w-3.5" />
                    Satellite
                  </button>
                </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{loading ? 'Refreshing...' : `${filteredIssues.length} shown`}</span>
            </div>
          </div>
            <MapUI
              issues={filteredIssues}
              selectedIssue={selectedIssue}
              onSelectIssue={setSelectedIssue}
              mapView={mapView}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map(({ name, config }) => (
                <span key={name} className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.badge}`}>
                  {config.label}
                </span>
              ))}
            </div>
          </motion.section>

          {/* Issue Cards Sidebar */}
          <aside className="space-y-3">
            <div className="flex items-center justify-between rounded-[22px] border border-green-100 bg-white/85 px-4 py-3 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
              <span className="inline-flex items-center text-sm font-bold text-zinc-950 dark:text-white">
                <Filter className="mr-2 h-4 w-4 text-emerald-600" />
                Priority queue
              </span>
              <SlidersHorizontal className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-h-[58vh] space-y-3 overflow-y-auto pr-1"
            >
              {filteredIssues.map((issue) => {
                const status = getStatusConfig(issue.status);
                return (
                  <motion.button
                    key={issue._id}
                    variants={fadeUp}
                    type="button"
                    onClick={() => setSelectedIssue(issue)}
                    className="w-full rounded-[24px] border border-green-100 bg-white/85 p-4 text-left shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-green-900/20 dark:bg-slate-900/80"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${status.badge}`}>{status.label}</span>
                      <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">Priority {issue.priorityScore || '--'}</span>
                    </div>
                    <h3 className="font-heading mt-3 text-base font-bold text-zinc-950 dark:text-white">{issue.title}</h3>
                    {issue.category && (
                      <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${getCategoryConfig(issue.category).badge}`}>
                        {getCategoryConfig(issue.category).label}
                      </span>
                    )}
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{issue.userMessage}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      <span className="inline-flex items-center">
                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                        {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'New'}
                      </span>
                      <span className="font-mono inline-flex items-center">
                        <ThumbsUp className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                        {issue.votes || 0}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
              {!filteredIssues.length && (
                <div className="rounded-[24px] border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-400">
                  {usingDemo ? 'No demo issues match the current filters.' : 'No live issues match the current filters yet.'}
                </div>
              )}
            </motion.div>
          </aside>
        </div>
      </div>

      {selectedIssue && <IssuePopup issue={selectedIssue} setShowIssuePopup={() => setSelectedIssue(null)} />}
    </main>
  );
};

export default CommunityFeed;
