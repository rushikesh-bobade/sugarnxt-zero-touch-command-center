'use client';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-50 scanlines">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Animated scan line */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent opacity-30"
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Logo mark */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#22d3ee]/20 to-[#10b981]/20 border border-[#22d3ee]/30 flex items-center justify-center relative">
          <motion.div
            className="absolute inset-0 rounded-2xl border border-[#22d3ee]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Zap className="w-9 h-9 text-[#22d3ee]" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center mb-2"
      >
        <h1 className="text-2xl font-black text-[#f1f5f9] tracking-wider">
          Sugar<span className="text-[#22d3ee] text-glow-blue">Nxt</span>
        </h1>
        <p className="text-xs text-[#475569] terminal-text tracking-widest uppercase mt-1">
          Smart Factory Command Center
        </p>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-[11px] text-[#334155] terminal-text mb-8 text-center"
      >
        AI-Driven Cane-to-Bag Zero-Touch Manufacturing
      </motion.p>

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-64 flex flex-col gap-2"
      >
        <div className="flex items-center justify-between text-[9px] text-[#334155] terminal-text">
          <span>INITIALIZING SYSTEMS</span>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            LOADING...
          </motion.span>
        </div>
        <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] to-[#10b981]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.4, ease: 'easeInOut', delay: 0.2 }}
          />
        </div>

        {/* Boot sequence */}
        <div className="mt-2 space-y-0.5">
          {[
            { label: 'Digital Twin Engine', delay: 0.7 },
            { label: 'AI Predictive Module', delay: 1.0 },
            { label: 'Telemetry Streams', delay: 1.3 },
            { label: 'Alert Management System', delay: 1.6 },
            { label: 'Factory Systems Online', delay: 1.9 },
          ].map(({ label, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <motion.div
                className="w-1 h-1 rounded-full bg-[#10b981]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.1 }}
              />
              <span className="text-[9px] text-[#334155] terminal-text">{label}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.15 }}
                className="text-[9px] text-[#10b981] terminal-text ml-auto"
              >
                OK
              </motion.span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Version tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-6 text-center"
      >
        <p className="text-[9px] text-[#1e3a5f] terminal-text">
          SugarNxt Command Center v1.0 · SugarNxt Hackathon 2026 · Challenge 4
        </p>
      </motion.div>
    </div>
  );
}
