export function getAlbumSharePath(albumId) {
  return `/share/album/${encodeURIComponent(String(albumId || ''))}`;
}

export function createAlbumSharePage({
  siteTitle = 'Monochrome-Streamer',
  album = {},
  canonicalUrl = '',
  appUrl = '',
  imageUrl = '',
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
  const redirectTarget = JSON.stringify(String(appUrl || '/')).replace(/</gu, '\\u003c');

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
  <script>window.location.replace(${redirectTarget});</script>
</head>
<body>
  <p><a href="${escapeHtml(appUrl)}">Open ${escapeHtml(albumTitle)} in ${escapeHtml(siteTitle)}</a></p>
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
