import {
  DEFAULT_SETTINGS,
  PALETTE_THEMES,
  THEME_PRESETS,
} from './constants.js';

export function getThemeBase(settings = DEFAULT_SETTINGS) {
  if (settings.themeBase === 'light' || settings.themeBase === 'dark') {
    return settings.themeBase;
  }
  if (settings.customThemeBase === 'light' || settings.customThemeBase === 'dark') {
    return settings.customThemeBase;
  }
  return settings.theme === 'white' || settings.theme === 'latte' ? 'light' : 'dark';
}

export function isLightTheme(settings = DEFAULT_SETTINGS) {
  return getThemeBase(settings) === 'light';
}

export function resolveThemePreset(themeName = DEFAULT_SETTINGS.theme, settings = DEFAULT_SETTINGS) {
  const base = getThemeBase(settings);
  const palette = PALETTE_THEMES[themeName];
  if (palette) {
    return createPairedTheme(palette, base);
  }

  const fallbackThemeName = themeName === 'custom'
    ? (base === 'light' ? 'latte' : 'black')
    : themeName;
  const preset = THEME_PRESETS[fallbackThemeName] || THEME_PRESETS.black;
  const accent = themeName === 'custom' ? settings.customAccent || DEFAULT_SETTINGS.customAccent : preset.accent;
  return base === 'light'
    ? createLightTheme(accent, preset.text, preset.background)
    : createDarkTheme(accent, preset.text, preset.background);
}

export function getThemePreview(themeName = DEFAULT_SETTINGS.theme, settings = DEFAULT_SETTINGS) {
  const theme = resolveThemePreset(themeName, settings);
  return {
    accent: theme.accent,
    background: theme.background,
    surface: theme.surface,
    surface2: theme.surface2,
    text: theme.text,
    muted: theme.muted,
    bodyTop: theme.bodyTop,
    bodyMid: theme.bodyMid,
    bodyBottom: theme.bodyBottom,
  };
}

export function getHueRotationDegrees(targetColor, sourceColor = '#e44b4d') {
  const targetHue = getHue(parseHex(targetColor));
  const sourceHue = getHue(parseHex(sourceColor));
  return Math.round((targetHue - sourceHue + 360) % 360);
}

function createPairedTheme(palette, base) {
  const light = palette.light;
  const dark = palette.dark;
  if (base === 'light') {
    return {
      background: light,
      surface: rgba(mix(light, '#ffffff', 0.42), 0.82),
      surface2: rgba(mix(light, '#ffffff', 0.22), 0.96),
      text: dark,
      muted: rgba(dark, 0.68),
      accent: dark,
      bodyTop: mix(light, '#ffffff', 0.22),
      bodyMid: light,
      bodyBottom: mix(light, dark, 0.14),
    };
  }

  return {
    background: dark,
    surface: rgba(mix(dark, '#ffffff', 0.07), 0.84),
    surface2: rgba(mix(dark, '#ffffff', 0.11), 0.96),
    text: light,
    muted: rgba(light, 0.68),
    accent: light,
    bodyTop: mix(dark, light, 0.14),
    bodyMid: dark,
    bodyBottom: mix(dark, '#000000', 0.45),
  };
}

function createLightTheme(accent, preferredText, seedBackground) {
  const background = mix(seedBackground || '#f8f2e7', '#ffffff', 0.7);
  const surfaceBase = mix(background, '#ffffff', 0.62);
  const surface2Base = mix(background, '#ffffff', 0.34);
  const text = getReadableTextColor(background) === '#111111'
    ? '#17130f'
    : mix(preferredText || '#17130f', '#111111', 0.82);
  return {
    background,
    surface: rgba(surfaceBase, 0.82),
    surface2: rgba(surface2Base, 0.96),
    text,
    muted: rgba(text, 0.64),
    accent,
    bodyTop: mix(background, '#ffffff', 0.3),
    bodyMid: background,
    bodyBottom: mix(background, accent, 0.12),
  };
}

function createDarkTheme(accent, preferredText, seedBackground) {
  const background = mix(seedBackground || '#090909', '#000000', 0.5);
  const surfaceBase = mix(background, '#ffffff', 0.06);
  const surface2Base = mix(background, '#ffffff', 0.1);
  const text = getReadableTextColor(background) === '#ffffff'
    ? mix(preferredText || '#f7f7f2', '#ffffff', 0.7)
    : '#f7f7f2';
  return {
    background,
    surface: rgba(surfaceBase, 0.84),
    surface2: rgba(surface2Base, 0.96),
    text,
    muted: rgba(text, 0.66),
    accent,
    bodyTop: mix(background, accent, 0.16),
    bodyMid: background,
    bodyBottom: mix(background, '#000000', 0.6),
  };
}

function getReadableTextColor(hexColor) {
  const { red, green, blue } = parseHex(hexColor);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.58 ? '#111111' : '#ffffff';
}

function rgba(hexColor, alpha) {
  const { red, green, blue } = parseHex(hexColor);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function mix(baseColor, overlayColor, amount) {
  const base = parseHex(baseColor);
  const overlay = parseHex(overlayColor);
  const clamped = Math.max(0, Math.min(1, amount));
  return toHex({
    red: Math.round(base.red * (1 - clamped) + overlay.red * clamped),
    green: Math.round(base.green * (1 - clamped) + overlay.green * clamped),
    blue: Math.round(base.blue * (1 - clamped) + overlay.blue * clamped),
  });
}

function parseHex(hexColor) {
  const normalized = String(hexColor || '').trim().replace('#', '');
  const expanded = /^[0-9a-f]{3}$/iu.test(normalized)
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;
  if (!/^[0-9a-f]{6}$/iu.test(expanded)) {
    return { red: 17, green: 17, blue: 17 };
  }
  return {
    red: Number.parseInt(expanded.slice(0, 2), 16),
    green: Number.parseInt(expanded.slice(2, 4), 16),
    blue: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

function getHue({ red, green, blue }) {
  const normalized = [red, green, blue].map((value) => value / 255);
  const maximum = Math.max(...normalized);
  const minimum = Math.min(...normalized);
  const difference = maximum - minimum;
  if (difference === 0) return 0;

  let hue;
  if (maximum === normalized[0]) {
    hue = ((normalized[1] - normalized[2]) / difference) % 6;
  } else if (maximum === normalized[1]) {
    hue = (normalized[2] - normalized[0]) / difference + 2;
  } else {
    hue = (normalized[0] - normalized[1]) / difference + 4;
  }
  return (hue * 60 + 360) % 360;
}

function toHex({ red, green, blue }) {
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}
