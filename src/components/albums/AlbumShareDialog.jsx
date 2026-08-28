import React, { useId, useRef, useState } from 'react';

export function AlbumShareDialog({ albumTitle = '', onClose, onGenerate }) {
  const selectId = useId();
  const linkId = useId();
  const linkInputRef = useRef(null);
  const [hours, setHours] = useState(24);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  async function generate(event) {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      const result = await onGenerate?.(hours);
      setShareLink(result?.url || '');
      setExpiresAt(result?.expiresAt || '');
      setStatus(result?.copied
        ? 'Link created and copied.'
        : 'Link created. Copy it manually below.');
    } catch (error) {
      setStatus(error?.message || 'Unable to create album link.');
    } finally {
      setBusy(false);
    }
  }

  async function copyGeneratedLink() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setStatus('Link copied.');
    } catch {
      linkInputRef.current?.select();
      setStatus('Select and copy the link manually.');
    }
  }

  const formattedExpiry = expiresAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(expiresAt))
    : '';

  return (
    <div className="playlist-dialog-content album-share-dialog-content" role="document">
      <header className="playlist-dialog-header">
        <div>
          <span className="eyebrow">Album share</span>
          <h2>Time-limited link</h2>
          <p>Create guest listening access for “{albumTitle}”. Downloads stay disabled.</p>
        </div>
        <button type="button" className="icon-button" aria-label="Close album share dialog" onClick={onClose} disabled={busy}>
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </header>
      <form className="playlist-dialog-form" onSubmit={generate}>
        <label className="playlist-name-field" htmlFor={selectId}>
          <span>Link expires after (hours)</span>
          <input
            id={selectId}
            type="number"
            min="1"
            max="720"
            step="1"
            value={hours}
            disabled={busy}
            autoFocus
            required
            onChange={(event) => setHours(Number(event.target.value))}
          />
          <small>Enter any whole number from 1 to 720 hours.</small>
        </label>
        {shareLink ? (
          <div className="album-share-result">
            <label className="playlist-name-field" htmlFor={linkId}>
              <span>Share link</span>
              <input ref={linkInputRef} id={linkId} type="text" readOnly value={shareLink} onFocus={(event) => event.target.select()} />
            </label>
            <button type="button" className="secondary-button" onClick={copyGeneratedLink}>Copy link</button>
            <small>Expires {formattedExpiry}</small>
          </div>
        ) : null}
        {status ? <p className="playlist-dialog-status" role="status">{status}</p> : null}
        <footer className="playlist-dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>Close</button>
          <button type="submit" className="primary-button" disabled={busy || !Number.isInteger(hours) || hours < 1 || hours > 720}>
            {busy ? 'Creating...' : shareLink ? 'Create another link' : 'Create and copy link'}
          </button>
        </footer>
      </form>
    </div>
  );
}
