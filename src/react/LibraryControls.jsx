import React from 'react';

export function LibraryFilterBar({
  alphabetFilters = [],
  activeLetter = 'all',
  mediaTypes = [],
  activeMediaTypes = [],
  showMediaType = true,
  onLetter,
  onMediaType,
}) {
  const activeMediaSet = new Set(activeMediaTypes);

  return (
    <div className="library-filter-bar tw-col-span-full tw-mb-3.5 tw-flex tw-items-center tw-gap-2.5 tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--glass)] tw-p-2.5 tw-backdrop-blur-md">
      <div className="alphabet-index tw-flex tw-min-w-0 tw-flex-wrap tw-gap-1.5" aria-label="Alphabet filter">
        {alphabetFilters.map((letter) => {
          const active = letter === activeLetter;
          return (
            <button
              key={letter}
              type="button"
              className={[
                'tw-min-h-[34px] tw-min-w-[34px] tw-rounded-pill tw-border tw-border-transparent tw-bg-transparent',
                'tw-px-2 tw-font-extrabold tw-transition tw-duration-150',
                active
                  ? 'is-active tw-bg-accent tw-text-[var(--accent-contrast)] tw-shadow-[0_10px_24px_color-mix(in_srgb,var(--accent)_22%,transparent)]'
                  : 'tw-text-muted hover:tw-bg-[var(--hover-surface)] hover:tw-text-text',
              ].join(' ')}
              aria-pressed={active}
              onClick={() => onLetter?.(letter)}
            >
              {letter === 'all' ? 'All' : letter}
            </button>
          );
        })}
      </div>

      {showMediaType ? (
        <div className="media-type-filter tw-ml-auto tw-inline-flex tw-min-h-[34px] tw-items-center tw-gap-2.5 tw-text-muted" aria-label="Filter albums by media type">
          {mediaTypes.map((mediaType) => {
            const active = activeMediaSet.has(mediaType.value);
            return (
              <button
                key={mediaType.value}
                type="button"
                className={[
                  'tw-inline-flex tw-h-[34px] tw-w-[34px] tw-items-center tw-justify-center',
                  'tw-border-0 tw-bg-transparent tw-p-0 tw-text-muted tw-shadow-none tw-transition tw-duration-150',
                  active
                    ? 'is-active tw-text-accent tw-drop-shadow-[0_8px_14px_color-mix(in_srgb,var(--accent)_28%,transparent)]'
                    : 'hover:-tw-translate-y-px hover:tw-text-accent',
                ].join(' ')}
                aria-label={`${active ? 'Disable' : 'Enable'} ${mediaType.value} filter`}
                aria-pressed={active}
                title={mediaType.value}
                onClick={() => onMediaType?.(mediaType.value)}
              >
                <i
                  className="media-type-symbol"
                  style={{ '--media-type-icon': `url('${mediaType.icon}')` }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function LibraryPager({
  page = {},
  total = 0,
  itemLabel = 'item',
  showPageSize = false,
  pageSizeOptions = [25, 50, 100, 200, 500],
  onPage,
  onPageSize,
}) {
  const limit = page.limit || pageSizeOptions[1] || 50;
  const offset = page.offset || 0;
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(total, offset + limit);

  return (
    <div className="library-pager tw-col-span-full tw-mt-3.5 tw-flex tw-items-center tw-justify-end tw-gap-3.5 tw-rounded-[22px] tw-border tw-border-line tw-bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_88%,transparent),color-mix(in_srgb,var(--glass)_70%,transparent)),var(--glass)] tw-px-4 tw-py-3.5 tw-backdrop-blur-lg">
      <div className="tw-mr-auto tw-text-muted">
        <strong className="tw-mr-1 tw-font-display tw-text-text">{start}-{end}</strong>
        <span>of {total} {itemLabel}{total === 1 ? '' : 's'}</span>
      </div>
      {showPageSize ? (
        <label className="tw-inline-flex tw-items-center tw-gap-2.5 tw-text-[0.86rem] tw-font-extrabold tw-text-muted">
          <span>Per page</span>
          <select
            className="tw-min-w-[82px] tw-rounded-pill tw-border tw-border-line tw-bg-[var(--input-surface)] tw-px-3.5 tw-py-2 tw-font-extrabold tw-text-text"
            value={limit}
            onChange={(event) => onPageSize?.(Number(event.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        type="button"
        className="tw-inline-grid tw-h-[38px] tw-min-h-[38px] tw-w-[38px] tw-min-w-[38px] tw-place-items-center tw-border-0 tw-bg-transparent tw-p-0 tw-text-text tw-shadow-none tw-transition tw-duration-150 hover:-tw-translate-y-px hover:tw-text-accent disabled:tw-opacity-40 disabled:tw-grayscale"
        disabled={!page.hasPrevious}
        aria-label="Previous page"
        title="Previous page"
        onClick={() => onPage?.('previous')}
      >
        <i className="pager-symbol pager-symbol-left" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        className="tw-inline-grid tw-h-[38px] tw-min-h-[38px] tw-w-[38px] tw-min-w-[38px] tw-place-items-center tw-border-0 tw-bg-transparent tw-p-0 tw-text-text tw-shadow-none tw-transition tw-duration-150 hover:-tw-translate-y-px hover:tw-text-accent disabled:tw-opacity-40 disabled:tw-grayscale"
        disabled={!page.hasNext}
        aria-label="Next page"
        title="Next page"
        onClick={() => onPage?.('next')}
      >
        <i className="pager-symbol pager-symbol-right" aria-hidden="true"></i>
      </button>
    </div>
  );
}
