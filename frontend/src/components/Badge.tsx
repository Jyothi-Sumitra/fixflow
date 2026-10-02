import React from 'react';
import type { TicketPriority, TicketStatus, TicketCategory } from '../types/ticket';
import { Wrench, Zap, Wifi, Sparkles, HelpCircle, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const normalized = (priority || 'medium').toLowerCase() as TicketPriority;

  const styles = {
    high: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    low: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
  };

  const dots = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-slate-400',
  };

  const labels = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 font-medium capitalize tracking-wide transition-colors ${styles[normalized] || styles.medium} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[normalized] || dots.medium}`} />
      {labels[normalized] || priority}
    </span>
  );
};

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = (status || 'open').toLowerCase() as TicketStatus;

  const config = {
    open: {
      style: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',
      label: 'Open',
      icon: AlertCircle,
    },
    in_progress: {
      style: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
      label: 'In Progress',
      icon: Clock,
    },
    resolved: {
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
      label: 'Resolved',
      icon: CheckCircle2,
    },
  };

  const item = config[normalized] || config.open;
  const Icon = item.icon;
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 font-medium tracking-wide transition-colors ${item.style} ${sizeClasses}`}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      {item.label}
    </span>
  );
};

interface CategoryBadgeProps {
  category: TicketCategory;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, showIcon = true }) => {
  const cat = (category || 'other').toLowerCase();

  const getCategoryDetails = () => {
    switch (cat) {
      case 'plumbing':
        return { label: 'Plumbing', icon: Wrench, color: 'text-sky-700 bg-sky-50 border-sky-200' };
      case 'electrical':
        return { label: 'Electrical', icon: Zap, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'network':
        return { label: 'Network', icon: Wifi, color: 'text-violet-700 bg-violet-50 border-violet-200' };
      case 'cleaning':
        return { label: 'Cleaning', icon: Sparkles, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      default:
        return { label: cat.charAt(0).toUpperCase() + cat.slice(1) || 'Other', icon: HelpCircle, color: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  const { label, icon: Icon, color } = getCategoryDetails();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${color}`}>
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      {label}
    </span>
  );
};
