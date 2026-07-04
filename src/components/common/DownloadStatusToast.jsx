import React from 'react';

const PHASE_LABELS = {
  preparing: 'Preparing download...',
  downloading: 'Downloading...',
  complete: 'Download ready',
  failed: 'Download failed',
};

export function DownloadStatusToast({
  phase = 'idle',
  label = '',
  detail = '',
  error = '',
  onDismiss,
}) {
  if (phase === 'idle') return null;

  const failed = phase === 'failed';
  const active = phase === 'preparing' || phase === 'downloading';
  const message = failed ? (error || 'Download failed.') : (detail || PHASE_LABELS[phase] || 'Download status');

  return (
    <section
      className={`download-status-toast is-${phase}`}
      role={failed ? 'alert' : 'status'}
      aria-live={failed ? 'assertive' : 'polite'}
      aria-busy={active ? 'true' : undefined}
    >
      <span className="download-status-spinner" aria-hidden="true"></span>
      <div className="download-status-copy">
        <strong>{PHASE_LABELS[phase] || 'Download status'}</strong>
        {label ? <span>{label}</span> : null}
        <small>{message}</small>
      </div>
      <button type="button" aria-label="Dismiss download status" onClick={() => onDismiss?.()}>
        <i className="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    </section>
  );
}
