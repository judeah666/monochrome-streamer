import React from 'react';
import { MobileFilterSheet } from '../common/MobileFilterSheet.jsx';
import { getAlphabetFilterLabel } from '../../utils/mobileFilters.js';

export function LibraryFilterBar({
  alphabetFilters = [],
  activeLetter = 'all',
  mediaTypes = [],
  activeMediaTypes = [],
  showMediaType = true,
  onLetter,
  onMediaType,
}) {
  const [alphabetSheetOpen, setAlphabetSheetOpen] = React.useState(false);
  const activeMediaSet = new Set(activeMediaTypes);
  const alphabetFilterLabel = getAlphabetFilterLabel(activeLetter);
  const closeAlphabetSheet = React.useCallback(() => setAlphabetSheetOpen(false), []);

  const selectLetter = (letter) => {
    onLetter?.(letter);
    setAlphabetSheetOpen(false);
  };

  return (
    <div className="library-filter-bar">
      <div className="alphabet-index alphabet-index-desktop" aria-label="Alphabet filter">
        {alphabetFilters.map((letter) => {
          const active = letter === activeLetter;
          return (
            <button
              key={letter}
              type="button"
              className={`library-filter-button${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => onLetter?.(letter)}
            >
              {letter === 'all' ? 'All' : letter}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={`mobile-filter-sheet-trigger mobile-alphabet-filter-trigger${activeLetter !== 'all' ? ' is-active' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={alphabetSheetOpen}
        onClick={() => setAlphabetSheetOpen(true)}
      >
        <i className="fa-solid fa-arrow-down-a-z" aria-hidden="true" />
        <span>{alphabetFilterLabel}</span>
        <i className="fa-solid fa-chevron-up" aria-hidden="true" />
      </button>

      {showMediaType ? (
        <div className="media-type-filter" aria-label="Filter albums by media type">
          {mediaTypes.map((mediaType) => {
            const active = activeMediaSet.has(mediaType.value);
            return (
              <button
                key={mediaType.value}
                type="button"
                className={`media-type-filter-button${active ? ' is-active' : ''}`}
                aria-label={`${active ? 'Disable' : 'Enable'} ${mediaType.value} filter`}
                aria-pressed={active}
                title={mediaType.value}
                onClick={() => onMediaType?.(mediaType.value)}
              >
                <i
                  className="media-type-symbol tw-h-[1.85rem] tw-w-[1.85rem]"
                  style={{ '--media-type-icon': `url('${mediaType.icon}')` }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      <MobileFilterSheet
        open={alphabetSheetOpen}
        title="Browse by letter"
        description="Choose the first character of the album or artist name."
        onClose={closeAlphabetSheet}
      >
        <div className="mobile-alphabet-filter-grid" aria-label="Alphabet filter">
          {alphabetFilters.map((letter) => {
            const active = letter === activeLetter;
            return (
              <button
                key={letter}
                type="button"
                className={`mobile-alphabet-filter-option${active ? ' is-active' : ''}`}
                aria-pressed={active}
                onClick={() => selectLetter(letter)}
              >
                {letter === 'all' ? 'All' : letter}
              </button>
            );
          })}
        </div>
      </MobileFilterSheet>
    </div>
  );
}

export function LibraryPager({
  page = {},
  total = 0,
  itemLabel = 'item',
  showPageSize = false,
  loading = false,
  pageSizeOptions = [25, 50, 100, 200, 500],
  onPage,
  onPageSize,
}) {
  const limit = page.limit || pageSizeOptions[1] || 50;
  const offset = page.offset || 0;
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(total, offset + limit);
  const handlePageClick = (event, direction) => {
    if (!onPage) return;
    event.stopPropagation();
    onPage(direction);
  };
  const handlePageSizeChange = (event) => {
    if (!onPageSize) return;
    event.stopPropagation();
    onPageSize(Number(event.target.value));
  };

  return (
    <div className="library-pager tw-col-span-full tw-mt-3.5 tw-flex tw-items-center tw-justify-end tw-gap-3.5 tw-rounded-[22px] tw-border tw-border-line tw-bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_88%,transparent),color-mix(in_srgb,var(--glass)_70%,transparent)),var(--glass)] tw-px-4 tw-py-3.5 tw-backdrop-blur-lg">
      <div className="tw-mr-auto tw-text-muted">
        <strong className="tw-mr-1 tw-font-display tw-text-text">{start}-{end}</strong>
        <span>of {total} {itemLabel}{total === 1 ? '' : 's'}</span>
        {loading ? (
          <span className="tw-ml-3 tw-font-extrabold tw-text-accent">Loading...</span>
        ) : null}
      </div>
      {showPageSize ? (
        <label className="tw-inline-flex tw-items-center tw-gap-2.5 tw-text-[0.86rem] tw-font-extrabold tw-text-muted">
          <span>Per page</span>
          <select
            className="tw-min-w-[82px] tw-rounded-pill tw-border tw-border-line tw-bg-[var(--input-surface)] tw-px-3.5 tw-py-2 tw-font-extrabold tw-text-text"
            data-library-page-size
            value={limit}
            disabled={loading}
            onChange={handlePageSizeChange}
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
        disabled={loading || !page.hasPrevious}
        aria-label="Previous page"
        title="Previous page"
        data-library-page-action="previous"
        onClick={(event) => handlePageClick(event, 'previous')}
      >
        <i className="pager-symbol pager-symbol-left" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        className="tw-inline-grid tw-h-[38px] tw-min-h-[38px] tw-w-[38px] tw-min-w-[38px] tw-place-items-center tw-border-0 tw-bg-transparent tw-p-0 tw-text-text tw-shadow-none tw-transition tw-duration-150 hover:-tw-translate-y-px hover:tw-text-accent disabled:tw-opacity-40 disabled:tw-grayscale"
        disabled={loading || !page.hasNext}
        aria-label="Next page"
        title="Next page"
        data-library-page-action="next"
        onClick={(event) => handlePageClick(event, 'next')}
      >
        <i className="pager-symbol pager-symbol-right" aria-hidden="true"></i>
      </button>
    </div>
  );
}
