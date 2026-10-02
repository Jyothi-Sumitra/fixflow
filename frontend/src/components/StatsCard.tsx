import React from 'react';
import type { TicketStats } from '../types/ticket';
import { Layers, AlertCircle, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StatsCardProps {
  stats: TicketStats;
  selectedStatusFilter?: string;
  selectedPriorityFilter?: string;
  onFilterChange: (type: 'status' | 'priority', value: string) => void;
}

export const StatsOverview: React.FC<StatsCardProps> = ({
  stats,
  selectedStatusFilter = 'all',
  selectedPriorityFilter = 'all',
  onFilterChange,
}) => {
  const items = [
    {
      id: 'total',
      label: 'Total Tickets',
      value: stats.total,
      icon: Layers,
      color: 'text-slate-700 bg-slate-100',
      activeBorder: selectedStatusFilter === 'all' && selectedPriorityFilter === 'all' ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200',
      onClick: () => {
        onFilterChange('status', 'all');
        onFilterChange('priority', 'all');
      },
    },
    {
      id: 'open',
      label: 'Open',
      value: stats.open,
      icon: AlertCircle,
      color: 'text-blue-600 bg-blue-50',
      activeBorder: selectedStatusFilter === 'open' ? 'ring-2 ring-blue-600 border-blue-600' : 'border-slate-200',
      onClick: () => {
        onFilterChange('status', selectedStatusFilter === 'open' ? 'all' : 'open');
      },
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-indigo-600 bg-indigo-50',
      activeBorder: selectedStatusFilter === 'in_progress' ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-slate-200',
      onClick: () => {
        onFilterChange('status', selectedStatusFilter === 'in_progress' ? 'all' : 'in_progress');
      },
    },
    {
      id: 'high',
      label: 'High Priority',
      value: stats.highPriority,
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50',
      activeBorder: selectedPriorityFilter === 'high' ? 'ring-2 ring-rose-600 border-rose-600' : 'border-slate-200',
      onClick: () => {
        onFilterChange('priority', selectedPriorityFilter === 'high' ? 'all' : 'high');
      },
    },
    {
      id: 'resolved',
      label: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
      activeBorder: selectedStatusFilter === 'resolved' ? 'ring-2 ring-emerald-600 border-emerald-600' : 'border-slate-200',
      onClick: () => {
        onFilterChange('status', selectedStatusFilter === 'resolved' ? 'all' : 'resolved');
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={`text-left p-4 rounded-xl bg-white border shadow-subtle hover:shadow-premium transition-all cursor-pointer group ${item.activeBorder}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                {item.label}
              </span>
              <div className={`p-2 rounded-lg ${item.color} transition-transform group-hover:scale-105`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {item.value}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
