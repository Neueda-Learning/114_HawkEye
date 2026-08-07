import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from '@/components/common/Toast';

interface DateRangePickerProps {
  initialLabel?: string;
  onRangeChange?: (label: string, startDate?: string, endDate?: string) => void;
}

export function DateRangePicker({ initialLabel, onRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Last 7 Days');
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Date calculations
  const defaultLast7 = useMemo(() => {
    const start = dayjs().subtract(6, 'day').format('MMM DD');
    const end = dayjs().format('MMM DD, YYYY');
    return `${start} – ${end}`;
  }, []);

  const [customLabel, setCustomLabel] = useState(initialLabel || defaultLast7);
  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const presets = useMemo(() => {
    const today = dayjs().format('MMM DD, YYYY');
    const yesterday = dayjs().subtract(1, 'day').format('MMM DD, YYYY');
    const last7 = `${dayjs().subtract(6, 'day').format('MMM DD')} – ${dayjs().format('MMM DD, YYYY')}`;
    const last30 = `${dayjs().subtract(29, 'day').format('MMM DD')} – ${dayjs().format('MMM DD, YYYY')}`;
    const thisMonth = `${dayjs().startOf('month').format('MMM DD')} – ${dayjs().endOf('month').format('MMM DD, YYYY')}`;

    return [
      { label: 'Today', dateText: today },
      { label: 'Yesterday', dateText: yesterday },
      { label: 'Last 7 Days', dateText: last7 },
      { label: 'Last 30 Days', dateText: last30 },
      { label: 'This Month', dateText: thisMonth },
      { label: 'Custom Range', dateText: 'Custom' },
    ];
  }, []);

  const handleSelectPreset = (preset: { label: string; dateText: string }) => {
    setSelectedRange(preset.label);
    if (preset.label !== 'Custom Range') {
      setCustomLabel(preset.dateText);
      setIsOpen(false);
      toast.success(`Date range set to ${preset.label} (${preset.dateText})`);
      if (onRangeChange) onRangeChange(preset.dateText);
    }
  };

  const handleApplyCustom = () => {
    if (!startDate || !endDate) return;
    const formatted = `${dayjs(startDate).format('MMM DD, YYYY')} – ${dayjs(endDate).format('MMM DD, YYYY')}`;
    setCustomLabel(formatted);
    setIsOpen(false);
    toast.success(`Custom date range applied: ${formatted}`);
    if (onRangeChange) onRangeChange(formatted, startDate, endDate);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition"
      >
        <Calendar className="h-4 w-4 text-purple-600" />
        <span>{customLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl z-50 animate-fade-in font-sans">
          <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2.5 px-1">
            Select Date Range
          </div>

          <div className="space-y-1">
            {presets.map((p) => {
              const isSelected = selectedRange === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                    isSelected ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{p.label}</span>
                    {p.label !== 'Custom Range' && (
                      <span className="text-[10px] text-slate-400 font-medium">{p.dateText}</span>
                    )}
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-purple-600" />}
                </button>
              );
            })}
          </div>

          {selectedRange === 'Custom Range' && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition shadow-sm"
              >
                Apply Custom Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
