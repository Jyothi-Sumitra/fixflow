import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitComplaint, resumeComplaint } from '../services/api';
import type { Ticket } from '../types/ticket';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/Badge';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Sparkles,
  HelpCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  DoorOpen,
} from 'lucide-react';

export const ResidentPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const residentUnit = user?.unit || 'Block B, Room 204';

  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Conversational clarification state
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // Completed ticket state
  const [completedTicket, setCompletedTicket] = useState<Ticket | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick suggestions for easy resident testing
  const suggestions = [
    {
      title: 'Ceiling Fan Issue',
      prompt: `The ceiling fan in ${residentUnit} has stopped rotating and is making a humming sound.`,
    },
    {
      title: 'Water Pipe Leak',
      prompt: `There is a steady water leak under the bathroom sink in ${residentUnit}.`,
    },
    {
      title: 'Power Socket Spark',
      prompt: `The electrical wall socket in ${residentUnit} produced sparks when plugging in a charger.`,
    },
  ];

  const handleInitialSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const result = await submitComplaint(description.trim());

      if (result.needsInformation && result.threadId && result.question) {
        setActiveThreadId(result.threadId);
        setClarificationQuestion(result.question);
        setCompletedTicket(null);
      } else if (result.ticket) {
        setCompletedTicket(result.ticket);
        setActiveThreadId(null);
        setClarificationQuestion(null);
        setDescription('');
        success('Service ticket submitted!', `Ticket #${result.ticket.id} registered and prioritized.`);
      }
    } catch (err: any) {
      const msg = err.message || 'Unable to submit ticket. Please check backend connection.';
      setErrorMessage(msg);
      toastError('Submission failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationAnswer.trim() || !activeThreadId || isAnswering) return;

    try {
      setIsAnswering(true);
      setErrorMessage(null);

      const finalTicket = await resumeComplaint(activeThreadId, clarificationAnswer.trim());
      setCompletedTicket(finalTicket);
      setActiveThreadId(null);
      setClarificationQuestion(null);
      setClarificationAnswer('');
      setDescription('');
      success('Ticket finalized!', `Ticket #${finalTicket.id} has been logged.`);
    } catch (err: any) {
      const msg = err.message || 'Unable to submit answer. Please try again.';
      setErrorMessage(msg);
      toastError('Clarification error', msg);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setActiveThreadId(null);
    setClarificationQuestion(null);
    setClarificationAnswer('');
    setCompletedTicket(null);
    setErrorMessage(null);
  };

  const handleCopyTicket = () => {
    if (!completedTicket) return;
    const text = `FixFlow Maintenance Request #${completedTicket.id}\nUnit: ${completedTicket.location}\nCategory: ${completedTicket.category}\nPriority: ${completedTicket.priority}\nStatus: ${completedTicket.status}\nDescription: ${completedTicket.description}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Resident Welcome & Status Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50/90 text-blue-700 border border-blue-200/80 shadow-2xs backdrop-blur-sm">
          <DoorOpen className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-mono">{residentUnit}</span>
          <span className="text-blue-300">•</span>
          <span>Resident Service Desk</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Submit Maintenance Request
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
          Describe the problem in your room or block. Our automated system assesses severity, extracts details, and notifies technicians for repair.
        </p>
      </div>

      {/* Main Request Form or Clarification or Success Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_12px_40px_-15px_rgba(15,23,42,0.06)] overflow-hidden transition-all">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="bg-rose-50/90 border-b border-rose-100 p-4 flex items-start gap-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-rose-900 font-medium">
              <strong className="font-semibold text-rose-950">Submission error:</strong> {errorMessage}
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 text-xs font-semibold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* STATE 1: Completed Ticket View */}
            {completedTicket ? (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/90 shadow-2xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Request Received & Queued for Repair
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Your maintenance ticket has been registered. A technician will be assigned according to issue urgency.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTicket}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Ticket #'}</span>
                  </button>
                </div>

                {/* Ticket Details Summary Card */}
                <div className="border border-slate-200/90 rounded-2xl p-6 bg-slate-50/40 space-y-6">
                  {/* Top Metadata Line */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Ticket ID
                      </span>
                      <span className="font-mono text-lg font-extrabold text-slate-900 bg-white border border-slate-200 px-3.5 py-1 rounded-lg shadow-2xs">
                        #{String(completedTicket.id).padStart(4, '0')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={completedTicket.status} size="md" />
                      <PriorityBadge priority={completedTicket.priority} size="md" />
                    </div>
                  </div>

                  {/* Complaint Description */}
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                      Reported Issue
                    </span>
                    <div className="text-slate-900 font-medium text-sm sm:text-base bg-white p-4 rounded-xl border border-slate-200 shadow-2xs leading-relaxed">
                      "{completedTicket.description}"
                    </div>
                  </div>

                  {/* Three-column Attributes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="text-xs text-slate-400 block mb-1.5 font-medium">Category</span>
                      <CategoryBadge category={completedTicket.category} />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="text-xs text-slate-400 block mb-1.5 font-medium">Assigned Location</span>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{completedTicket.location || residentUnit}</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="text-xs text-slate-400 block mb-1.5 font-medium">Timeline / Duration</span>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{completedTicket.duration || 'Reported today'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Reasoning Section */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white border border-blue-100/90 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-blue-600 text-white flex-shrink-0 mt-0.5 shadow-2xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                          Triage & Priority Assessment
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {completedTicket.priority_reason ||
                          'Assessed based on safety, structural condition, and maintenance queue urgency.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions: Strictly resident-facing, NO admin buttons! */}
                <div className="flex items-center justify-start gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Submit Another Request
                  </button>
                </div>
              </motion.div>
            ) : activeThreadId && clarificationQuestion ? (
              /* STATE 2: AI Clarification Interaction (Human-in-the-Loop) */
              <motion.div
                key="clarification"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                {/* AI Prompt Header */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-white border border-blue-200/90 flex items-start gap-4 shadow-sm">
                  <div className="p-3 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex-shrink-0 shadow-md shadow-blue-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                        Location Clarification Needed
                      </span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {clarificationQuestion}
                    </p>
                    <p className="text-xs text-slate-600">
                      Please confirm where the issue is located so we can route the maintenance technician.
                    </p>
                  </div>
                </div>

                {/* Context Quote */}
                <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span className="truncate max-w-lg">
                    <strong className="text-slate-900 font-semibold">Your complaint:</strong> "{description}"
                  </span>
                </div>

                {/* Clarification Input Form */}
                <form onSubmit={handleResumeSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="clarification-input"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >
                      Specify Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="clarification-input"
                        type="text"
                        value={clarificationAnswer}
                        onChange={(e) => setClarificationAnswer(e.target.value)}
                        placeholder={`e.g. ${residentUnit} or 2nd floor corridor`}
                        autoFocus
                        required
                        className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Quick autofill for their current room */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Quick fill:</span>
                    <button
                      type="button"
                      onClick={() => setClarificationAnswer(residentUnit)}
                      className="text-xs px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors border border-blue-200"
                    >
                      Use my room: {residentUnit}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isAnswering}
                      className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!clarificationAnswer.trim() || isAnswering}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnswering ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Confirm Location
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* STATE 3: Initial Complaint Form */
              <motion.div
                key="initial-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <form onSubmit={handleInitialSubmit} className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="complaint-textarea"
                        className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                      >
                        Describe the issue in your room or facility
                      </label>
                      <span className="text-xs text-slate-400 font-mono">
                        {description.length} chars
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        id="complaint-textarea"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            handleInitialSubmit();
                          }
                        }}
                        placeholder={`e.g. The AC in ${residentUnit} has stopped cooling and is dripping water onto the floor...`}
                        required
                        className="w-full p-4 text-sm sm:text-base bg-slate-50/60 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all shadow-inner resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 font-medium block">
                      Common room issues (click to test):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDescription(s.prompt)}
                          className="p-3 rounded-xl border border-slate-200/90 bg-white text-left hover:border-blue-400 hover:shadow-2xs transition-all group cursor-pointer"
                        >
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {s.title}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {s.prompt}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Natural Language Processing Active</span>
                    </div>

                    <button
                      type="submit"
                      disabled={!description.trim() || isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md shadow-slate-950/15 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting Ticket...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Direct Technician Dispatch</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Requests are automatically routed to the right maintenance personnel without phone call delays.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <HelpCircle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Intelligent Location Detection</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your registered room is automatically attached, or verified if you mention an issue in a common hallway.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Priority Safety Triage</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Urgent safety hazards like electrical sparking or pipe bursts are automatically marked high priority.
          </p>
        </div>
      </div>
    </div>
  );
};
