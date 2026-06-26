import React from 'react';
import { Activity, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';

const Stats = ({ issues }) => {
  return (
    <section className='mt-4'>
        <h1 className="font-heading text-2xl font-bold mb-6 text-zinc-950 dark:text-white">Issue Summary</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-[28px] border border-green-100 bg-white/85 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80 px-6 py-6 flex flex-col transition-transform hover:-translate-y-1">
            <Activity className="mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-4xl font-bold text-zinc-950 dark:text-white">{issues.length}</span>
            <h2 className="mt-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">Total Reports</h2>
          </div>
          <div className="rounded-[28px] border border-green-100 bg-white/85 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80 px-6 py-6 flex flex-col transition-transform hover:-translate-y-1">
            <CheckCircle2 className="mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-4xl font-bold text-zinc-950 dark:text-white">{issues.filter(issue => issue.status === 'resolved').length}</span>
            <h2 className="mt-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">Resolved</h2>
          </div>
          <div className="rounded-[28px] border border-green-100 bg-white/85 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80 px-6 py-6 flex flex-col transition-transform hover:-translate-y-1">
            <AlertTriangle className="mb-3 h-6 w-6 text-red-500 dark:text-red-400" />
            <span className="font-mono text-4xl font-bold text-zinc-950 dark:text-white">{issues.filter(issue => issue.status === 'pending').length}</span>
            <h2 className="mt-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">Pending</h2>
          </div>
          <div className="rounded-[28px] border border-green-100 bg-white/85 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80 px-6 py-6 flex flex-col transition-transform hover:-translate-y-1">
            <Clock3 className="mb-3 h-6 w-6 text-amber-500 dark:text-amber-400" />
            <span className="font-mono text-4xl font-bold text-zinc-950 dark:text-white">{issues.filter(issue => issue.status === 'in progress').length}</span>
            <h2 className="mt-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">In Progress</h2>
          </div>
        </div>
      </section>
  )
}

export default Stats;
