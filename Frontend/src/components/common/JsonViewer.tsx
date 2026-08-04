import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonViewerProps {
  data: unknown;
  title?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export function JsonViewer({ data, title, defaultExpanded = false, className }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          {title ?? 'JSON Payload'}
        </span>
        {expanded && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); void handleCopy(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label="Copy JSON"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </span>
        )}
      </button>

      {/* Body */}
      {expanded && (
        <pre className="overflow-x-auto border-t border-gray-100 bg-gray-900 px-4 py-3 text-xs text-green-400 dark:border-gray-700 rounded-b-lg">
          <code>{json}</code>
        </pre>
      )}
    </div>
  );
}

