export const DEFAULT_BACKGROUND_PATTERN = 'audio-doodles';

export const BACKGROUND_PATTERNS = [
  {
    "value": "none",
    "label": "None",
    "image": null
  },
  {
    "value": "audio-doodles",
    "label": "Blue Audio Doodles",
    "image": "/assets/backgrounds/audio-doodles.webp"
  },
  {
    "value": "colorful-notes",
    "label": "Colorful Notes",
    "image": "/assets/backgrounds/colorful-notes.webp"
  },
  {
    "value": "night-notes",
    "label": "Night Notes",
    "image": "/assets/backgrounds/night-notes.webp"
  },
  {
    "value": "retro-instruments",
    "label": "Retro Instruments",
    "image": "/assets/backgrounds/retro-instruments.webp"
  },
  {
    "value": "sketch-instruments",
    "label": "Instrument Sketches",
    "image": "/assets/backgrounds/sketch-instruments.webp"
  },
  {
    "value": "music-grid",
    "label": "Music Grid",
    "image": "/assets/backgrounds/music-grid.webp"
  }
];

export function normalizeBackgroundPattern(value) {
  return BACKGROUND_PATTERNS.some((pattern) => pattern.value === value) ? value : DEFAULT_BACKGROUND_PATTERN;
}

export function applyBackgroundPattern(body, value) {
  const pattern = BACKGROUND_PATTERNS.find((item) => item.value === normalizeBackgroundPattern(value));
  // Avoid repainting the background when unrelated settings are reapplied.
  if (body.dataset.backgroundPattern === pattern.value) return;
  body.dataset.backgroundPattern = pattern.value;
  body.classList.toggle('has-background-pattern', Boolean(pattern.image));
  if (pattern.image) body.style.setProperty('--background-pattern', 'url("' + pattern.image + '")');
  else body.style.removeProperty('--background-pattern');
}
