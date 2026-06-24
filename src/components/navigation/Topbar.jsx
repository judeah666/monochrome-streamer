import React from 'react';
import { MobileFilterSheet } from '../common/MobileFilterSheet.jsx';
import { getFolderFilterLabel } from '../../utils/mobileFilters.js';

export function Topbar({
  searchValue = '',
  showBackButton = false,
  showClearButton = false,
  mobileSidebarOpen = false,
  focusNonce = 0,
  folderOptions = [],
  activeFolders = [],
  showFolderFilter = false,
  onSearchChange,
  onClearSearch,
  onBack,
  onOpenSidebar,
  onFolderFilter,
}) {
  const inputRef = React.useRef(null);
  const [folderSheetOpen, setFolderSheetOpen] = React.useState(false);
  const activeFolderSet = React.useMemo(() => new Set(activeFolders), [activeFolders]);
  const folderFilterLabel = getFolderFilterLabel(activeFolders);
  const closeFolderSheet = React.useCallback(() => setFolderSheetOpen(false), []);

  React.useEffect(() => {
    if (!focusNonce) return;
    inputRef.current?.focus();
  }, [focusNonce]);

  React.useEffect(() => {
    if (!showFolderFilter || folderOptions.length === 0) closeFolderSheet();
  }, [closeFolderSheet, folderOptions.length, showFolderFilter]);

  return (
    <div className="topbar-shell">
      <header className="topbar">
        <button
          id="mobile-sidebar-button"
          className="icon-button mobile-sidebar-button"
          type="button"
          aria-label="Open sidebar"
          aria-expanded={mobileSidebarOpen}
          aria-controls="app-sidebar"
          onClick={() => onOpenSidebar?.()}
        >
          <i className="fa-solid fa-bars" aria-hidden="true" />
        </button>

        <button
          id="back-button"
          className="icon-button"
          type="button"
          hidden={!showBackButton}
          aria-label="Back to library"
          onClick={() => onBack?.()}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        </button>

        <label className="search-bar">
          <i className="fa-solid fa-magnifying-glass search-icon" aria-hidden="true" />
          <input
            id="search-input"
            ref={inputRef}
            type="search"
            placeholder="Search for tracks, artists, albums..."
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </label>

        <button
          id="clear-search-button"
          className="icon-button"
          type="button"
          hidden={!showClearButton}
          aria-label="Clear search"
          onClick={() => onClearSearch?.()}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </header>

      {showFolderFilter && folderOptions.length > 0 ? (
        <>
          <div className="mobile-folder-filter-bar">
            <button
              type="button"
              className={`mobile-filter-sheet-trigger${activeFolders.length > 0 ? ' is-active' : ''}`}
              aria-haspopup="dialog"
              aria-expanded={folderSheetOpen}
              onClick={() => setFolderSheetOpen(true)}
            >
              <i className="fa-solid fa-folder-tree" aria-hidden="true" />
              <span>{folderFilterLabel}</span>
              <i className="fa-solid fa-chevron-up" aria-hidden="true" />
            </button>
          </div>

          <div className="folder-filter-row folder-filter-row-desktop" aria-label="Filter by library folder">
            {folderOptions.map((folder) => {
              const active = activeFolderSet.has(folder.value);
              return (
                <button
                  key={folder.value}
                  type="button"
                  className={`folder-filter-chip${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  title={folder.label}
                  onClick={() => onFolderFilter?.(folder.value)}
                >
                  <i className="fa-solid fa-folder" aria-hidden="true" />
                  <span>{folder.label}</span>
                </button>
              );
            })}
          </div>

          <MobileFilterSheet
            open={folderSheetOpen}
            title="Library folders"
            description="Choose one or more folders to include. No selection shows the full library."
            onClose={closeFolderSheet}
            footer={(
              <>
                <button
                  type="button"
                  className="mobile-filter-sheet-action"
                  disabled={activeFolders.length === 0}
                  onClick={() => activeFolders.forEach((folder) => onFolderFilter?.(folder))}
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  className="mobile-filter-sheet-action is-primary"
                  onClick={closeFolderSheet}
                >
                  Done
                </button>
              </>
            )}
          >
            <div className="mobile-folder-filter-options">
              {folderOptions.map((folder) => {
                const active = activeFolderSet.has(folder.value);
                return (
                  <button
                    key={folder.value}
                    type="button"
                    className={`mobile-folder-filter-option${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => onFolderFilter?.(folder.value)}
                  >
                    <i className="fa-solid fa-folder" aria-hidden="true" />
                    <span>{folder.label}</span>
                    <i className={`fa-solid ${active ? 'fa-circle-check' : 'fa-circle'}`} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </MobileFilterSheet>
        </>
      ) : null}
    </div>
  );
}
