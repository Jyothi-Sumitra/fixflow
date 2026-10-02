import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, AUTHORIZED_RESIDENT_UNITS } from '../context/AuthContext';
import {
  Wrench,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  Lock,
  AlertCircle,
  KeyRound,
  Shield,
  Mail,
  DoorOpen,
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { loginResident, loginAdmin } = useAuth();

  // Mode: 'resident' (default) vs 'staff'
  const [mode, setMode] = useState<'resident' | 'staff'>('resident');

  // Resident form state
  const [selectedBlock, setSelectedBlock] = useState('Block B');
  const [roomNumber, setRoomNumber] = useState('204');
  const [residentPin, setResidentPin] = useState('1234');

  // Staff form state
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPasscode, setStaffPasscode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available rooms for selected block
  const currentBlockData = AUTHORIZED_RESIDENT_UNITS.find((b) => b.block === selectedBlock);
  const availableRooms = currentBlockData?.rooms || [];

  const handleResidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await loginResident(selectedBlock, roomNumber, residentPin);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed');
      } else if (onSuccess) {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await loginAdmin(staffEmail, staffPasscode);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid staff credentials');
      } else if (onSuccess) {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoResident = (block: string, room: string) => {
    setSelectedBlock(block);
    setRoomNumber(room);
    setResidentPin('1234');
    setErrorMsg(null);
  };

  const handleFillDemoStaff = () => {
    setStaffEmail('admin@fixflow.internal');
    setStaffPasscode('admin123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Mesh Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full mx-auto px-4 py-10">
        {/* Brand Header */}
        <div className="text-center mb-7 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-blue-400 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Campus Property Maintenance Portal</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
              FIXFLOW
            </h1>
          </div>
        </div>

        {/* Auth Card */}
        <motion.div
          layout
          className="rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
        >
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === 'resident' ? (
              /* RESIDENT LOGIN VIEW (Block + Room No + PIN) */
              <motion.div
                key="resident-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <DoorOpen className="w-5 h-5 text-blue-400" />
                    Resident Access
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your assigned Block and Room number to submit maintenance requests.
                  </p>
                </div>

                <form onSubmit={handleResidentSubmit} className="space-y-4">
                  {/* Block Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Campus Block / Wing
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={selectedBlock}
                        onChange={(e) => {
                          setSelectedBlock(e.target.value);
                          // Default room for block
                          const blockInfo = AUTHORIZED_RESIDENT_UNITS.find((b) => b.block === e.target.value);
                          if (blockInfo && blockInfo.rooms.length > 0) {
                            setRoomNumber(blockInfo.rooms[0]);
                          }
                        }}
                        className="w-full pl-9 pr-8 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none"
                      >
                        {AUTHORIZED_RESIDENT_UNITS.map((b) => (
                          <option key={b.block} value={b.block} className="bg-slate-900 text-white">
                            {b.block}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Room Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Room Number
                      </label>
                      <span className="text-[11px] text-slate-500">
                        e.g. 204
                      </span>
                    </div>
                    <div className="relative">
                      <DoorOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g. 204"
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono"
                      />
                    </div>

                    {/* Quick registered room pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500">Quick select:</span>
                      {availableRooms.slice(0, 5).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRoomNumber(r)}
                          className={`text-[11px] px-2 py-0.5 rounded-md border font-mono transition-colors ${
                            roomNumber === r
                              ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resident Access PIN */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Resident Access PIN
                      </label>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Default PIN: 1234
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        value={residentPin}
                        onChange={(e) => setResidentPin(e.target.value)}
                        placeholder="••••"
                        maxLength={6}
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono tracking-widest"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Verifying Room Record...</span>
                    ) : (
                      <>
                        <span>Enter Resident Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo Quick Fills for Evaluation */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500 block mb-2 font-medium">
                    Test Resident Rooms:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFillDemoResident('Block B', '204')}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors text-left flex items-center justify-between"
                    >
                      <span>Block B • Room 204</span>
                      <span className="text-[10px] text-slate-500 font-mono">Fill</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillDemoResident('Block A', '102')}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors text-left flex items-center justify-between"
                    >
                      <span>Block A • Room 102</span>
                      <span className="text-[10px] text-slate-500 font-mono">Fill</span>
                    </button>
                  </div>
                </div>

                {/* Subtle Staff Switch Link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('staff');
                      setErrorMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-600" />
                    <span>Facility Staff / Admin Portal</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* STAFF ADMIN LOGIN VIEW (Email + Passcode) */
              <motion.div
                key="staff-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    Facility Staff Login
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Restricted to maintenance supervisors and facility administrators.
                  </p>
                </div>

                <form onSubmit={handleStaffSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Staff Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        placeholder="admin@fixflow.internal"
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Security Passcode
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        value={staffPasscode}
                        onChange={(e) => setStaffPasscode(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Verifying Staff Access...</span>
                    ) : (
                      <>
                        <span>Access Operations Console</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Pre-fill for Admin Testing */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleFillDemoStaff}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    Auto-fill Staff Credentials (admin@fixflow.internal)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('resident');
                      setErrorMsg(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back to Resident Access
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
