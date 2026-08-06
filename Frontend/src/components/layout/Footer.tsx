import { ShieldCheck, Lock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full bg-[#070d1a] border-t border-slate-800 text-slate-400 text-xs py-4 px-6 sm:px-10 mt-auto shrink-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand info & Copyright */}
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-white uppercase">HAWKEYE</span>
              <span className="text-[10px] text-slate-500 font-medium">v2.4.0</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              © 2026 HawkEye Platform Inc. All rights reserved.
            </p>
          </div>
        </div>

        {/* Center: Essential Navigation */}
        <div className="flex items-center gap-5 text-[11px] font-semibold text-slate-400">
          <Link to="/customer/dashboard" className="hover:text-cyan-400 transition-colors">User Portal</Link>
          <span className="text-slate-700">•</span>
          <Link to="/admin/dashboard" className="hover:text-cyan-400 transition-colors">Admin Console</Link>
          <span className="text-slate-700">•</span>
          <span className="hover:text-slate-200 transition-colors cursor-pointer">Security</span>
          <span className="text-slate-700">•</span>
          <span className="hover:text-slate-200 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="text-slate-700">•</span>
          <span className="hover:text-slate-200 transition-colors cursor-pointer">Terms</span>
        </div>

        {/* Right: Security & Operational Status */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium">
            <Lock className="h-3 w-3 text-cyan-400" /> 256-Bit TLS
          </span>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-800/50 px-3 py-1 rounded-full">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>Systems Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
