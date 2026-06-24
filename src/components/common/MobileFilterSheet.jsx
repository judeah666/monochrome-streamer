import React from 'react';
import { createPortal } from 'react-dom';

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function MobileFilterSheet({
  open = false,
  title,
  description = '',
  children,
  footer = null,
  onClose,
}) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const dialogRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const closeButton = dialog?.querySelector('[data-mobile-filter-close]');
    const mobileQuery = window.matchMedia('(max-width: 720px)');

    document.body.classList.add('mobile-filter-sheet-open');
    closeButton?.focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;
      const focusable = [...dialog.querySelectorAll(focusableSelector)];
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleViewportChange = (event) => {
      if (!event.matches) onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    mobileQuery.addEventListener?.('change', handleViewportChange);

    return () => {
      document.body.classList.remove('mobile-filter-sheet-open');
      document.removeEventListener('keydown', handleKeyDown);
      mobileQuery.removeEventListener?.('change', handleViewportChange);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="mobile-filter-sheet-layer"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        ref={dialogRef}
        className="mobile-filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="mobile-filter-sheet-handle" aria-hidden="true" />
        <header className="mobile-filter-sheet-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          <button
            type="button"
            className="mobile-filter-sheet-close"
            aria-label={`Close ${title}`}
            data-mobile-filter-close
            onClick={() => onClose?.()}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>
        <div className="mobile-filter-sheet-body">{children}</div>
        {footer ? <footer className="mobile-filter-sheet-footer">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
}
