import React from 'react';

export type SubmitState = 'confirm' | 'uploading' | 'success' | 'error';

interface SubmitExcerptModalProps {
  state: SubmitState;
  errorMessage?: string;
  onConfirm: () => void;
  onRetry: () => void;
  onClose: () => void;
}

const SubmitExcerptModal: React.FC<SubmitExcerptModalProps> = ({
  state,
  errorMessage,
  onConfirm,
  onRetry,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={state !== 'uploading' ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center gap-6 text-center">

        {state === 'confirm' && (
          <>
            <div className="text-4xl">⚠️</div>
            <div>
              <h2 className="text-lg font-bold text-ink mb-2">Submit this excerpt?</h2>
              <p className="text-ink-muted text-sm leading-relaxed">
                This cannot be undone. Your excerpt will be reviewed by an admin before it appears in the game.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border-2 border-border text-ink-muted font-semibold rounded-xl hover:border-border-hover hover:text-ink transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-md"
              >
                Submit
              </button>
            </div>
          </>
        )}

        {state === 'uploading' && (
          <>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink mb-2">Uploading…</h2>
              <p className="text-ink-muted text-sm">
                Encoding and sending your excerpt. Please don't close this tab.
              </p>
            </div>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-3xl text-green-600 dark:text-green-400">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink mb-2">Submitted!</h2>
              <p className="text-ink-muted text-sm leading-relaxed">
                Your excerpt has been received and is awaiting admin approval. It will appear in the game once it's been reviewed.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-md"
            >
              Done
            </button>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl">
              ✕
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink mb-2">Upload failed</h2>
              <p className="text-ink-muted text-sm leading-relaxed">
                {errorMessage ?? 'Something went wrong. Your excerpt was not saved — it is safe to try again.'}
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border-2 border-border text-ink-muted font-semibold rounded-xl hover:border-border-hover hover:text-ink transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onRetry}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-md"
              >
                Try again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubmitExcerptModal;
