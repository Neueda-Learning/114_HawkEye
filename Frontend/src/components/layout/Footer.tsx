import { ShieldCheck, Activity, Lock, Globe, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full bg-[#070d1a] border-t border-slate-800 text-slate-400 text-xs py-12 px-6 sm:px-12 mt-auto">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Grid: Brand & Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1: Brand Info (2 Columns Wide on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-wide text-white uppercase">HAWKEYE</span>
                <p className="text-[10px] text-blue-400 font-medium leading-none">Transaction Monitoring & Alert System</p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Next-generation transaction monitoring, real-time fraud alert triage, and rules engine platform built for banking and financial security.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
                <Lock className="h-3 w-3 text-cyan-400" /> 256-Bit TLS
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
                <Globe className="h-3 w-3 text-emerald-400" /> SOC 2 Certified
              </span>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><Link to="/customer/dashboard" className="hover:text-cyan-400 transition">User Dashboard</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-cyan-400 transition">Admin Console</Link></li>
              <li><Link to="/admin/metrics" className="hover:text-cyan-400 transition">Transaction Monitoring</Link></li>
              <li><Link to="/alerts" className="hover:text-cyan-400 transition">Alert Triage Center</Link></li>
              <li><Link to="/admin/rules" className="hover:text-cyan-400 transition">Rules Engine</Link></li>
            </ul>
          </div>

          {/* Column 3: Security & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compliance</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><span className="hover:text-white transition cursor-pointer">SOC 2 Type II</span></li>
              <li><span className="hover:text-white transition cursor-pointer">ISO 27001 Certified</span></li>
              <li><span className="hover:text-white transition cursor-pointer">PCI-DSS Compliant</span></li>
              <li><span className="hover:text-white transition cursor-pointer">GDPR Data Shield</span></li>
              <li><span className="hover:text-white transition cursor-pointer">AML / KYC Verification</span></li>
            </ul>
          </div>

          {/* Column 4: Support & Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><span className="hover:text-white transition cursor-pointer">API Documentation</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Developer Guide</span></li>
              <li>
                <span className="inline-flex items-center gap-1.5 hover:text-white transition cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  System Status (100%)
                </span>
              </li>
              <li><span className="hover:text-white transition cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="h-[1px] bg-slate-800/80 w-full"></div>

        {/* Bottom Bar: Copyright & Operational Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>© 2026 HawkEye Platform Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>All Systems Operational • Real-Time Protection Active</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-cyan-400 transition cursor-pointer flex items-center gap-1">
              <Github className="h-3.5 w-3.5" /> GitHub
            </span>
            <span className="hover:text-cyan-400 transition cursor-pointer flex items-center gap-1">
              <Twitter className="h-3.5 w-3.5" /> Twitter
            </span>
            <span className="hover:text-cyan-400 transition cursor-pointer flex items-center gap-1">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
