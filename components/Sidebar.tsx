'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Box,
  BarChart3,
  Bell,
  Zap,
  Activity,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/digital-twin', label: 'Digital Twin', icon: Box },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/alerts', label: 'AI Alerts', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 lg:w-56 h-screen bg-[#111827] border-r border-[#1e293b] flex flex-col shrink-0 relative z-20">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center lg:justify-start px-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#22d3ee] to-[#10b981] flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#0f172a]" strokeWidth={2.5} />
          </div>
          <span className="hidden lg:block text-sm font-bold text-[#f1f5f9] tracking-wide">
            SugarNxt
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        <div className="hidden lg:block text-[10px] font-semibold text-[#475569] uppercase tracking-widest px-2 mb-2">
          Control Center
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`
                  flex items-center gap-3 px-2 lg:px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
                  ${active
                    ? 'bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee]'
                    : 'text-[#64748b] hover:bg-[#1e293b] hover:text-[#94a3b8] border border-transparent'
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${active ? 'text-[#22d3ee]' : 'text-[#475569] group-hover:text-[#94a3b8]'}`}
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className={`hidden lg:block text-xs font-medium ${active ? 'text-glow-blue' : ''}`}>
                  {label}
                </span>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="hidden lg:block ml-auto w-1 h-1 rounded-full bg-[#22d3ee]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="p-3 border-t border-[#1e293b]">
        <div className="hidden lg:flex items-center gap-2 px-2 py-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20">
          <Activity className="w-3 h-3 text-[#10b981] shrink-0" />
          <div>
            <p className="text-[10px] text-[#10b981] font-semibold">SYSTEM ONLINE</p>
            <p className="text-[9px] text-[#475569]">All nodes active</p>
          </div>
        </div>
        <div className="lg:hidden flex justify-center">
          <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
      </div>
    </aside>
  );
}
