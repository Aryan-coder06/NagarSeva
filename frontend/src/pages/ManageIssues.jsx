import React, { useEffect, useMemo, useState } from 'react';
import { assignIssue, decideIssueAuthenticity, escalateIssue, getAllIssues, updateIssueStatus } from '../api/Issues';
import { getOfficers } from '../api/Officers';
import IssuePopup from '../components/IssuePopup.jsx';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, CheckCircle2, Clock3, MapPin, Search, ShieldAlert, SlidersHorizontal, UserCheck, WifiOff } from 'lucide-react';
import { demoIssues, getStatusConfig } from '../data/demoIssues';

const canonicalizeCategory = (value = '') => {
  const normalized = String(value).trim().toLowerCase();
  const aliases = {
    'road and transport': 'Roads & Transport',
    'roads and transport': 'Roads & Transport',
    'roads & transport': 'Roads & Transport',
    sanitation: 'Garbage & Sanitation',
    'garbage and sanitation': 'Garbage & Sanitation',
    'garbage & sanitation': 'Garbage & Sanitation',
    electricity: 'Street Lighting',
    'water and drainage': 'Water Supply & Drainage',
    'water supply and drainage': 'Water Supply & Drainage',
    'water supply & drainage': 'Water Supply & Drainage',
  };
  return aliases[normalized] || String(value).trim();
};

