import React from 'react';
import type { Ticket, TicketStatus } from '../types/ticket';
import { PriorityBadge, StatusBadge, CategoryBadge } from './Badge';
import { MapPin, ArrowRight, Eye, AlertCircle, RefreshCw } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
  onSelectTicket: (ticket: Ticket) => void;
  onUpdateStatus?: (ticketId: number, status: TicketStatus) => Promise<void>;
  onRetry: () => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  isLoading,
  error,
  onSelectTicket,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="h-5 bg-slate-200 rounded w-32 animate-pulse" />
          <div className="h-5 bg-slate-200 rounded w-20 animate-pulse" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
            <div className="w-12 h-6 bg-slate-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="w-20 h-6 bg-slate-200 rounded" />
            <div className="w-20 h-6 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-subtle">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Failed to load maintenance tickets</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-subtle">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No tickets found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          No maintenance tickets match your current filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-20">ID</th>
              <th className="py-3 px-4">Issue Description</th>
              <th className="py-3 px-4 w-40">Location</th>
              <th className="py-3 px-4 w-32">Priority</th>
              <th className="py-3 px-4 w-32">Status</th>
              <th className="py-3 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4 font-mono font-medium text-slate-500 text-xs">
                  #{String(ticket.id).padStart(4, '0')}
                </td>
                <td className="py-3.5 px-4 max-w-md">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryBadge category={ticket.category} showIcon={false} />
                    <span className="font-medium text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {ticket.description}
                    </span>
                  </div>
                  {ticket.priority_reason && (
                    <p className="text-xs text-slate-400 line-clamp-1 italic">
                      AI Note: {ticket.priority_reason}
                    </p>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{ticket.location || 'Pending info'}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTicket(ticket);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onSelectTicket(ticket)}
            className="p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-500">
                #{String(ticket.id).padStart(4, '0')}
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900 line-clamp-2">
                {ticket.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-2">
                <CategoryBadge category={ticket.category} />
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[140px]">{ticket.location || 'Pending'}</span>
                </span>
              </div>
              <span className="text-blue-600 font-medium inline-flex items-center gap-0.5">
                Details <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
