import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AlertStatus, Severity, RuleStatus, TransactionStatus } from '../types';

dayjs.extend(relativeTime);
dayjs.extend(utc);

// ─── Tailwind class merging ───────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date helpers ────────────────────────────────────────────────────────────
export const formatDate = (iso: string) => dayjs(iso).format('DD MMM YYYY, HH:mm');
export const formatDateShort = (iso: string) => dayjs(iso).format('DD MMM YYYY');
export const formatTime = (iso: string) => dayjs(iso).format('HH:mm:ss');
export const fromNow = (iso: string) => dayjs(iso).fromNow();

// ─── Currency ────────────────────────────────────────────────────────────────
export const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

// ─── Status colours ──────────────────────────────────────────────────────────
export const alertStatusColor: Record<AlertStatus, string> = {
  OPEN:          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  ACKNOWLEDGED:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  INVESTIGATING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  CLOSED:        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  DISMISSED:     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export const severityColor: Record<Severity, string> = {
  LOW:      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM:   'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  HIGH:     'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  CRITICAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

export const ruleStatusColor: Record<RuleStatus, string> = {
  ACTIVE:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  DELETED:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const txStatusColor: Record<TransactionStatus, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  FAILED:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  REVERSED:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

// ─── Alert status transitions ────────────────────────────────────────────────
export const validTransitions: Record<AlertStatus, AlertStatus[]> = {
  OPEN:          ['ACKNOWLEDGED', 'INVESTIGATING', 'DISMISSED'],
  ACKNOWLEDGED:  ['INVESTIGATING', 'CLOSED', 'DISMISSED'],
  INVESTIGATING: ['CLOSED', 'DISMISSED'],
  CLOSED:        [],
  DISMISSED:     [],
};

export const isTerminalStatus = (status: AlertStatus) =>
  status === 'CLOSED' || status === 'DISMISSED';

export const canTransition = (from: AlertStatus, to: AlertStatus) =>
  validTransitions[from].includes(to);

// ─── Rule type labels ─────────────────────────────────────────────────────────
export const ruleTypeLabel: Record<string, string> = {
  AMOUNT_THRESHOLD: 'Amount Threshold',
  VELOCITY:         'Velocity',
  NEW_PAYEE:        'New Payee',
  DAILY_LIMIT:      'Daily Limit',
};

// ─── Truncate ────────────────────────────────────────────────────────────────
export const truncate = (str: string, maxLen = 40) =>
  str.length > maxLen ? str.slice(0, maxLen) + '…' : str;

