import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const IssueChart = ({ issues }) => {
  // Process data for Issues by Category chart
  const categoryData = useMemo(() => {
    const categoryCount = {};
    issues.forEach(issue => {
      const category = issue.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categories = Object.keys(categoryCount);
    const counts = Object.values(categoryCount);

    return {
      labels: categories,
      datasets: [
        {
          label: 'Issues by Category',
          data: counts,
          backgroundColor: [
            '#059669', // Emerald
            '#0d9488', // Teal
            '#06b6d4', // Cyan
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#8b5cf6', // Violet
            '#ec4899', // Pink
            '#64748b', // Slate
            '#14b8a6', // Teal 500
            '#f97316'  // Orange
          ],
          borderColor: [
            '#047857',
            '#0f766e',
            '#0891b2',
            '#d97706',
            '#b91c1c',
            '#6d28d9',
            '#be185d',
            '#475569',
            '#0f766e',
            '#c2410c'
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [issues]);

  // Process data for Monthly Reports Trend
  const monthlyTrendData = useMemo(() => {
    const monthlyCount = {};
    
    issues.forEach(issue => {
      const date = new Date(issue.createdAt);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1;
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyCount).sort();
    const counts = sortedMonths.map(month => monthlyCount[month]);

    // Format labels for better display
    const formattedLabels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(year, monthNum - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    return {
      labels: formattedLabels,
      datasets: [
        {
          label: 'Monthly Reports',
          data: counts,
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#059669',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  }, [issues]);

  // Status distribution data
  const statusData = useMemo(() => {
    const statusCount = {
      'open': 0,
      'in progress': 0,
      'pending': 0,
      'closed': 0,
      'resolved': 0
    };

    issues.forEach(issue => {
      const status = issue.status || 'open';
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      }
    });

    return {
      labels: Object.keys(statusCount).map(status => status.charAt(0).toUpperCase() + status.slice(1)),
      datasets: [
        {
          label: 'Issues by Status',
          data: Object.values(statusCount),
          backgroundColor: [
            '#ef4444', // red for open
            '#06b6d4', // cyan for in progress
            '#f59e0b', // amber for pending
            '#52525b', // zinc for closed
            '#059669', // emerald for resolved
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [issues]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#71717a' // zinc-500
        },
      },
      tooltip: {
        backgroundColor: 'rgba(9, 9, 11, 0.9)', // zinc-950
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#059669',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#71717a'
        },
        grid: {
          color: 'rgba(161, 161, 170, 0.1)', // zinc-400
        },
      },
      x: {
        ticks: { color: '#71717a' },
        grid: {
          display: false,
        },
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#71717a'
        },
        grid: {
          color: 'rgba(161, 161, 170, 0.1)',
        },
      },
      x: {
        ticks: { color: '#71717a' },
        grid: {
          color: 'rgba(161, 161, 170, 0.05)',
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#71717a'
        },
      },
      tooltip: {
        backgroundColor: 'rgba(9, 9, 11, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#059669',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        
        <div className="rounded-[28px] border border-green-100 bg-gradient-to-br from-emerald-600 to-teal-500 p-6 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Categories</p>
              <p className="font-mono text-4xl font-bold mt-1">{Object.keys(categoryData.labels || {}).length}</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur-md">
              <PieChart className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Issues by Category - Bar Chart */}
        <div className="rounded-[28px] border border-green-100 bg-white/85 p-6 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">Issues by Category</h3>
          </div>
          <div className="h-80">
            <Bar data={categoryData} options={barOptions} />
          </div>
        </div>

        {/* Issues by Status - Pie Chart */}
        <div className="rounded-[28px] border border-green-100 bg-white/85 p-6 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 dark:bg-teal-900/30">
              <PieChart className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">Issues by Status</h3>
          </div>
          <div className="h-80">
            <Pie data={statusData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Monthly Trend - Full Width */}
      <div className="rounded-[28px] border border-green-100 bg-white/85 p-6 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 dark:bg-cyan-900/30">
            <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">Monthly Reports Trend</h3>
        </div>
        <div className="h-80">
          <Line data={monthlyTrendData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
};

export default IssueChart;
