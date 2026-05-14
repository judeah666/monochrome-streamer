# Monochrome-Streamer

A small self-hosted music streamer inspired by the look and feel of [Monochrome](https://github.com/monochrome-music/monochrome), but built for your own files on your own server.

## What this version does

- Scans a local folder on your server for audio files
- Streams those files in the browser with HTTP range support
- Reads embedded tags for track title, album, artist, track number, duration, and embedded cover art when `music-metadata` is installed
- Detects album art from sidecar images like `cover.jpg`, `folder.jpg`, or `front.png`
- Lets you edit local album metadata overrides from an album tag editor window
- Saves synced lyrics as `.lrc` files beside your music files
- Uses Font Awesome icons throughout the app
- Searches MusicBrainz and Cover Art Archive for album metadata, track lists, and cover art
- Shows artist pages with manual artist metadata first, then an online Wikipedia fallback when reachable
- Lets you add or edit artist images and artist info from the artist page
- Groups music by folder structure:
  - `Artist/Album/01 - Track.mp3`
  - `Artist/Album/1-01 - Track.flac`
- Provides Multiple web UI Theme for browsing albums, artists, favorites, playlists, and folders

## Screenshots

### Floating Player

![Floating player layout](docs/screenshots/floating-player.png)

### Edge-to-Edge Player

![Edge-to-edge player layout](docs/screenshots/edge-to-edge-player.png)

## Recommended library layout

This app works best when your library looks like this:

```text
D:\Music
  Artist Name
    Album Name
      cover.jpg
      01 - First Song.flac
      02 - Second Song.flac
```

It will still scan nested folders recursively, but the `Artist/Album/Track` layout gives the cleanest metadata.

## Setup

1. Copy `config.example.json` to `config.json`
2. Edit `config.json` and set `libraryPath` to your music folder
3. Install dependencies:

```powershell
npm install
```

4. Start the server:

```powershell
node server.mjs
```

If online metadata search fails on Windows with a certificate error, start Node with the system certificate store:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
node server.mjs
```

5. Open:

```text
http://localhost:8888
```

## Docker

You can test it in Docker without creating `config.json`.

### Option 1: docker run

Build the image:

```powershell
docker build -t monochrome-streamer .
```

Run it and mount your music folder read-only:

```powershell
docker run --rm -p 8888:8888 `
  -e APP_TITLE="Monochrome-Streamer" `
  -e MUSIC_LIBRARY_PATH=/music `
  -e ALBUM_OVERRIDES_PATH=/data/album-overrides.json `
  --mount type=bind,source="D:\Music",target=/music,readonly `
  --mount type=volume,source=monochrome-streamer-data,target=/data `
  monochrome-streamer
```

Then open:

```text
http://localhost:8888
```

### Option 2: docker compose

Create a `.env` file first by copying `.env.example`:

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and set your real music folder, for example:

```text
MUSIC_DIR=D:\Music
APP_TITLE=Monochrome-Streamer
ARTIST_INFO_DIR=D:\Github\Monochrome-Streamer
```

Then run:

```powershell
docker compose up --build
```

Then open:

```text
http://localhost:8888
```

Stop it with `Ctrl+C`, or in another terminal:

```powershell
docker compose down
```

If you prefer not to keep a `.env` file, you can still set the same values in PowerShell before running Compose.

### Quick Docker smoke test

If you want to test with the included sample library instead of your real music folder:

```powershell
docker run --rm -p 8888:8888 `
  -e APP_TITLE="Sample Library" `
  -e MUSIC_LIBRARY_PATH=/music `
  -e ALBUM_OVERRIDES_PATH=/data/album-overrides.json `
  --mount type=bind,source="D:\Github\Monochrome-Streamer\sample-library",target=/music,readonly `
  --mount type=volume,source=monochrome-streamer-data,target=/data `
  monochrome-streamer
```

## Configuration

`config.json`

```json
{
  "title": "Monochrome-Streamer",
  "libraryPath": "D:\\Music",
  "artistInfoPath": "artist-info.json",
  "artistOverridesPath": "artist-overrides.json",
  "albumOverridesPath": "album-overrides.json",
  "host": "0.0.0.0",
  "port": 8888
}
```

You can also override values with environment variables:

- `MUSIC_LIBRARY_PATH`
- `APP_TITLE`
- `ARTIST_INFO_PATH`
- `ARTIST_OVERRIDES_PATH`
- `ALBUM_OVERRIDES_PATH`
- `HOST`
- `PORT`

### Manual artist info

Artist pages try `artist-info.json` first. Copy `artist-info.example.json` to `artist-info.json`, then add entries like this:

```json
{
  "artists": {
    "Brownman Revival": {
      "imageUrl": "https://example.com/brownman-revival.jpg",
      "bio": "Short bio to show on the artist page.",
      "sourceUrl": "https://example.com/brownman-revival",
      "source": "manual"
    }
  }
}
```

If an artist is not in that file, the server tries to fetch a Wikipedia image and summary. If the server has no internet access or nothing is found, the UI falls back to initials.

Artist edits made inside the app are saved separately in `artist-overrides.json`, or in Docker at `/data/artist-overrides.json` by default. Edited artist info takes priority over `artist-info.json`.

### Album tag editor

Use the edit icon on the full album page to open the tag editor. You can edit album title, album artist, year, genre, multiple media types, collection status, cover URL, track titles, track artists, and track numbers.

The editor saves local overrides in `album-overrides.json`, or in Docker at `/data/album-overrides.json` by default. It does not rewrite your original audio files.

The online search uses MusicBrainz for release metadata and Cover Art Archive for cover art.

## API

- `GET /api/config`
- `GET /api/library`
- `POST /api/rescan`
- `GET /api/artists/:name/info`
- `POST /api/artists/:name/info`
- `POST /api/albums/:id/cover`
- `POST /api/albums/:id/tags`
- `GET /api/albums/:id/tag-suggestions`
- `GET /api/musicbrainz/releases/:id`
- `GET /api/tracks/:id/stream`
- `GET /api/tracks/:id/cover`

## Notes

- This is not a full fork of upstream Monochrome. The upstream app is much broader and built around online APIs and remote catalog data.
- This version keeps the local-server use case simple and focused so you can own the whole stack.
- In Docker, environment variables are the easiest way to configure the app, especially `MUSIC_LIBRARY_PATH=/music` with a bind mount.
