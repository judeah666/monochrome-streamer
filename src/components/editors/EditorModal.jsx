import React from 'react';

const headerClassName = [
  'tag-editor-header tw-flex tw-flex-none tw-items-center tw-justify-between tw-gap-[18px]',
  'tw-border-b tw-border-line tw-px-6 tw-py-5 max-[720px]:tw-p-4',
].join(' ');

const footerClassName = [
  'tag-editor-footer tw-flex tw-flex-none tw-items-center tw-justify-between tw-gap-[18px]',
  'tw-border-t tw-border-line tw-px-6 tw-py-5 max-[720px]:tw-flex-col max-[720px]:tw-items-stretch max-[720px]:tw-p-4',
].join(' ');

const footerActionsClassName = 'tw-flex tw-gap-3 max-[720px]:tw-w-full';
const shellClassName = 'tw-flex tw-h-full tw-min-h-0 tw-flex-col tw-overflow-hidden';
const defaultBodyRootClassName = 'tw-flex tw-min-h-0 tw-flex-1 tw-flex-col';

export function EditorModal({
  eyebrow = '',
  title = '',
  titleId = '',
  caption = '',
  closeButtonId = '',
  closeLabel = 'Close editor',
  bodyRootId = '',
  bodyRootClassName = '',
  resetButtonId = '',
  resetLabel = 'Reset',
  deleteButtonId = '',
  deleteLabel = 'Delete',
  cancelButtonId = '',
  cancelLabel = 'Cancel',
  saveButtonId = '',
  saveLabel = 'Save',
  children = null,
  onClose,
  onCancel,
  onReset,
  onDelete,
  onSave,
  resetDisabled = false,
  deleteDisabled = false,
  saveDisabled = false,
}) {
  const resolvedBodyRootClassName = [defaultBodyRootClassName, bodyRootClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClassName}>
      <header className={headerClassName}>
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 id={titleId || undefined} className="tw-m-0 tw-text-[clamp(1.7rem,3vw,2.4rem)] tw-tracking-[-0.04em]">{title}</h2>
          {caption ? <p>{caption}</p> : null}
        </div>
        <button id={closeButtonId} className="icon-button" type="button" aria-label={closeLabel} onClick={onClose}>
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </header>

      {children ? (
        <div className={resolvedBodyRootClassName}>{children}</div>
      ) : (
        <div id={bodyRootId} className={resolvedBodyRootClassName}></div>
      )}

      <footer className={footerClassName}>
        <div className={footerActionsClassName}>
          <button id={resetButtonId} className="secondary-button" type="button" onClick={onReset} disabled={resetDisabled}>{resetLabel}</button>
          {onDelete ? (
            <button id={deleteButtonId} className="secondary-button tw-border-red-500/70 tw-text-red-500 hover:tw-border-red-500 hover:tw-bg-red-500/15" type="button" onClick={onDelete} disabled={deleteDisabled}>{deleteLabel}</button>
          ) : null}
        </div>
        <div className={footerActionsClassName}>
          <button id={cancelButtonId} className="secondary-button" type="button" onClick={onCancel || onClose}>{cancelLabel}</button>
          <button id={saveButtonId} className="primary-button" type="button" onClick={onSave} disabled={saveDisabled}>{saveLabel}</button>
        </div>
      </footer>
    </div>
  );
}