const ManageIssues = () => {
  const [issues, setIssues] = useState(demoIssues);
  const [officers, setOfficers] = useState([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', sortBy: 'priority' });
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [decisionDrafts, setDecisionDrafts] = useState({});
  const { getToken, profile } = useAuth();

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getAllIssues(token);
      setIssues(Array.isArray(data) ? data : demoIssues);
      setUsingDemo(false);
    } catch (error) {
      setIssues(demoIssues);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const token = await getToken();
      const data = await getOfficers(token);
      setOfficers(Array.isArray(data) ? data : []);
    } catch (error) {
      setOfficers([]);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchOfficers();
  }, []);

  const filteredIssues = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return issues
      .filter((issue) => {
        const matchesSearch = !query || [issue.title, issue.userMessage, issue.category, issue.city, issue.assignedToOfficerName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
        const matchesStatus = !filters.status || issue.status === filters.status;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'votes') return (b.votes || 0) - (a.votes || 0);
        if (filters.sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (filters.sortBy === 'escalation') return (b.escalationLevel || 0) - (a.escalationLevel || 0);
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      });
  }, [issues, searchQuery, filters]);

  const handleUpdateIssueStatus = async (issueId, status) => {
    setIssues((prev) => prev.map((issue) => issue._id === issueId ? { ...issue, status } : issue));
    if (issueId?.startsWith('demo-')) return;

    try {
      const token = await getToken();
      await updateIssueStatus(issueId, status, token);
      fetchIssues();
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  const handleAssignmentDraftChange = (issueId, key, value) => {
    setAssignmentDrafts((prev) => ({
      ...prev,
      [issueId]: {
        ...(prev[issueId] || {}),
        [key]: value,
      },
    }));
  };

  const handleAssignIssue = async (issue) => {
    const draft = assignmentDrafts[issue._id] || {};
    const nextOfficerId = draft.officerId || issue.assignedToOfficerId;
    if (!nextOfficerId) return;

    const selectedOfficer = officers.find((officer) => officer._id === nextOfficerId);
    setIssues((prev) => prev.map((current) => current._id === issue._id ? {
      ...current,
      assignedToOfficerId: nextOfficerId,
      assignedToOfficerName: selectedOfficer?.fullName || current.assignedToOfficerName,
      dueAt: draft.dueAt || current.dueAt,
    } : current));

    if (issue._id?.startsWith('demo-')) return;

    try {
      const token = await getToken();
      await assignIssue(issue._id, { officerId: nextOfficerId, dueAt: draft.dueAt || null }, token);
      fetchIssues();
    } catch (error) {
      console.error('Error assigning issue:', error);
    }
  };

  const handleEscalateIssue = async (issue) => {
    setIssues((prev) => prev.map((current) => current._id === issue._id ? {
      ...current,
      escalationLevel: Number(current.escalationLevel || 0) + 1,
      priorityScore: Math.min(100, Number(current.priorityScore || 0) + 10),
    } : current));

    if (issue._id?.startsWith('demo-')) return;

    try {
      const token = await getToken();
      await escalateIssue(issue._id, token);
      fetchIssues();
    } catch (error) {
      console.error('Error escalating issue:', error);
    }
  };

  const handleDecisionDraftChange = (issueId, value) => {
    setDecisionDrafts((prev) => ({
      ...prev,
      [issueId]: value,
    }));
  };

  const handleMunicipalDecision = async (issue, decision) => {
    const note = decisionDrafts[issue._id] || '';
    setIssues((prev) => prev.map((current) => current._id === issue._id ? {
      ...current,
      municipalDecision: decision,
      verificationStatus: decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'duplicate',
      decisionNote: note,
      status: decision === 'approved' ? current.status : 'closed',
    } : current));

    if (issue._id?.startsWith('demo-')) return;

    try {
      const token = await getToken();
      await decideIssueAuthenticity(issue._id, { decision, note }, token);
      fetchIssues();
    } catch (error) {
      console.error('Error applying municipal decision:', error);
    }
  };

  const metrics = {
    urgent: filteredIssues.filter((issue) => (issue.priorityScore || 0) >= 80).length,
    active: filteredIssues.filter((issue) => ['open', 'pending', 'in progress'].includes(issue.status)).length,
    resolved: filteredIssues.filter((issue) => issue.status === 'resolved').length,
    assigned: filteredIssues.filter((issue) => issue.assignedToOfficerId || issue.assignedToOfficerName).length,
  };

  const scopeSummary = {
    city: profile?.municipalityProfile?.city || 'Unassigned city',
    state: profile?.municipalityProfile?.state || 'Unassigned state',
    zone: profile?.municipalityProfile?.zone || '',
    ward: profile?.municipalityProfile?.ward || '',
    categories: (
      (profile?.municipalityProfile?.assignedCategories?.length
        ? profile.municipalityProfile.assignedCategories
        : [profile?.municipalityProfile?.department || ''])
    )
      .filter(Boolean)
      .map(canonicalizeCategory),
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">Issue operations queue</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Dispatch officers, set due dates, escalate blocked reports, and update resolution status.</p>
        </div>
        {usingDemo && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-200">
            <WifiOff className="h-4 w-4" />
            Demo queue
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Urgent priority', metrics.urgent, AlertTriangle],
          ['Active cases', metrics.active, Clock3],
          ['Resolved cases', metrics.resolved, CheckCircle2],
          ['Assigned cases', metrics.assigned, UserCheck],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-green-100 bg-white/85 p-4 shadow-sm backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
            <Icon className="mb-3 h-5 w-5 text-emerald-600" />
            <p className="text-3xl font-bold text-zinc-950 dark:text-white">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-green-100 bg-white/85 p-4 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-200">
            <MapPin className="mr-1.5 h-3.5 w-3.5" />
            {scopeSummary.city}, {scopeSummary.state}
          </span>
          {scopeSummary.ward && (
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-700 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-200">
              Ward {scopeSummary.ward}
            </span>
          )}
          {scopeSummary.zone && (
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-700 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-200">
              Zone {scopeSummary.zone}
            </span>
          )}
          {scopeSummary.categories.map((category) => (
            <span key={category} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-700 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-200">
              {category}
            </span>
          ))}
        </div>
        <div className="mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-bold text-zinc-950 dark:text-white">Queue filters</span>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search issue, category, city, officer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-3 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">All status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="in progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="priority">Priority first</option>
            <option value="votes">Most validations</option>
            <option value="oldest">Oldest first</option>
            <option value="escalation">Highest escalation</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-slate-900 dark:text-zinc-300">Loading issues...</div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-green-100 bg-white/85 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
          <div className="flex flex-col justify-between gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 lg:flex-row lg:items-center">
            <div>
              <h3 className="font-heading text-lg font-bold text-zinc-950 dark:text-white">Scoped issue queue</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Ranked by municipal priority, validation pressure, assignment state, and escalation level.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-300">
              {filteredIssues.length} visible issue{filteredIssues.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="grid grid-cols-[1.45fr_90px_150px_1.15fr_120px] gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 max-lg:hidden">
            <span>Issue</span>
            <span>Priority</span>
            <span>Status</span>
            <span>Assignment</span>
            <span>Escalate</span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredIssues.map((issue) => {
              const status = getStatusConfig(issue.status);
              const draft = assignmentDrafts[issue._id] || {};
              const dueDate = draft.dueAt || (issue.dueAt ? new Date(issue.dueAt).toISOString().slice(0, 10) : '');

              return (
                <div key={issue._id} className="grid grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[1.45fr_90px_150px_1.15fr_120px] lg:items-start">
                  <button type="button" onClick={() => setSelectedIssue(issue)} className="text-left">
                    <p className="font-bold text-zinc-950 hover:text-emerald-700 dark:text-white">{issue.title || issue.issueType || 'Civic issue'}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-zinc-600 dark:text-zinc-300">{issue.userMessage || issue.publicSummary || issue.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                      <span className="text-zinc-500 dark:text-zinc-400">{issue.category || 'Uncategorized'} / {issue.city || 'Unmapped'}</span>
                      {issue.verificationStatus && (
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-zinc-700 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-200">
                          {issue.verificationStatus}
                        </span>
                      )}
                      {issue.assignedToOfficerName && (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                          Assigned: {issue.assignedToOfficerName}
                        </span>
                      )}
                      {issue.escalationLevel > 0 && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                          Escalation L{issue.escalationLevel}
                        </span>
                      )}
                      {typeof issue.trustScore === 'number' && (
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
                          Trust {issue.trustScore}
                        </span>
                      )}
                    </div>
                  </button>
                  <div className="text-sm font-bold text-zinc-950 dark:text-white">{issue.priorityScore || '--'}</div>
                  <div className="space-y-2">
                    <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badge}`}>{status.label}</span>
                    <select
                      aria-label={`Update status for ${issue.title}`}
                      className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
                      value={(issue.status || 'pending').toLowerCase()}
                      onChange={(e) => handleUpdateIssueStatus(issue._id, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <select
                      aria-label={`Assign officer for ${issue.title}`}
                      value={draft.officerId || issue.assignedToOfficerId || ''}
                      onChange={(e) => handleAssignmentDraftChange(issue._id, 'officerId', e.target.value)}
                      className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="">Assign officer</option>
                      {officers.map((officer) => (
                        <option key={officer._id} value={officer._id}>{officer.fullName}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => handleAssignmentDraftChange(issue._id, 'dueAt', e.target.value)}
                      className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAssignIssue(issue)}
                      disabled={!((draft.officerId || issue.assignedToOfficerId) && officers.length)}
                      className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Assign
                    </button>
                    <input
                      type="text"
                      value={decisionDrafts[issue._id] || issue.decisionNote || ''}
                      onChange={(e) => handleDecisionDraftChange(issue._id, e.target.value)}
                      placeholder="Decision note"
                      className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleMunicipalDecision(issue, 'approved')}
                        className="rounded-xl bg-emerald-600 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMunicipalDecision(issue, 'rejected')}
                        className="rounded-xl bg-red-600 px-2 py-2 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Fake
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMunicipalDecision(issue, 'duplicate')}
                        className="rounded-xl bg-amber-500 px-2 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                      >
                        Duplicate
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleEscalateIssue(issue)}
                      className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Escalate
                    </button>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-300">
                      <div>{issue.statusTimeline?.length || 0} updates</div>
                      {issue.dueAt && <div className="mt-1">Due {new Date(issue.dueAt).toLocaleDateString('en-IN')}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredIssues.length === 0 && !loading && (
        <div className="rounded-[28px] border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-slate-900">
          <SlidersHorizontal className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
          <p className="font-semibold text-zinc-800 dark:text-white">No issues match this view</p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            This queue is currently scoped to {scopeSummary.city}, {scopeSummary.state}
            {scopeSummary.categories.length ? ` for ${scopeSummary.categories.join(', ')}` : ''}.
          </p>
        </div>
      )}

      {selectedIssue && <IssuePopup issue={selectedIssue} setShowIssuePopup={() => setSelectedIssue(null)} />}
    </section>
  );
};

export default ManageIssues;
