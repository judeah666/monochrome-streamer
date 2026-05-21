import React from 'react';

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
      <header className="tag-editor-header">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 id={titleId || undefined}>{title}</h2>
          {caption ? <p>{caption}</p> : null}
        </div>
        <button id={closeButtonId} className="icon-button" type="button" aria-label={closeLabel}>
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </header>

      <div id={bodyRootId} className={bodyRootClassName}></div>

      <footer className="tag-editor-footer">
        <button id={resetButtonId} className="secondary-button" type="button">{resetLabel}</button>
        <div>
          <button id={cancelButtonId} className="secondary-button" type="button">{cancelLabel}</button>
          <button id={saveButtonId} className="primary-button" type="button">{saveLabel}</button>
        </div>
      </footer>
    </>
  );
}
