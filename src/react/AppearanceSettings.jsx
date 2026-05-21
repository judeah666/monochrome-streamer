import React from 'react';

export function AppearanceSettings({
  settings,
  title = '',
  themeOptions = [],
  fontOptions = [],
  customThemeBaseOptions = [],
  preview = {},
}) {
  return (
    <>
      <SettingsGroup title="Theme" description="Choose your preferred color scheme.">
        <div className="theme-grid">
          {themeOptions.map((theme) => (
            <button
              key={theme.value}
              type="button"
              className={`theme-swatch${settings.theme === theme.value ? ' is-active' : ''}`}
              data-setting-value="theme"
              data-value={theme.value}
            >
              <span style={{ '--swatch-color': theme.accent }} />
              {theme.label}
            </button>
          ))}
        </div>
        <div className="settings-field theme-custom-field">
          <span>Custom Theme</span>
          <div className="theme-custom-controls">
            <label>
              <span>Accent</span>
              <input type="color" data-setting="customAccent" defaultValue={settings.customAccent} />
            </label>
            <label>
              <span>Base</span>
              <select data-setting="customThemeBase" defaultValue={settings.customThemeBase}>
                {customThemeBaseOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Font" description="Choose from presets. Custom Google Font URLs can still be added in code later if we want full upstream parity.">
        <label className="settings-field">
          <span>Font Preset</span>
          <select data-setting="fontPreset" defaultValue={settings.fontPreset}>
            {fontOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="settings-field">
          <span>
            Font Size <strong>{settings.fontSize}%</strong>
          </span>
          <input type="range" min="75" max="140" step="5" data-setting="fontSize" defaultValue={settings.fontSize} />
        </label>
      </SettingsGroup>

      <SettingsGroup title="Text" description="Rename the app and the home banner without editing config files.">
        <div className="settings-field library-title-field">
          <div className="library-title-label">
            <label className="settings-inline-toggle">
              <input type="checkbox" data-setting="showLibraryTitle" defaultChecked={settings.showLibraryTitle} />
              <span>Show</span>
            </label>
            <span>Library Title</span>
          </div>
          <input type="text" data-setting="libraryTitle" defaultValue={settings.libraryTitle} placeholder={title} />
        </div>
        <label className="settings-field">
          <span>App / Browser Tab Icon URL</span>
          <input type="url" data-setting="appIconUrl" defaultValue={settings.appIconUrl} placeholder="/icon.png or https://example.com/icon.png" />
        </label>
        <div className="settings-field home-banner-field">
          <div className="home-banner-heading">
            <span>Home Banner</span>
            <label className="settings-inline-toggle">
              <span>Show</span>
              <input type="checkbox" data-setting="showHomeBanner" defaultChecked={settings.showHomeBanner} />
            </label>
          </div>
          <div className="home-banner-controls">
            <label>
              <span>Eyebrow</span>
              <input type="text" data-setting="homeBannerEyebrow" defaultValue={settings.homeBannerEyebrow} />
            </label>
            <label>
              <span>Title</span>
              <input type="text" data-setting="homeBannerTitle" defaultValue={settings.homeBannerTitle} />
            </label>
            <label>
              <span>Subtitle</span>
              <input type="text" data-setting="homeBannerSubtitle" defaultValue={settings.homeBannerSubtitle} />
            </label>
          </div>
        </div>
      </SettingsGroup>

      <section className="settings-group visuals-settings-group">
        <div className="settings-group-heading">
          <h4>Visuals</h4>
          <p>Local equivalents of Monochrome appearance toggles.</p>
          <AlbumCardSizePreview preview={preview} />
        </div>
        <div className="settings-group-body">
          <div className="settings-field album-card-size-field">
            <span>
              Album Card Size <strong>{settings.albumCardSize}px</strong>
            </span>
            <div className="album-card-size-controls">
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
    </>
  );
}

function SettingsGroup({ title, description, children }) {
  return (
    <section className="settings-group">
      <div className="settings-group-heading">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className="settings-group-body">{children}</div>
    </section>
  );
}

function SettingToggle({ settingKey, title, description, checked }) {
  return (
    <label className="setting-row">
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
    <div className="album-card-size-preview" aria-label="Album card size preview">
      <article className="album-card compact album-card-sample" aria-hidden="true">
        <div className="album-card-media">
          <span className="album-card-placeholder-host" dangerouslySetInnerHTML={{ __html: preview.coverPlaceholderHtml || '' }} />
          <button
            type="button"
            className="album-card-play"
            tabIndex={-1}
            aria-label="Preview play button"
            dangerouslySetInnerHTML={{ __html: preview.playIconHtml || '' }}
          />
        </div>
        <div className="meta">
          <h4>{preview.title || 'Sampler Album'}</h4>
          <p>{preview.artist || ''}</p>
          <p className="album-card-year">{preview.year || '2026'}</p>
          <div className="album-card-footer">
            <p className="album-card-format" dangerouslySetInnerHTML={{ __html: preview.mediaIconsHtml || '' }} />
          </div>
        </div>
      </article>
      <p className="settings-help">Preview uses the same card style as Home, Library, Favorites, and artist album grids.</p>
    </div>
  );
}
