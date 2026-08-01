export function markAppReady(documentRef = document) {
  documentRef.body.dataset.appReady = 'true';
  const screen = documentRef.querySelector('#app-boot-screen');
  if (!screen) return;
  screen.dataset.state = 'ready';
  screen.setAttribute('aria-hidden', 'true');
}

export function markAppBootFailed(error, documentRef = document) {
  delete documentRef.body.dataset.appReady;
  const screen = documentRef.querySelector('#app-boot-screen');
  if (!screen) return;

  screen.dataset.state = 'error';
  screen.removeAttribute('aria-hidden');
  const message = screen.querySelector('[data-app-boot-message]');
  const detail = screen.querySelector('[data-app-boot-detail]');
  if (message) message.textContent = 'Unable to start the app';
  if (detail) {
    const reason = String(error?.message || '').trim();
    detail.textContent = reason
      ? `${reason} Refresh the page to try again.`
      : 'Refresh the page to try again.';
  }
}
