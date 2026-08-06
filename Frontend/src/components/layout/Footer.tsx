import { ShieldCheck, Lock, Activity, ExternalLink, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full bg-[#070d1a] border-t border-slate-800 text-slate-400 text-xs py-6 px-6 sm:px-10 mt-auto shrink-0 z-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Section: 3 Compact Columns for Real Enterprise Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-5 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Certification (Spans 2 cols on desktop) */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-widest text-white uppercase">HAWKEYE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-semibold">
                    v2.4.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-tight">
                  Next-Gen Transaction Monitoring & Anti-Money Laundering Platform
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-normal leading-relaxed max-w-lg">
              Empowering financial institutions with real-time risk scoring, automated rule evaluation, 
              and immediate fraud triage.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300">
                <Lock className="h-3 w-3 text-cyan-400" /> 256-Bit TLS Encryption
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> SOC 2 Type II Certified
              </span>
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200">
              Platform Features
            </h4>
            <ul className="space-y-1.5 text-[11px] font-medium text-slate-400">
              <li>
                <Link to="/customer/dashboard" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  User Portal <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Admin Analytics <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="hover:text-cyan-400 transition-colors">
                  Real-time Alert Triage
                </Link>
              </li>
              <li>
                <Link to="/admin/rules" className="hover:text-cyan-400 transition-colors">
                  Rule Evaluation Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Support */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200">
              Compliance & Support
            </h4>
            <ul className="space-y-1.5 text-[11px] font-medium text-slate-400">
              <li>
                <span className="hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-amber-400" /> Security & Trust Center
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors cursor-pointer">
                  Privacy Policy & GDPR
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1">
                  <Mail className="h-3 w-3 text-cyan-400" /> support@hawkeye.com
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright & Operational Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p className="text-slate-400 font-medium">
            © 2026 HawkEye Platform Inc. All rights reserved. Built for high-frequency financial surveillance.
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full text-[11px]">
              <Activity className="h-3 w-3 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
