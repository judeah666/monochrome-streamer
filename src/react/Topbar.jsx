import React from 'react';

export function Topbar({
  searchValue = '',
  showBackButton = false,
  showClearButton = false,
  mobileSidebarOpen = false,
  focusNonce = 0,
  onSearchChange,
  onClearSearch,
  onBack,
  onOpenSidebar,
}) {
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (!focusNonce) return;
    inputRef.current?.focus();
  }, [focusNonce]);

  return (
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
  );
}
