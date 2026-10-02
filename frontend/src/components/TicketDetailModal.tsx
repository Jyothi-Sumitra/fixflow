import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Ticket, TicketStatus } from '../types/ticket';
import { PriorityBadge, StatusBadge, CategoryBadge } from './Badge';
import { StatusFlowControl } from './StatusFlowControl';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  Copy,
  Check,
  FileText,
  Building,
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (ticketId: number, status: TicketStatus) => Promise<void>;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!ticket) return null;

  const handleCopy = () => {
    const summary = `FixFlow Ticket #${ticket.id}\nCategory: ${ticket.category}\nPriority: ${ticket.priority}\nLocation: ${ticket.location || 'N/A'}\nDescription: ${ticket.description}\nStatus: ${ticket.status}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
                  #{String(ticket.id).padStart(4, '0')}
                </span>
                <StatusBadge status={ticket.status} size="md" />
                <PriorityBadge priority={ticket.priority} size="md" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs inline-flex items-center gap-1.5"
                  title="Copy ticket details"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline text-xs text-slate-500">
                    {copied ? 'Copied' : 'Copy'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Complaint Description */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  Resident Complaint
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-sm md:text-base leading-relaxed font-normal">
                  "{ticket.description}"
                </div>
              </div>

              {/* Grid: Category, Location, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-2xs">
                  <span className="text-xs text-slate-400 font-medium block mb-1.5">Category</span>
                  <div>
                    <CategoryBadge category={ticket.category} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-2xs">
                  <span className="text-xs text-slate-400 font-medium block mb-1.5">Location</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{ticket.location || 'Location pending'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-2xs">
                  <span className="text-xs text-slate-400 font-medium block mb-1.5">Reported Duration</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{ticket.duration || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* AI Assessment / Priority Reasoning Card */}
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 p-4 relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100/80 text-indigo-700 flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-indigo-950 uppercase tracking-wider">
                        AI Reasoning & Assessment
                      </h4>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-medium px-2 py-0.5 rounded-full">
                        LangGraph + Groq
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {ticket.priority_reason || 'AI evaluation complete. Priority assigned based on hazard severity and operational impact.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Flow Control */}
              <div>
                <StatusFlowControl ticket={ticket} onUpdateStatus={onUpdateStatus} />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                FixFlow Autonomous Maintenance
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
