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
    <div className="library-filter-bar">
      <div className="alphabet-index" aria-label="Alphabet filter">
        {alphabetFilters.map((letter) => {
          const active = letter === activeLetter;
          return (
            <button
              key={letter}
              type="button"
              className={active ? 'is-active' : ''}
              aria-pressed={active}
              onClick={() => onLetter?.(letter)}
            >
              {letter === 'all' ? 'All' : letter}
            </button>
          );
        })}
      </div>

      {showMediaType ? (
        <div className="media-type-filter" aria-label="Filter albums by media type">
          {mediaTypes.map((mediaType) => {
            const active = activeMediaSet.has(mediaType.value);
            return (
              <button
                key={mediaType.value}
                type="button"
                className={active ? 'is-active' : ''}
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
  pageSizeOptions = [25, 50, 100],
  onPage,
  onPageSize,
}) {
  const limit = page.limit || pageSizeOptions[1] || 50;
  const offset = page.offset || 0;
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(total, offset + limit);

  return (
    <div className="library-pager">
      <div>
        <strong>{start}-{end}</strong>
        <span>of {total} {itemLabel}{total === 1 ? '' : 's'}</span>
      </div>
      {showPageSize ? (
        <label>
          <span>Per page</span>
          <select value={limit} onChange={(event) => onPageSize?.(Number(event.target.value))}>
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        type="button"
        className="secondary-button"
        disabled={!page.hasPrevious}
        onClick={() => onPage?.('previous')}
      >
        Previous
      </button>
      <button
        type="button"
        className="secondary-button"
        disabled={!page.hasNext}
        onClick={() => onPage?.('next')}
      >
        Next
      </button>
    </div>
  );
}
