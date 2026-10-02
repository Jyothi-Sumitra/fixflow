import React from 'react';
import { Search, RotateCw, X, SlidersHorizontal } from 'lucide-react';
import type { TicketFilters } from '../types/ticket';

interface FilterBarProps {
  filters: TicketFilters;
  onFilterChange: (filters: Partial<TicketFilters>) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  totalFiltered: number;
  totalAll: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onRefresh,
  isRefreshing = false,
  totalFiltered,
  totalAll,
}) => {
  const hasActiveFilters = Boolean(
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.category && filters.category !== 'all') ||
    filters.search
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-3 sm:p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by ticket #, description, room, or location..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <div className="relative">
            <select
              value={filters.status || 'all'}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▾
            </div>
          </div>

          {/* Priority Select */}
          <div className="relative">
            <select
              value={filters.priority || 'all'}
              onChange={(e) => onFilterChange({ priority: e.target.value })}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▾
            </div>
          </div>

          {/* Category Select */}
          <div className="relative">
            <select
              value={filters.category || 'all'}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="network">Network</option>
              <option value="cleaning">Cleaning</option>
              <option value="other">Other</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▾
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title="Refresh tickets from backend"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter status summary line */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <span>
          Showing <strong className="text-slate-800 font-mono">{totalFiltered}</strong> of{' '}
          <strong className="text-slate-800 font-mono">{totalAll}</strong> tickets
        </span>
        {hasActiveFilters && (
          <span className="text-blue-600 font-medium text-[11px] inline-flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Filters active
          </span>
        )}
      </div>
    </div>
  );
};
