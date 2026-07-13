# monochrome-streamer

`monochrome-streamer` is a self-hosted music streamer for your own local music files. It is inspired by Monochrome, but the library index, album edits, artist overrides, lyrics, users, cached covers, and scan state live on your own server.

## Highlights

- Streams music directly from a mounted local library.
- Browses albums, artists, tracks, playlists, favorites, wishlist albums, and collections.
- Stores metadata, user accounts, lyrics, overrides, and scan data in SQLite under `/data`.
- Supports local album and artist editing, synced lyrics, cover art caching, and MusicBrainz lookups.
- Includes a built-in admin surface for users, scans, widget settings, download controls, backups, and Excel exports.

## Secure-By-Default Behavior In `0.3.4`

- Guest browsing is enabled by default with `NOAUTH=true`.
- Guest downloads are disabled by default with `DOWNLOADS=false`.
- All downloads require a signed-in non-guest account.
- Admin and download mutations use same-origin validation plus per-session CSRF protection.
- Widget API access should only be enabled with a real API key and a specific allowed origin.

## Quick Start

```yaml
services:
  monochrome-streamer:
    image: judeah666/monochrome-streamer:latest
    container_name: monochrome-streamer
    restart: unless-stopped
    ports:
      - "8888:8888"
    env_file:
      - .env
    volumes:
      - /path/to/your/music:/music
      - /opt/monochrome-streamer/data:/data
```

Example `.env`:

```env
MUSIC_DIR=/path/to/your/music
APP_DATA_DIR=/opt/monochrome-streamer/data
APP_TITLE=Monochrome-Streamer
NOAUTH=true
DOWNLOADS=false
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-admin-password
```

Open `http://localhost:8888` after startup. Visit `/login` when you want to sign in as admin or as a managed user.

## Volumes

- `/music`: your mounted music library
- `/data`: SQLite database, cached covers, lyrics data, widget settings, and library overrides

Keep `/data` when updating the image so the library index and edits persist across releases.

## Useful Environment Variables

- `NOAUTH=true`: allow anonymous browsing without a login wall
- `DOWNLOADS=false`: disable guest downloads
- `ADMIN_USERNAME` and `ADMIN_PASSWORD`: admin login when auth is enabled
- `SCAN_METADATA=tags|filename`: choose safer or richer scan mode
- `AUTO_SCAN_ON_START=false`: avoid large automatic scans on container boot
- `WIDGET_API_KEY` and `WIDGET_CORS_ORIGIN`: enable the widget stats API safely

## Recommended First Run

1. Start the container.
2. Open the app in your browser.
3. Visit `/login` and sign in as admin if you want to manage the library.
4. Open the `Admin` sidebar tab.
5. Refresh folders, select the top-level music folders you want, then save and scan.

## Tags

- `latest`
- `0.3.4`
