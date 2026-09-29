import React, { useState } from 'react';
import { FONT_OPTIONS } from '../../controller/constants.js';
import { BACKGROUND_PATTERNS, DEFAULT_BACKGROUND_PATTERN } from '../../controller/backgroundPatterns.js';
import { CoverPlaceholder, MediaTypeIcons } from '../common/VisualBits.jsx';

const settingsGroupClassName = [
  'settings-group tw-grid tw-grid-cols-[minmax(180px,0.35fr)_minmax(0,1fr)] tw-gap-[22px]',
  'tw-rounded-[22px] tw-border tw-border-line tw-bg-[linear-gradient(135deg,var(--glass),transparent_58%),var(--surface)]',
  'tw-p-5 tw-backdrop-blur-lg max-[1200px]:tw-grid-cols-1',
].join(' ');

const settingsGroupBodyClassName = 'settings-group-body tw-grid tw-min-w-0 tw-gap-3';

const settingRowClassName = [
  'setting-row tw-grid tw-grid-cols-[minmax(0,1fr)_auto] tw-items-center tw-gap-4',
  'tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--glass)] tw-p-3.5 tw-backdrop-blur-md',
  'max-[720px]:tw-grid-cols-1 max-[720px]:tw-items-start',
].join(' ');

const settingsFieldClassName = [
  'settings-field tw-grid tw-grid-cols-[180px_minmax(0,1fr)] tw-items-center tw-gap-4',
  'tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--glass)] tw-p-3.5 tw-backdrop-blur-md',
  'max-[720px]:tw-grid-cols-1 max-[720px]:tw-items-start',
].join(' ');

const settingsHelpClassName = 'settings-help tw-mt-2 tw-text-muted tw-leading-relaxed';

