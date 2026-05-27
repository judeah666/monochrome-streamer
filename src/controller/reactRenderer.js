export function hasReactRenderer(rendererName) {
  return Boolean(rendererName && window.MonochromeReact?.[rendererName]);
}

export function renderReact(rendererName, container, props = {}) {
  const renderer = rendererName ? window.MonochromeReact?.[rendererName] : null;
  if (!renderer) return false;
  renderer(container, props);
  return true;
}

export function unmountReact(container) {
  window.MonochromeReact?.unmount?.(container);
}
