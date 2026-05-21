import React from 'react';

export function SettingsTabs({ tabs = [], activeTab = 'appearance' }) {
  return (
    <>
      {tabs.map(([id, label]) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            className={`settings-tab${active ? ' is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={active}
            data-settings-tab={id}
          >
            {label}
          </button>
        );
      })}
    </>
  );
}
