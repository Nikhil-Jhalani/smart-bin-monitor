import { BinStatus, PriorityLevel } from '../types';

export function getStatusColor(status: BinStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  hex: string;
  label: string;
} {
  switch (status) {
    case 'urgent':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-300',
        dot: 'bg-rose-600',
        hex: '#ef4444',
        label: 'Urgent (100%)'
      };
    case 'almost_full':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-300',
        dot: 'bg-red-500',
        hex: '#f43f5e',
        label: 'Almost Full'
      };
    case 'cleaning_recommended':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-300',
        dot: 'bg-orange-500',
        hex: '#f97316',
        label: 'Cleaning Recommended'
      };
    case 'overdue':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500',
        hex: '#f59e0b',
        label: 'Cleaning Overdue'
      };
    case 'partially_full':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        dot: 'bg-yellow-500',
        hex: '#eab308',
        label: 'Partially Full'
      };
    case 'normal':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-300',
        dot: 'bg-emerald-500',
        hex: '#10b981',
        label: 'Normal'
      };
  }
}

export function getPriorityBadge(priority: PriorityLevel): { bg: string; text: string } {
  switch (priority) {
    case 'urgent':
      return { bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'Urgent' };
    case 'high':
      return { bg: 'bg-orange-100 text-orange-800 border-orange-200', text: 'High' };
    case 'medium':
      return { bg: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Medium' };
    case 'low':
    default:
      return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'Low' };
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}
