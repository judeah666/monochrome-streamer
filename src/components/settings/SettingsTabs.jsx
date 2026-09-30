import React from 'react';

const sections = {
  appearance: ['fa-palette', 'Theme, fonts & artwork'],
  interface: ['fa-sliders', 'Navigation & browsing'],
  audio: ['fa-headphones', 'Quality, volume & player'],
  users: ['fa-users', 'Accounts & access'],
  downloads: ['fa-download', 'Quality & file delivery'],
  instances: ['fa-plug', 'Dashboard connections'],
  system: ['fa-server', 'Library & maintenance'],
};

export function SettingsTabs({ tabs = [], activeTab = 'appearance', onSelect, scope = 'options' }) {
  function navigate(event, index) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    onSelect?.(tabs[next][0]);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next]?.focus();
  }
  return <>{tabs.map(([id, label], index) => {
    const active = activeTab === id;
    const [icon, description] = sections[id] || ['fa-gear', 'Preferences'];
    return (
      <button key={id} className={'settings-category' + (active ? ' is-active' : '')}
        id={`${scope}-tab-${id}`} type="button" role="tab" aria-selected={active}
        aria-controls={`${scope}-settings-panel`} tabIndex={active ? 0 : -1}
        data-settings-tab={scope === 'options' ? id : undefined}
        onClick={() => onSelect?.(id)} onKeyDown={event => navigate(event, index)}>
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
        <span><strong>{label}</strong><small>{description}</small></span>
      </button>
    );
  })}</>;
}
