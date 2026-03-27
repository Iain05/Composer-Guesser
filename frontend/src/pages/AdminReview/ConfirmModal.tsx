import React from 'react';

export type PendingAction = 'approve' | 'reject' | 'unreject' | 'delete' | 'restore' | 'save';

interface ActionConfig {
  title: string;
  message: string;
  confirmLabel: string;
  confirmStyle: string;
}

const ACTION_CONFIG: Record<PendingAction, ActionConfig> = {
  save: {
    title: 'Save changes?',
    message: 'The metadata for this excerpt will be updated. Its status will not change.',
    confirmLabel: 'Save',
    confirmStyle: 'bg-primary hover:bg-primary-hover text-white',
  },
  approve: {
    title: 'Approve submission?',
    message: 'This excerpt will become active and eligible for the daily challenge. Your edits will be saved.',
    confirmLabel: 'Approve',
    confirmStyle: 'bg-green-500 hover:bg-green-600 text-white',
  },
  reject: {
    title: 'Reject submission?',
    message: 'This excerpt will be marked as rejected. You can unreject it later.',
    confirmLabel: 'Reject',
    confirmStyle: 'bg-red-500 hover:bg-red-600 text-white',
  },
  unreject: {
    title: 'Move back to pending?',
    message: 'This excerpt will be moved back to draft for re-review.',
    confirmLabel: 'Unreject',
    confirmStyle: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  delete: {
    title: 'Delete excerpt?',
    message: 'This excerpt will be removed from the active pool. You can restore it later.',
    confirmLabel: 'Delete',
    confirmStyle: 'bg-red-500 hover:bg-red-600 text-white',
  },
  restore: {
    title: 'Restore excerpt?',
    message: 'This excerpt will be restored to active status and become eligible for the daily challenge again.',
    confirmLabel: 'Restore',
    confirmStyle: 'bg-green-500 hover:bg-green-600 text-white',
  },
};

interface ConfirmModalProps {
  action: PendingAction;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ action, loading, onConfirm, onCancel }) => {
  const cfg = ACTION_CONFIG[action];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="modal-card bg-canvas border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-lg font-bold text-ink mb-2">{cfg.title}</h2>
        <p className="text-ink-muted text-sm mb-6">{cfg.message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-surface border border-border text-ink-muted text-sm font-semibold rounded-xl hover:border-border-hover hover:text-ink transition-all disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${cfg.confirmStyle}`}
          >
            {loading ? 'Working…' : cfg.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
