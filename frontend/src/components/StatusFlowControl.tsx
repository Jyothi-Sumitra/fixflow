import React, { useState } from 'react';
import type { Ticket, TicketStatus } from '../types/ticket';
import { PlayCircle, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface StatusFlowControlProps {
  ticket: Ticket;
  onUpdateStatus: (ticketId: number, newStatus: TicketStatus) => Promise<void>;
  disabled?: boolean;
}

export const StatusFlowControl: React.FC<StatusFlowControlProps> = ({
  ticket,
  onUpdateStatus,
  disabled = false,
}) => {
  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const steps: { key: TicketStatus; label: string; description: string }[] = [
    { key: 'open', label: 'Open', description: 'Queued for dispatch' },
    { key: 'in_progress', label: 'In Progress', description: 'Technician assigned' },
    { key: 'resolved', label: 'Resolved', description: 'Issue fixed & verified' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === ticket.status);

  const getConfirmationDetails = (status: TicketStatus) => {
    switch (status) {
      case 'in_progress':
        return {
          title: `Start work on Ticket #${ticket.id}?`,
          message: `This will mark the ticket as "In Progress" and notify the resident that maintenance is underway.`,
          confirmText: 'Mark In Progress',
          intent: 'primary' as const,
        };
      case 'resolved':
        return {
          title: `Mark Ticket #${ticket.id} as Resolved?`,
          message: `Confirm that the maintenance task for "${ticket.description.slice(0, 50)}..." has been fully completed.`,
          confirmText: 'Resolve Ticket',
          intent: 'success' as const,
        };
      case 'open':
        return {
          title: `Re-open Ticket #${ticket.id}?`,
          message: `This will reset the ticket state back to Open in the queue.`,
          confirmText: 'Re-open Ticket',
          intent: 'danger' as const,
        };
    }
  };

  const handleConfirm = async () => {
    if (!pendingStatus) return;
    try {
      setIsUpdating(true);
      await onUpdateStatus(ticket.id, pendingStatus);
      setPendingStatus(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDetails = pendingStatus ? getConfirmationDetails(pendingStatus) : null;

  return (
    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Resolution Workflow
        </span>
        <span className="text-xs text-slate-500 font-medium">
          Step {Math.max(1, currentStepIndex + 1)} of 3
        </span>
      </div>

      {/* Visual Stepper */}
      <div className="relative mb-5">
        <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute top-3 left-4 h-0.5 bg-blue-600 transition-all duration-300 -z-0"
          style={{
            width:
              currentStepIndex === 0 ? '0%' : currentStepIndex === 1 ? '50%' : 'calc(100% - 2rem)',
          }}
        />

        <div className="relative z-10 flex justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            let circleStyle = 'bg-white border-2 border-slate-300 text-slate-400';
            if (isCompleted) {
              circleStyle = 'bg-blue-600 border-2 border-blue-600 text-white';
            } else if (isCurrent) {
              circleStyle =
                step.key === 'resolved'
                  ? 'bg-emerald-600 border-2 border-emerald-600 text-white ring-4 ring-emerald-100'
                  : 'bg-blue-600 border-2 border-blue-600 text-white ring-4 ring-blue-100';
            }

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${circleStyle}`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium ${
                    isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
        {ticket.status === 'open' && (
          <button
            type="button"
            disabled={disabled || isUpdating}
            onClick={() => setPendingStatus('in_progress')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Begin Work (In Progress)
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>
        )}

        {ticket.status === 'in_progress' && (
          <>
            <button
              type="button"
              disabled={disabled || isUpdating}
              onClick={() => setPendingStatus('resolved')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Resolved
            </button>
            <button
              type="button"
              disabled={disabled || isUpdating}
              onClick={() => setPendingStatus('open')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-200/70 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" />
              Revert to Open
            </button>
          </>
        )}

        {ticket.status === 'resolved' && (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ticket successfully resolved
            </span>
            <button
              type="button"
              disabled={disabled || isUpdating}
              onClick={() => setPendingStatus('open')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reopen
            </button>
          </div>
        )}
      </div>

      {confirmDetails && (
        <ConfirmationModal
          isOpen={!!pendingStatus}
          onClose={() => setPendingStatus(null)}
          onConfirm={handleConfirm}
          title={confirmDetails.title}
          message={confirmDetails.message}
          confirmText={confirmDetails.confirmText}
          intent={confirmDetails.intent}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};
