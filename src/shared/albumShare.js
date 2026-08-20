export function getAlbumSharePath(albumId) {
  return `/share/album/${encodeURIComponent(String(albumId || ''))}`;
}

export function createAlbumSharePage({
  siteTitle = 'Monochrome-Streamer',
  album = {},
  canonicalUrl = '',
  imageUrl = '',
  sharePayload = {},
} = {}) {
  const albumTitle = String(album.title || 'Album').trim();
  const artist = String(album.albumArtist || album.artist || 'Unknown artist').trim();
  const year = String(album.year || '').trim();
  const pageTitle = `${albumTitle} by ${artist} | ${siteTitle}`;
  const description = `Listen to ${albumTitle} by ${artist}${year ? ` (${year})` : ''} on ${siteTitle}.`;
  const imageMeta = imageUrl
    ? `
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:alt" content="${escapeHtml(`${albumTitle} cover art`)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">`
    : '';
  const serializedPayload = JSON.stringify(sharePayload).replace(/</gu, '\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="music.album">
  <meta property="og:site_name" content="${escapeHtml(siteTitle)}">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">${imageMeta}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23111111'/%3E%3Ccircle cx='32' cy='32' r='19' fill='%23eb9200'/%3E%3Ccircle cx='32' cy='32' r='6' fill='%23111111'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Space+Grotesk:wght@600;700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/share.css">
  <script>window.__MONOCHROME_ALBUM_SHARE__=${serializedPayload};</script>
</head>
<body>
  <div id="share-root"><p class="share-loading">Loading shared album…</p></div>
  <script type="module" src="/react/share.js"></script>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;');
}
