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
  cancelButtonId = '',
  cancelLabel = 'Cancel',
  saveButtonId = '',
  saveLabel = 'Save',
}) {
  return (
    <>
      <header className={headerClassName}>
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 id={titleId || undefined} className="tw-m-0 tw-text-[clamp(1.7rem,3vw,2.4rem)] tw-tracking-[-0.04em]">{title}</h2>
          {caption ? <p>{caption}</p> : null}
        </div>
        <button id={closeButtonId} className="icon-button" type="button" aria-label={closeLabel}>
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </header>

      <div id={bodyRootId} className={bodyRootClassName}></div>

      <footer className={footerClassName}>
        <button id={resetButtonId} className="secondary-button" type="button">{resetLabel}</button>
        <div className={footerActionsClassName}>
          <button id={cancelButtonId} className="secondary-button" type="button">{cancelLabel}</button>
          <button id={saveButtonId} className="primary-button" type="button">{saveLabel}</button>
        </div>
      </footer>
    </>
  );
}
