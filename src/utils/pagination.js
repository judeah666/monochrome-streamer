function toPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function buildPaginationItems(currentPage, totalPages) {
  const safeTotalPages = Math.max(1, toPositiveInteger(totalPages, 1));
  const safeCurrentPage = Math.min(
    safeTotalPages,
    Math.max(1, toPositiveInteger(currentPage, 1)),
  );

  if (safeTotalPages <= 5) {
    return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
  }

  if (safeCurrentPage <= 3) {
    return [1, 2, 3, 'ellipsis-end', safeTotalPages];
  }

  if (safeCurrentPage >= safeTotalPages - 2) {
    return [
      1,
      'ellipsis-start',
      safeTotalPages - 2,
      safeTotalPages - 1,
      safeTotalPages,
    ];
  }

  return [
    1,
    'ellipsis-start',
    safeCurrentPage,
    'ellipsis-end',
    safeTotalPages,
  ];
}

export function getPaginationState({ total = 0, limit = 50, offset = 0 } = {}) {
  const safeTotal = Math.max(0, Number(total) || 0);
  const safeLimit = toPositiveInteger(limit, 50);
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));
  const requestedPage = Math.floor(Math.max(0, Number(offset) || 0) / safeLimit) + 1;
  const currentPage = Math.min(totalPages, requestedPage);

  return {
    currentPage,
    totalPages,
    items: buildPaginationItems(currentPage, totalPages),
  };
}

export function getPaginationOffset(page = {}, target = 'previous', fallbackLimit = 50) {
  const limit = toPositiveInteger(page.limit, toPositiveInteger(fallbackLimit, 50));
  const offset = Math.max(0, Number(page.offset) || 0);
  const total = Math.max(0, Number(page.total) || 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const maxOffset = Math.max(0, (totalPages - 1) * limit);

  if (Number.isInteger(target) && target > 0) {
    return Math.min(maxOffset, (target - 1) * limit);
  }

  if (target === 'next') {
    return Math.min(maxOffset, offset + limit);
  }

  return Math.max(0, offset - limit);
}
