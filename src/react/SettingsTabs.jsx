import React from 'react';

export function SettingsTabs({ tabs = [], activeTab = 'appearance' }) {
  return (
    <>
      {tabs.map(([id, label]) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            className={[
              'tw-relative tw-min-h-11 tw-border-0 tw-bg-transparent tw-px-0 tw-pb-3 tw-pt-0',
              'tw-font-extrabold tw-tracking-[-0.015em] tw-transition-colors',
              active ? 'tw-text-text' : 'tw-text-muted hover:tw-text-text',
            ].join(' ')}
            type="button"
            role="tab"
            aria-selected={active}
            data-settings-tab={id}
          >
            {label}
            <span
              aria-hidden="true"
              className={[
                'tw-pointer-events-none tw-absolute tw--bottom-px tw-left-0 tw-right-0',
                'tw-h-0.5 tw-rounded-pill tw-transition-colors',
                active ? 'tw-bg-accent' : 'tw-bg-transparent',
              ].join(' ')}
            />
          </button>
        );
      })}
    </>
  );
}
