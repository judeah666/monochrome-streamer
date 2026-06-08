import React from 'react';

export function LibraryTabs({
  tabs = [],
  activeTab = 'albums',
  onSelect,
}) {
  return (
    <div className="library-browser-tabs" role="tablist" aria-label="Library browser">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`library-tab${activeTab === tab.id ? ' is-active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id ? 'true' : 'false'}
          hidden={tab.hidden}
          onClick={() => onSelect?.(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
