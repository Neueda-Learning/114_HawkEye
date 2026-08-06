import { ShieldCheck, Lock, Activity, Mail, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full bg-[#070d1a] border-t border-slate-800 text-slate-400 text-xs py-3 px-6 sm:px-10 mt-auto shrink-0 z-20">
      <div className="max-w-7xl mx-auto space-y-2.5">
        
        {/* Row 1: Brand, Quick Enterprise Nav & Compliance Badges */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
          
          {/* Brand & Mission Tag */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-white uppercase">HAWKEYE</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 font-mono font-semibold">
                v2.4.0
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">
                Transaction Surveillance & AML Platform
              </span>
            </div>
          </div>

          {/* Essential Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-slate-400">
            <Link to="/customer/dashboard" className="hover:text-cyan-400 transition-colors">User Portal</Link>
            <span className="text-slate-700">•</span>
            <Link to="/admin/dashboard" className="hover:text-cyan-400 transition-colors">Admin Console</Link>
            <span className="text-slate-700">•</span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-amber-400" /> Security
            </span>
            <span className="text-slate-700">•</span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer">Privacy & GDPR</span>
            <span className="text-slate-700">•</span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer">Terms</span>
            <span className="text-slate-700">•</span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1">
              <Mail className="h-3 w-3 text-cyan-400" /> support@hawkeye.com
            </span>
          </div>

        </div>

        {/* Row 2: Copyright & Operational Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          
          <div className="flex items-center gap-3">
            <p className="text-slate-400 font-medium">
              © 2026 HawkEye Platform Inc. All rights reserved.
            </p>
            <span className="hidden md:inline text-slate-700">•</span>
            <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3 text-cyan-400" /> 256-Bit TLS
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> SOC 2 Certified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full text-[10px]">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>Systems Operational</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
