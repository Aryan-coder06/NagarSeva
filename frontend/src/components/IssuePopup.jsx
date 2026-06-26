import React, { useEffect, useState } from 'react';
import { AlertTriangle, Building2, CheckCircle2, Clock3, CopyCheck, MapPin, ShieldAlert, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { verifyIssueAuthenticity } from '../api/Issues';
import { getCategoryConfig, getStatusConfig } from '../data/demoIssues';

const IssuePopup = ({ issue, setShowIssuePopup }) => {
  const { isSignedIn, getToken, user, isMunicipal } = useAuth();
  const [issueState, setIssueState] = useState(issue);
  const [selectedVoteType, setSelectedVoteType] = useState(null);

  useEffect(() => {
    setIssueState(issue);
    const userVote = issue.authenticityVotes?.find((vote) => vote.userId === user?.$id);
    setSelectedVoteType(userVote?.voteType || (issue.voters?.includes(user?.$id) ? 'confirm' : null));
  }, [issue, user]);

  const handleVote = async (voteType) => {
    if (!isSignedIn || issue._id?.startsWith('demo-')) return;
    try {
      const authToken = await getToken();
      const response = await verifyIssueAuthenticity(issue._id, voteType, authToken);
      setIssueState(response);
      const userVote = response.authenticityVotes?.find((vote) => vote.userId === user?.$id);
      setSelectedVoteType(userVote?.voteType || null);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const status = getStatusConfig(issueState.status);
  const category = getCategoryConfig(issueState.category);
  const safeTitle = issueState.title || issueState.issueType || 'Civic issue';
  const safeDescription = issueState.userMessage || issueState.publicSummary || 'No citizen description was provided.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4"
      onClick={() => setShowIssuePopup(false)}
      role="dialog"
      aria-modal="true"
      aria-label={`Issue ${issueState.title}`}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowIssuePopup(false)}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-xl bg-white/90 text-zinc-700 shadow-sm hover:bg-white dark:bg-slate-800 dark:text-zinc-200"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {issueState.imageUrl && (
          issueState.mediaType === 'video'
            ? <video src={issueState.imageUrl} controls className="h-72 w-full object-cover" />
            : <img src={issueState.imageUrl} alt="" className="h-72 w-full object-cover" />
        )}

        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.badge}`}>{status.label}</span>
            {issueState.category && <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${category.badge}`}>{category.label}</span>}
            {issueState.priorityScore && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">Priority {issueState.priorityScore}</span>}
            {issueState.verificationStatus && <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">{issueState.verificationStatus}</span>}
          </div>

          <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">{safeTitle}</h2>
          <div className="mt-2 flex items-center text-sm text-zinc-500 dark:text-zinc-400">
            <MapPin className="mr-1.5 h-4 w-4 text-emerald-600" />
            {issueState.city || 'Unknown area'} {issueState.state ? `, ${issueState.state}` : ''}
          </div>
          <p className="mt-4 leading-7 text-zinc-700 dark:text-zinc-300">{safeDescription}</p>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/20 dark:bg-red-950/30">
              <ShieldAlert className="mb-2 h-5 w-5 text-red-600" />
              <p className="text-xs font-semibold uppercase text-red-600">Severity</p>
              <p className="mt-1 font-bold text-red-800 dark:text-red-300">{issueState.severity || 'Pending AI'}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/20 dark:bg-emerald-950/30">
              <Building2 className="mb-2 h-5 w-5 text-emerald-700" />
              <p className="text-xs font-semibold uppercase text-emerald-700">Department</p>
              <p className="mt-1 font-bold text-emerald-900 dark:text-emerald-300">{issueState.suggestedDepartment || 'To be assigned'}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/20 dark:bg-blue-950/30">
              <Sparkles className="mb-2 h-5 w-5 text-blue-700" />
              <p className="text-xs font-semibold uppercase text-blue-700">Urgency</p>
              <p className="mt-1 font-bold text-blue-900 dark:text-blue-300">{issueState.urgency || 'Under review'}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Recommended next action</p>
            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{issueState.recommendedAction || 'AI action summary will appear after triage.'}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Authority summary</p>
              <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{issueState.authoritySummary || issueState.publicSummary || 'Authority-ready summary will appear after full triage.'}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Reported</p>
              </div>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                {issueState.createdAt ? new Date(issueState.createdAt).toLocaleString() : 'Recently submitted'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/20 dark:bg-emerald-950/30">
              <p className="text-xs font-semibold uppercase text-emerald-700">Confirm</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-300">{issueState.communityConfirmCount || issueState.votes || 0}</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/20 dark:bg-red-950/30">
              <p className="text-xs font-semibold uppercase text-red-700">Flag false</p>
              <p className="mt-1 text-2xl font-bold text-red-900 dark:text-red-300">{issueState.communityFalseCount || 0}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/20 dark:bg-amber-950/30">
              <p className="text-xs font-semibold uppercase text-amber-700">Mark duplicate</p>
              <p className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-300">{issueState.communityDuplicateCount || 0}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/20 dark:bg-blue-950/30">
              <p className="text-xs font-semibold uppercase text-blue-700">Trust score</p>
              <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-300">{issueState.trustScore || 0}</p>
            </div>
          </div>

          {issueState.isLikelyDuplicate && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/30">
              <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">Duplicate signal</p>
              <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-200">
                This issue appears close to {issueState.duplicateClusterSize || issueState.duplicateCandidates?.length || 1} other unresolved report{(issueState.duplicateClusterSize || issueState.duplicateCandidates?.length || 1) === 1 ? '' : 's'} nearby.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col justify-between gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
              <ThumbsUp className="h-4 w-4 text-emerald-600" />
              <span><strong>{issueState.communityConfirmCount || issueState.votes || 0}</strong> community confirmations</span>
            </div>
            {!isMunicipal() && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleVote('confirm')}
                  disabled={!isSignedIn || issueState._id?.startsWith('demo-')}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${
                    selectedVoteType === 'confirm' ? 'bg-emerald-600 text-white' : 'bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200'
                  } disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600`}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm
                </button>
                <button
                  onClick={() => handleVote('false')}
                  disabled={!isSignedIn || issueState._id?.startsWith('demo-')}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${
                    selectedVoteType === 'false' ? 'bg-red-600 text-white' : 'border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900/30 dark:bg-slate-900 dark:text-red-300'
                  } disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600`}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Flag false
                </button>
                <button
                  onClick={() => handleVote('duplicate')}
                  disabled={!isSignedIn || issueState._id?.startsWith('demo-')}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${
                    selectedVoteType === 'duplicate' ? 'bg-amber-500 text-white' : 'border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-900/30 dark:bg-slate-900 dark:text-amber-300'
                  } disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600`}
                >
                  <CopyCheck className="mr-2 h-4 w-4" />
                  Duplicate
                </button>
              </div>
            )}
          </div>

          {issueState.municipalDecision && issueState.municipalDecision !== 'pending' && (
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Municipal decision</p>
              <p className="mt-2 text-sm font-semibold capitalize text-zinc-900 dark:text-white">{issueState.municipalDecision}</p>
              {issueState.decisionNote && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{issueState.decisionNote}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssuePopup;
