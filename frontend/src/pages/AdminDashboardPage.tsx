import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getTickets, updateTicketStatus } from '../services/api';
import type { Ticket, TicketFilters, TicketStats, TicketStatus } from '../types/ticket';
import { StatsOverview } from '../components/StatsCard';
import { FilterBar } from '../components/FilterBar';
import { TicketTable } from '../components/TicketTable';
import { TicketDetailModal } from '../components/TicketDetailModal';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  ShieldAlert,
  Download,
  LogOut,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateToResident: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateToResident,
}) => {
  const { user, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<TicketFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
  });

  // Selected ticket for modal
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Fetch tickets
  const fetchAllTickets = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) setIsLoading(true);
        else setIsRefreshing(true);
        setFetchError(null);

        const data = await getTickets({
          status: filters.status !== 'all' ? filters.status : undefined,
          priority: filters.priority !== 'all' ? filters.priority : undefined,
          category: filters.category !== 'all' ? filters.category : undefined,
        });

        setTickets(data);

        // Keep selected ticket up to date if open
        if (selectedTicket) {
          const updated = data.find((t) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      } catch (err: any) {
        const msg = err.message || 'Unable to connect to the FixFlow backend service';
        setFetchError(msg);
        if (!isBackground) {
          toastError('Failed to load tickets', msg);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters.status, filters.priority, filters.category, selectedTicket, toastError]
  );

  // Initial fetch and on filter dropdown change
  useEffect(() => {
    fetchAllTickets();
  }, [filters.status, filters.priority, filters.category]);

  // Compute Statistics
  const stats: TicketStats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'open').length,
      inProgress: tickets.filter((t) => t.status === 'in_progress').length,
      highPriority: tickets.filter((t) => t.priority === 'high').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
    };
  }, [tickets]);

  // Client-side search and refinement filter
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Search matching: ticket ID, description, location, category
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesId = `#${t.id}`.includes(q) || String(t.id) === q;
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesLoc = t.location.toLowerCase().includes(q);
        const matchesCat = t.category.toLowerCase().includes(q);
        const matchesReason = t.priority_reason.toLowerCase().includes(q);

        if (!matchesId && !matchesDesc && !matchesLoc && !matchesCat && !matchesReason) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, filters.search]);

  // Export tickets to CSV
  const handleExportCSV = () => {
    if (tickets.length === 0) return;
    const headers = ['ID', 'Category', 'Priority', 'Status', 'Location', 'Duration', 'Description', 'AI Rationale'];
    const rows = filteredTickets.map((t) => [
      t.id,
      t.category,
      t.priority,
      t.status,
      `"${(t.location || '').replace(/"/g, '""')}"`,
      `"${(t.duration || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.priority_reason || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fixflow_tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Export generated', `${filteredTickets.length} ticket records exported.`);
  };

  // Status update handler
  const handleUpdateStatus = async (ticketId: number, newStatus: TicketStatus) => {
    try {
      // Optimistic update
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      await updateTicketStatus(ticketId, newStatus);
      success(
        `Ticket #${ticketId} updated`,
        `Status successfully set to ${newStatus.replace('_', ' ')}`
      );
    } catch (err: any) {
      toastError('Update failed', err.message);
      // Re-fetch to synchronize state
      fetchAllTickets(true);
    }
  };

  const handleFilterChange = (partial: Partial<TicketFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleStatsFilterChange = (type: 'status' | 'priority', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
      search: '',
    });
  };

  // Access Control: If user is not admin, display unauthorized banner
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrator Access Required
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            You are signed in as a <strong>Resident Occupant</strong> ({user?.name || 'Resident'}).
            The maintenance queue, priority triage, and technician dispatch are restricted to authorized facilities staff.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={onNavigateToResident}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            Return to Resident Portal
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            Sign Out to Staff Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Bar / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              OPERATIONS QUEUE
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live SQLite Store
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Automated ticket categorization, Groq-powered severity assessment, and resolution workflow
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredTickets.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
            title="Export filtered tickets to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={onNavigateToResident}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Complaint
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <StatsOverview
        stats={stats}
        selectedStatusFilter={filters.status}
        selectedPriorityFilter={filters.priority}
        onFilterChange={handleStatsFilterChange}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onRefresh={() => fetchAllTickets(true)}
        isRefreshing={isRefreshing}
        totalFiltered={filteredTickets.length}
        totalAll={tickets.length}
      />

      {/* Tickets Table / List */}
      <TicketTable
        tickets={filteredTickets}
        isLoading={isLoading}
        error={fetchError}
        onSelectTicket={(ticket) => setSelectedTicket(ticket)}
        onUpdateStatus={handleUpdateStatus}
        onRetry={() => fetchAllTickets()}
      />

      {/* Ticket Detail Drawer / Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
