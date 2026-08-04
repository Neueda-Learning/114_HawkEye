import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar, RefreshCw, Filter, Download, CheckCircle2,
  AlertTriangle, Server, Cpu, Bell, Activity, Database, HardDrive,
  Globe, ExternalLink, ArrowDownRight, TrendingDown
} from 'lucide-react';

// Sparkline Mini Component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ x: i, y: v }));
  return (
    <ResponsiveContainer width="100%" height={24}>
      <LineChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Donut Gauge Progress Indicator
function GaugeProgress({ value, color }: { value: number; color: string }) {
  const data = [{ value }, { value: Math.max(0, 100 - value) }];
  return (
    <div className="relative flex items-center justify-center">
      <PieChart width={110} height={110}>
        <Pie data={data} cx={50} cy={50} innerRadius={36} outerRadius={48} dataKey="value" startAngle={90} endAngle={-270}>
          <Cell fill={color} />
          <Cell fill="#f3f4f6" />
        </Pie>
      </PieChart>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black text-gray-900 dark:text-white">{value}%</span>
        <span className="text-[9px] text-gray-400">Average</span>
      </div>
    </div>
  );
}

export default function SystemHealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [resourcePeriod, setResourcePeriod] = useState('Last 7 Days');
  const [uptimePeriod, setUptimePeriod] = useState('Last 30 Days');
  const [responseTimePeriod, setResponseTimePeriod] = useState('Last 7 Days');

  // Chart data
  const uptimeTrendData = [
    { date: 'Apr 22', uptime: 99.6 },
    { date: 'Apr 29', uptime: 99.4 },
    { date: 'May 06', uptime: 99.7 },
    { date: 'May 13', uptime: 99.8 },
    { date: 'May 20', uptime: 99.98 },
  ];

  const responseTimeData = [
    { date: 'May 15', txn: 35, rule: 120, alert: 98, monitoring: 75 },
    { date: 'May 16', txn: 38, rule: 140, alert: 100, monitoring: 78 },
    { date: 'May 17', txn: 36, rule: 125, alert: 96, monitoring: 74 },
    { date: 'May 18', txn: 34, rule: 130, alert: 98, monitoring: 75 },
    { date: 'May 19', txn: 40, rule: 145, alert: 105, monitoring: 80 },
    { date: 'May 20', txn: 37, rule: 128, alert: 99, monitoring: 76 },
    { date: 'May 21', txn: 38, rule: 142, alert: 102, monitoring: 78 },
  ];

  const microservices = [
    {
      name: 'Transaction Service',
      status: 'Healthy',
      icon: <Server className="h-5 w-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      uptime: '99.98%',
      respTime: '98 ms',
      cpu: 32,
      cpuSpark: [28, 30, 31, 29, 32],
      mem: 45,
      memSpark: [40, 42, 43, 44, 45],
      color: '#22c55e',
    },
    {
      name: 'Rule Engine Service',
      status: 'Healthy',
      icon: <Cpu className="h-5 w-5 text-blue-600" />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      uptime: '99.95%',
      respTime: '120 ms',
      cpu: 28,
      cpuSpark: [25, 27, 26, 28, 28],
      mem: 50,
      memSpark: [45, 48, 49, 51, 50],
      color: '#2563eb',
    },
    {
      name: 'Alert Service',
      status: 'Healthy',
      icon: <Bell className="h-5 w-5 text-purple-600" />,
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      uptime: '99.96%',
      respTime: '110 ms',
      cpu: 24,
      cpuSpark: [20, 22, 23, 22, 24],
      mem: 42,
      memSpark: [38, 40, 41, 40, 42],
      color: '#8b5cf6',
    },
    {
      name: 'Monitoring Rules Service',
      status: 'Healthy',
      icon: <Activity className="h-5 w-5 text-orange-600" />,
      iconBg: 'bg-orange-50 dark:bg-orange-900/30',
      uptime: '99.97%',
      respTime: '105 ms',
      cpu: 26,
      cpuSpark: [22, 24, 25, 24, 26],
      mem: 48,
      memSpark: [42, 45, 46, 47, 48],
      color: '#f59e0b',
    },
  ];

  const incidents = [
    { time: 'May 21, 2024 10:15 AM', text: 'All systems operational', type: 'info', status: 'Resolved' },
    { time: 'May 19, 2024 02:30 PM', text: 'High response time on Rule Engine Service', type: 'warn', status: 'Resolved' },
    { time: 'May 18, 2024 11:45 PM', text: 'Alert Service intermittent slowdown', type: 'error', status: 'Resolved' },
    { time: 'May 17, 2024 04:20 AM', text: 'High memory usage on Transaction Service', type: 'warn', status: 'Resolved' },
    { time: 'May 15, 2024 09:10 AM', text: 'All systems operational', type: 'info', status: 'Resolved' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Dashboard</span>
            <span>›</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">System Health</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">System Health</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>May 15, 2024 - May 21, 2024</span>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'text-emerald-500 animate-spin' : 'text-gray-400'}`} />
            <span>Auto Refresh: <strong className={autoRefresh ? 'text-emerald-600' : 'text-gray-400'}>{autoRefresh ? 'On' : 'Off'}</strong></span>
          </button>

          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>

          <button className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700">
            <Download className="h-3.5 w-3.5" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* ── Row 1 — 4 Microservice Service Cards ────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {microservices.map((svc) => (
          <div key={svc.name} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${svc.iconBg}`}>
                  {svc.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{svc.name}</h3>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {svc.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-b border-gray-50 py-3 dark:border-gray-800 text-xs">
              <div>
                <p className="text-[10px] text-gray-400">Uptime</p>
                <p className="mt-0.5 text-lg font-black text-emerald-600 dark:text-emerald-400">{svc.uptime}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Response Time</p>
                <p className="mt-0.5 text-lg font-black text-gray-900 dark:text-white">{svc.respTime}</p>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">CPU Usage <strong className="text-gray-900 dark:text-white">{svc.cpu}%</strong></span>
                <div className="w-20"><Sparkline data={svc.cpuSpark} color={svc.color} /></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Memory Usage <strong className="text-gray-900 dark:text-white">{svc.mem}%</strong></span>
                <div className="w-20"><Sparkline data={svc.memSpark} color={svc.color} /></div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-gray-50 dark:border-gray-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>All systems operational</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2 — Resource Utilization (Overall) (4 Donut Gauges) ────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Resource Utilization (Overall)</h2>
          <select
            value={resourcePeriod}
            onChange={(e) => setResourcePeriod(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Gauge 1 — CPU */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-50 bg-gray-50/40 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <GaugeProgress value={32} color="#22c55e" />
            <div className="flex-1 space-y-1 text-xs">
              <p className="font-bold text-gray-900 dark:text-white">CPU Usage</p>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Cores Used</span><strong className="text-gray-800 dark:text-gray-200">16 / 50</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>System Load</span><strong className="text-gray-800 dark:text-gray-200">1.02</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Peak Usage</span><strong className="text-gray-800 dark:text-gray-200">78%</strong></div>
              <span className="inline-block pt-1 text-[10px] font-semibold text-emerald-600">↓ 8% from last week</span>
            </div>
          </div>

          {/* Gauge 2 — Memory */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-50 bg-gray-50/40 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <GaugeProgress value={45} color="#2563eb" />
            <div className="flex-1 space-y-1 text-xs">
              <p className="font-bold text-gray-900 dark:text-white">Memory Usage</p>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Memory Used</span><strong className="text-gray-800 dark:text-gray-200">22.6 GB / 50 GB</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Swap Used</span><strong className="text-gray-800 dark:text-gray-200">1.2 GB / 8 GB</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Peak Usage</span><strong className="text-gray-800 dark:text-gray-200">72%</strong></div>
              <span className="inline-block pt-1 text-[10px] font-semibold text-emerald-600">↓ 6% from last week</span>
            </div>
          </div>

          {/* Gauge 3 — Disk */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-50 bg-gray-50/40 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <GaugeProgress value={28} color="#8b5cf6" />
            <div className="flex-1 space-y-1 text-xs">
              <p className="font-bold text-gray-900 dark:text-white">Disk Usage</p>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Disk Used</span><strong className="text-gray-800 dark:text-gray-200">256 GB / 1 TB</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>I/O Read</span><strong className="text-gray-800 dark:text-gray-200">120 MB/s</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>I/O Write</span><strong className="text-gray-800 dark:text-gray-200">98 MB/s</strong></div>
              <span className="inline-block pt-1 text-[10px] font-semibold text-emerald-600">↓ 5% from last week</span>
            </div>
          </div>

          {/* Gauge 4 — Network */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-50 bg-gray-50/40 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <GaugeProgress value={32} color="#f59e0b" />
            <div className="flex-1 space-y-1 text-xs">
              <p className="font-bold text-gray-900 dark:text-white">Network Usage</p>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Inbound</span><strong className="text-gray-800 dark:text-gray-200">152 Mbps</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Outbound</span><strong className="text-gray-800 dark:text-gray-200">148 Mbps</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Packet Loss</span><strong className="text-gray-800 dark:text-gray-200">0.02%</strong></div>
              <span className="inline-block pt-1 text-[10px] font-semibold text-emerald-600">↓ 3% from last week</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3 — Availability, Response Times & Recent Incidents (3 Columns) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* System Availability (Uptime) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">System Availability (Uptime)</h2>
            <select
              value={uptimePeriod}
              onChange={(e) => setUptimePeriod(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option>Last 30 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={uptimeTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis domain={[98, 100]} tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Uptime']} />
              <Line type="monotone" dataKey="uptime" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-4 gap-2 border-t border-gray-100 pt-3 text-center text-xs dark:border-gray-800">
            <div><p className="text-sm font-black text-gray-900 dark:text-white">99.98%</p><p className="text-[9px] text-gray-400">Average Uptime</p></div>
            <div><p className="text-sm font-black text-emerald-600">100%</p><p className="text-[9px] text-gray-400">Best Day</p></div>
            <div><p className="text-sm font-black text-amber-500">99.50%</p><p className="text-[9px] text-gray-400">Worst Day</p></div>
            <div><p className="text-sm font-black text-gray-900 dark:text-white">0</p><p className="text-[9px] text-gray-400">Downtime (Mins)</p></div>
          </div>
        </div>

        {/* Service Response Time (ms) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Service Response Time (ms)</h2>
            <select
              value={responseTimePeriod}
              onChange={(e) => setResponseTimePeriod(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="mb-2 flex flex-wrap gap-2 text-[9px] text-gray-500">
            <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-emerald-500" />Txn</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-blue-500" />Rule Engine</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-purple-500" />Alert</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-amber-500" />Monitoring</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={responseTimeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Tooltip />
              <Line type="monotone" dataKey="txn" stroke="#22c55e" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="rule" stroke="#2563eb" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="alert" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="monitoring" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-4 gap-1 border-t border-gray-100 pt-2 text-center text-[10px] dark:border-gray-800">
            <div><p className="font-bold text-emerald-600">98 ms</p><p className="text-gray-400">Transaction</p></div>
            <div><p className="font-bold text-blue-600">120 ms</p><p className="text-gray-400">Rule Engine</p></div>
            <div><p className="font-bold text-purple-600">110 ms</p><p className="text-gray-400">Alert Service</p></div>
            <div><p className="font-bold text-amber-600">105 ms</p><p className="text-gray-400">Monitoring Rules</p></div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Incidents</h2>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-3 text-xs">
            {incidents.map((inc, i) => (
              <div key={i} className="flex items-start justify-between gap-2 border-b border-gray-50 pb-2.5 last:border-0 dark:border-gray-800">
                <div className="flex items-start gap-2">
                  {inc.type === 'info' && <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />}
                  {inc.type === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />}
                  {inc.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                  <div>
                    <p className="text-[10px] text-gray-400">{inc.time}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{inc.text}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {inc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4 — System Operational Status Footer Bar ───────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">All Systems Operational</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">TMAS is running smoothly. No active incidents at this time.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-emerald-800 dark:text-emerald-300">
          <span>Last Checked: <strong>May 21, 2024 10:30 AM</strong></span>
          <button className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 font-bold text-emerald-700 shadow-sm hover:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-900 dark:text-emerald-300">
            <span>View Status Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
