import type { ExcerptStatus, SortOption } from '@src/api/admin';

export const STATUS_LABELS: Record<ExcerptStatus, string> = {
  DRAFT:    'Pending',
  ACTIVE:   'Active',
  REJECTED: 'Rejected',
  DELETED:  'Deleted',
};

export const STATUS_BADGE: Record<ExcerptStatus, string> = {
  DRAFT:    'bg-amber-400 text-white dark:bg-amber-900/30 dark:text-amber-400',
  ACTIVE:   'bg-green-500 text-white dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-500 text-white dark:bg-red-900/30 dark:text-red-400',
  DELETED:  'bg-zinc-400 text-white dark:bg-zinc-800 dark:text-zinc-400',
};

export const ALL_STATUSES: ExcerptStatus[] = ['DRAFT', 'ACTIVE', 'REJECTED', 'DELETED'];

export const SORT_LABELS: Record<SortOption, string> = {
  timesUsed_asc:    'Times used ↑',
  timesUsed_desc:   'Times used ↓',
  dateUploaded_asc: 'Date uploaded ↑',
  dateUploaded_desc:'Date uploaded ↓',
};
