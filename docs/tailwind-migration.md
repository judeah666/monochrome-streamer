# Tailwind Migration Notes

This project can now use Tailwind alongside the existing CSS and React bridge.

## Rules

- Use Tailwind only with the `tw-` prefix, for example `tw-flex`, `tw-gap-3`, `tw-bg-surface`.
- Tailwind Preflight is disabled, so it will not reset the current app typography, buttons, inputs, or layout.
- Prefer Tailwind in React components first. Keep existing `public/app.js` and legacy CSS stable until each area is migrated.
- Keep shared app tokens from CSS variables: `tw-bg-surface`, `tw-text-text`, `tw-text-muted`, `tw-border-line`, and `tw-bg-accent`.
- Use the helper component classes from `src/styles/tailwind.css` when useful:
  - `tw-ms-panel`
  - `tw-ms-control`
  - `tw-ms-control-primary`

## Build

`npm run build` now builds Tailwind first and then Vite:

```bash
npm run build
```

For frontend development, run the Tailwind watcher in another terminal if you are actively adding new `tw-` classes:

```bash
npm run dev:tailwind
```