export function AppearanceSettings({
  settings,
  title = '',
  themeOptions = [],
  themeBaseOptions = [],
  customThemeBaseOptions = [],
  preview = {},
}) {
  const [section, setSection] = useState('style');
  return (
    <div className="appearance-settings">
      <header className="appearance-settings-header">
        <h3>Appearance</h3>
        <p>Make this space yours. Changes are saved automatically in this browser.</p>
      </header>
      <nav className="appearance-section-nav" aria-label="Appearance sections">
        {[
          ['style', 'Theme & background', 'fa-palette'],
          ['type', 'Typography', 'fa-font'],
          ['cards', 'Cards & artwork', 'fa-images'],
          ['identity', 'App identity', 'fa-pen'],
        ].map(([id, label, icon]) => (
          <button key={id} type="button" aria-pressed={section === id} aria-controls={`appearance-section-${id}`} onClick={() => setSection(id)}>
            <i className={`fa-solid ${icon}`} aria-hidden="true" />{label}
          </button>
        ))}
      </nav>
      <div id="appearance-section-style" className="appearance-section-content" hidden={section !== 'style'}>
      <SettingsGroup title="Theme" description="Choose your preferred color scheme.">
        <div className="theme-grid" role="group" aria-label="Color theme">
          {themeOptions.map((theme) => (
            <button
              key={theme.value}
              type="button"
              className={`theme-swatch${settings.theme === theme.value ? ' is-active' : ''}`}
              aria-pressed={settings.theme === theme.value}
              data-setting-value="theme"
              data-value={theme.value}
              style={{
                '--theme-preview-accent': theme.accent,
                '--theme-preview-background': theme.background,
                '--theme-preview-surface': theme.surface,
                '--theme-preview-surface-2': theme.surface2,
                '--theme-preview-text': theme.text,
                '--theme-preview-muted': theme.muted,
                '--theme-preview-body-top': theme.bodyTop,
                '--theme-preview-body-mid': theme.bodyMid,
                '--theme-preview-body-bottom': theme.bodyBottom,
              }}
            >
              <span className="theme-palette-preview" aria-hidden="true">
                <span /><span /><span /><span />
              </span>
              <span className="appearance-option-caption">
                <span className="theme-swatch-label">{theme.label}</span>
                <span className="appearance-option-check" aria-hidden="true"><i className="fa-solid fa-check" /></span>
              </span>
            </button>
          ))}
        </div>
        <div className={`${settingsFieldClassName} theme-custom-field tw-items-start`}>
          <span>Mode &amp; accent</span>
          <div className="theme-custom-controls tw-grid tw-grid-cols-[minmax(120px,auto)_minmax(180px,1fr)] tw-items-end tw-gap-3 max-[720px]:tw-grid-cols-1">
            <label className="tw-grid tw-gap-1.5">
              <span className="tw-m-0 tw-text-[0.78rem] tw-font-extrabold tw-uppercase tw-tracking-[0.08em] tw-text-muted">Color mode</span>
              <select data-setting="themeBase" defaultValue={settings.themeBase || settings.customThemeBase}>
                {(themeBaseOptions.length ? themeBaseOptions : customThemeBaseOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="tw-grid tw-gap-1.5">
              <span className="tw-m-0 tw-text-[0.78rem] tw-font-extrabold tw-uppercase tw-tracking-[0.08em] tw-text-muted">Custom accent</span>
              <input type="color" data-setting="customAccent" defaultValue={settings.customAccent} />
            </label>
          </div>
        </div>
      </SettingsGroup>
      <SettingsGroup title="Background Pattern" description="Choose a repeating music pattern. Select None to restore the theme background.">
        <div className="background-pattern-grid" role="group" aria-label="Background pattern">
          {BACKGROUND_PATTERNS.map((pattern) => (
            <button
              key={pattern.value}
              type="button"
              className="background-pattern-option"
              data-setting-value="backgroundPattern"
              data-value={pattern.value}
              aria-pressed={(settings.backgroundPattern || DEFAULT_BACKGROUND_PATTERN) === pattern.value}
            >
              <span className="background-pattern-preview" aria-hidden="true" style={{ backgroundImage: pattern.image ? 'url("' + pattern.image + '")' : 'none' }} />
              <span className="appearance-option-caption">
                <span>{pattern.label}</span>
                <span className="appearance-option-check" aria-hidden="true"><i className="fa-solid fa-check" /></span>
              </span>
            </button>
          ))}
        </div>
        <p className={settingsHelpClassName}>Backgrounds are softly muted to keep your music in focus.</p>
      </SettingsGroup>
      </div>
      <div id="appearance-section-type" className="appearance-section-content" hidden={section !== 'type'}>
      <SettingsGroup title="App Font" description="Choose the font and text size used by this browser.">
        <label className={settingsFieldClassName}>
          <span>Font Preset</span>
          <select data-setting="fontPreset" defaultValue={settings.fontPreset}>
            {FONT_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className={settingsFieldClassName}>
          <span>Font Size <strong>{settings.fontSize}%</strong></span>
          <input type="range" min="75" max="140" step="5" data-setting="fontSize" defaultValue={settings.fontSize} />
        </label>
        <div className="typography-preview" aria-label="Font preview">
          <span className="appearance-preview-label">Preview</span>
          <strong>Your music, your way.</strong>
          <p>The sound of a familiar song. A new album waiting to be discovered.</p>
          <span className="typography-preview-numbers">Aa Bb Cc · 0123456789</span>
        </div>
      </SettingsGroup>
      </div>
      <div id="appearance-section-cards" className="appearance-section-content" hidden={section !== 'cards'}>
      <section className={`${settingsGroupClassName} visuals-settings-group`}>
        <div className="settings-group-heading">
          <h4>Visuals</h4>
          <p>Adjust card size and artwork preferences.</p>
          <AlbumCardSizePreview preview={preview} />
        </div>
        <div className={settingsGroupBodyClassName}>
          <div className={`${settingsFieldClassName} album-card-size-field`}>
            <span>
              Album Card Size <strong>{settings.albumCardSize}px</strong>
            </span>
            <div className="album-card-size-controls tw-grid tw-min-w-0">
              <input type="range" min="145" max="230" step="5" data-setting="albumCardSize" defaultValue={settings.albumCardSize} />
            </div>
          </div>
          <SettingToggle
            settingKey="albumCoverBackground"
            title="Album Cover Background"
            description="Use cover art as the blurred album-page backdrop."
            checked={settings.albumCoverBackground}
          />
          <SettingToggle
            settingKey="dynamicColors"
            title="Dynamic Colors"
            description="Reserved for future cover-palette accents. Your custom accent is used today."
            checked={settings.dynamicColors}
          />
          <SettingToggle
            settingKey="compactArtists"
            title="Compact Artists"
            description="Use smaller artist cards in the artist browser."
            checked={settings.compactArtists}
          />
        </div>
      </section>
      </div>
      <div id="appearance-section-identity" className="appearance-section-content" hidden={section !== 'identity'}>
      <SettingsGroup title="App identity" description="Personalize the library name, browser icon, and home banner.">
        <div className={`${settingsFieldClassName} library-title-field`}>
          <div className="library-title-label tw-flex tw-min-w-0 tw-items-center tw-gap-3">
            <span>Library Title</span>
            <label className="settings-inline-toggle tw-inline-flex tw-items-center tw-gap-2.5 tw-text-[0.82rem] tw-font-extrabold tw-text-muted" aria-label="Show library title">
              <input type="checkbox" data-setting="showLibraryTitle" defaultChecked={settings.showLibraryTitle} />
            </label>
          </div>
          <input type="text" data-setting="libraryTitle" defaultValue={settings.libraryTitle} placeholder={title} />
        </div>
        <label className={settingsFieldClassName}>
          <span>App / Browser Tab Icon URL</span>
          <input type="url" data-setting="appIconUrl" defaultValue={settings.appIconUrl} placeholder="/icon.png or https://example.com/icon.png" />
        </label>
        <SettingToggle settingKey="showHomeBanner" title="Recently added banner"
          description="Show the recently added album carousel at the top of Home."
          checked={settings.showHomeBanner} />
      </SettingsGroup>
      </div>
    </div>
  );
}

function SettingsGroup({ title, description, children }) {
  return (
    <section className={settingsGroupClassName}>
      <div className="settings-group-heading">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className={settingsGroupBodyClassName}>{children}</div>
    </section>
  );
}

function SettingToggle({ settingKey, title, description, checked }) {
  return (
    <label className={settingRowClassName}>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <input type="checkbox" data-setting={settingKey} defaultChecked={checked} />
    </label>
  );
}

function AlbumCardSizePreview({ preview }) {
  return (
    <div className="album-card-size-preview tw-mt-[18px] tw-grid tw-justify-items-center tw-gap-2.5 tw-rounded-[22px] tw-border tw-border-line tw-bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_42%),var(--glass)] tw-p-4 tw-backdrop-blur-md" aria-label="Album card size preview">
      <article className="album-card album-card-shell compact album-card-sample" aria-hidden="true">
        <div className="album-card-media">
          <span className="album-card-placeholder-host">
            <CoverPlaceholder className="album-art-placeholder album-card-cover-placeholder" />
          </span>
        </div>
        <div className="meta album-card-meta">
          <h4 className="album-card-title">{preview.title || 'Sampler Album'}</h4>
          <p className="album-card-text">{preview.artist || ''}</p>
          <p className="album-card-year album-card-year-text">{preview.year || '2026'}</p>
          <div className="album-card-footer album-card-footer-row">
            <p className="album-card-format album-card-format-row">
              <MediaTypeIcons mediaTypes={preview.mediaTypes} />
            </p>
          </div>
        </div>
      </article>
      <p className={settingsHelpClassName}>Preview shows the selected card width. Album grids use this width without stretching cards to fill the row.</p>
    </div>
  );
}
