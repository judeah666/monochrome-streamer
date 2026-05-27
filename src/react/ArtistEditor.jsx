import React from 'react';

const editorBodyClassName = [
  'tag-editor-body tw-grid tw-min-h-0 tw-flex-1 tw-content-start tw-gap-[22px]',
  'tw-overflow-y-auto tw-overflow-x-hidden tw-p-6 max-[720px]:tw-p-4',
].join(' ');

const formClassName = 'artist-editor-form tw-grid tw-gap-4';
const fieldClassName = 'tw-grid tw-gap-2 tw-text-[0.76rem] tw-uppercase tw-tracking-[0.14em] tw-text-muted';
const inputClassName = [
  'tw-min-h-[42px] tw-w-full tw-rounded-[14px] tw-border tw-border-line',
  'tw-bg-[var(--input-surface)] tw-px-3 tw-py-2.5 tw-text-text tw-normal-case tw-tracking-normal',
].join(' ');
const textareaClassName = `${inputClassName} tw-min-h-[150px] tw-resize-y tw-leading-normal`;

export function ArtistEditorBody({
  imageUrl = '',
  bio = '',
  sourceUrl = '',
}) {
  return (
    <div className={editorBodyClassName}>
      <form className={formClassName}>
        <label className={fieldClassName}>
          <span>Artist image URL</span>
          <input className={inputClassName} id="artist-image-url" type="url" placeholder="https://..." autoComplete="off" defaultValue={imageUrl} />
        </label>
        <label className={fieldClassName}>
          <span>Artist bio / info</span>
          <textarea className={textareaClassName} id="artist-bio" rows="6" placeholder="Write or paste artist info..." defaultValue={bio}></textarea>
        </label>
        <label className={fieldClassName}>
          <span>Source URL</span>
          <input className={inputClassName} id="artist-source-url" type="url" placeholder="https://..." autoComplete="off" defaultValue={sourceUrl} />
        </label>
      </form>
    </div>
  );
}
