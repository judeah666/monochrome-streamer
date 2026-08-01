export const SCAN_ACTIVE_POLL_MS = 1000;
export const SCAN_IDLE_POLL_MS = 30_000;
export const SCAN_ERROR_POLL_MS = 5000;
export const ADMIN_USERS_POLL_MS = 10_000;
export const ADMIN_SYSTEM_POLL_MS = 5000;

export function canPollInDocument(documentRef) {
  return documentRef?.hidden !== true && documentRef?.visibilityState !== 'hidden';
}

export function getScanPollingDelay(scanStatus) {
  return scanStatus === 'scanning' ? SCAN_ACTIVE_POLL_MS : SCAN_IDLE_POLL_MS;
}

export function getAdminPollingDelay(activeTab) {
  if (activeTab === 'users') return ADMIN_USERS_POLL_MS;
  if (activeTab === 'system') return ADMIN_SYSTEM_POLL_MS;
  return null;
}
