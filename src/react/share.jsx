import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const share = window.__MONOCHROME_ALBUM_SHARE__ || {};
const tracks = Array.isArray(share.tracks) ? share.tracks : [];

function Icon({ name }) {
  const paths = {
    play: <path d="M9 7.4v9.2a1 1 0 0 0 1.55.83l7-4.6a1 1 0 0 0 0-1.66l-7-4.6A1 1 0 0 0 9 7.4Z" />,
    pause: <><path d="M8 6.5h3v11H8z" /><path d="M14 6.5h3v11h-3z" /></>,
    previous: <><path d="M7 6.5h2v11H7z" /><path d="m17 7-7 5 7 5V7Z" /></>,
    next: <><path d="M15 6.5h2v11h-2z" /><path d="m7 7 7 5-7 5V7Z" /></>,
    shuffle: <><path d="M4 7h2.2c4.8 0 5.2 10 10 10H20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="m17 14 3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 17h2.2c1.7 0 2.8-1.2 3.8-2.8M14 8.8c.7-1 1.4-1.8 2.2-1.8H20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="m17 4 3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
    repeat: <><path d="M17 7H8a4 4 0 0 0-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="m14 4 3 3-3 3M7 17h9a4 4 0 0 0 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="m10 14-3 3 3 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
    download: <><path d="M12 4v10M8 10l4 4 4-4M5 19h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
    volume: <><path d="M5 10v4h3l4 3V7L8 10H5Z" /><path d="M15 9a4 4 0 0 1 0 6M17 7a7 7 0 0 1 0 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function SharedAlbumPage() {
  const audioPlayersRef = useRef([null, null]);
  const activeAudioSlotRef = useRef(0);
  const preparedTrackRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(Number(tracks[0]?.duration) || 0);
  const [volume, setVolume] = useState(0.75);
  const [lastVolume, setLastVolume] = useState(0.75);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const currentTrack = tracks[trackIndex] || null;

  const getActiveAudio = () => audioPlayersRef.current[activeAudioSlotRef.current];

  function clearPreparedTrack() {
    const prepared = preparedTrackRef.current;
    if (!prepared) return;
    prepared.promoted = true;
    prepared.audio.removeEventListener('canplay', prepared.warmDecoder);
    prepared.audio.pause();
    prepared.audio.muted = false;
    prepared.audio.removeAttribute('src');
    prepared.audio.load();
    preparedTrackRef.current = null;
  }

  function getNextTrackIndex() {
    if (repeatMode === 'one') return -1;
    if (shuffle && tracks.length > 1) return getShuffledIndex(trackIndex);
    if (trackIndex < tracks.length - 1) return trackIndex + 1;
    return repeatMode === 'all' ? 0 : -1;
  }

  function prepareNextTrack(audio) {
    const remaining = (Number(audio.duration) || 0) - (Number(audio.currentTime) || 0);
    if (remaining > 8 || remaining < 0) return;
    const nextIndex = getNextTrackIndex();
    if (nextIndex < 0) {
      clearPreparedTrack();
      return;
    }
    if (preparedTrackRef.current?.trackIndex === nextIndex) return;
    clearPreparedTrack();

    const slot = activeAudioSlotRef.current === 0 ? 1 : 0;
    const preloadAudio = audioPlayersRef.current[slot];
    if (!preloadAudio) return;
    const prepared = { audio: preloadAudio, promoted: false, slot, trackIndex: nextIndex, warmDecoder: null };
    preparedTrackRef.current = prepared;
    preloadAudio.preload = 'auto';
    preloadAudio.src = tracks[nextIndex].streamUrl;
    preloadAudio.load();
    prepared.warmDecoder = () => {
      if (prepared !== preparedTrackRef.current || prepared.promoted) return;
      preloadAudio.muted = true;
      preloadAudio.play().then(() => {
        if (prepared.promoted || prepared !== preparedTrackRef.current) return;
        preloadAudio.pause();
        preloadAudio.currentTime = 0;
        preloadAudio.muted = false;
      }).catch(() => {
        preloadAudio.muted = false;
      });
    };
    if (preloadAudio.readyState >= 3) prepared.warmDecoder();
    else preloadAudio.addEventListener('canplay', prepared.warmDecoder, { once: true });
  }

  function promotePreparedTrack() {
    const prepared = preparedTrackRef.current;
    if (!prepared) return false;
    const previousAudio = getActiveAudio();
    preparedTrackRef.current = null;
    prepared.promoted = true;
    prepared.audio.removeEventListener('canplay', prepared.warmDecoder);
    prepared.audio.muted = false;
    prepared.audio.volume = volume;
    activeAudioSlotRef.current = prepared.slot;
    setTrackIndex(prepared.trackIndex);
    setCurrentTime(0);
    setDuration(Number(tracks[prepared.trackIndex].duration) || 0);
    setPlaying(true);
    prepared.audio.play().catch(() => setPlaying(false));
    previousAudio.pause();
    previousAudio.removeAttribute('src');
    previousAudio.load();
    return true;
  }

  useEffect(() => {
    const audio = getActiveAudio();
    if (!audio) return undefined;
    const updateTime = () => {
      if (audio !== getActiveAudio()) return;
      setCurrentTime(audio.currentTime || 0);
      prepareNextTrack(audio);
    };
    const updateDuration = () => {
      if (audio === getActiveAudio()) setDuration(audio.duration || Number(currentTrack?.duration) || 0);
    };
    const handleEnded = () => {
      if (audio !== getActiveAudio()) return;
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => setPlaying(false));
      } else if (promotePreparedTrack()) {
        return;
      } else if (shuffle && tracks.length > 1) {
        selectTrack(getShuffledIndex(trackIndex), true);
      } else if (trackIndex < tracks.length - 1) {
        selectTrack(trackIndex + 1, true);
      } else if (repeatMode === 'all') {
        selectTrack(0, true);
      } else {
        setPlaying(false);
        setCurrentTime(0);
      }
    };
    const handlePause = () => {
      if (audio === getActiveAudio()) setPlaying(false);
    };
    const handlePlay = () => {
      if (audio === getActiveAudio()) setPlaying(true);
    };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [trackIndex, currentTrack?.duration, repeatMode, shuffle, volume]);

  function selectTrack(index, autoplay = true) {
    if (!tracks[index]) return;
    clearPreparedTrack();
    const audio = getActiveAudio();
    setTrackIndex(index);
    setCurrentTime(0);
    setDuration(Number(tracks[index].duration) || 0);
    if (!audio) return;
    audio.src = tracks[index].streamUrl;
    audio.load();
    if (autoplay) {
      audio.play().catch(() => setPlaying(false));
    }
  }

  function togglePlayback() {
    const audio = getActiveAudio();
    if (!audio || !currentTrack) return;
    if (!audio.src) {
      audio.src = currentTrack.streamUrl;
      audio.load();
    }
    if (audio.paused) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }

  function seek(value) {
    const audio = getActiveAudio();
    if (!audio) return;
    const nextTime = Number(value) || 0;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function changeVolume(value) {
    const nextVolume = Math.max(0, Math.min(1, Number(value) || 0));
    setVolume(nextVolume);
    if (nextVolume > 0) setLastVolume(nextVolume);
    const audio = getActiveAudio();
    if (audio) audio.volume = nextVolume;
  }

  function toggleMute() {
    changeVolume(volume > 0 ? 0 : (lastVolume || 0.75));
  }

  function playAdjacent(direction) {
    if (shuffle && tracks.length > 1) {
      selectTrack(getShuffledIndex(trackIndex));
      return;
    }
    const nextIndex = trackIndex + direction;
    if (tracks[nextIndex]) {
      selectTrack(nextIndex);
    } else if (repeatMode === 'all') {
      selectTrack(direction > 0 ? 0 : tracks.length - 1);
    }
  }

  function cycleRepeatMode() {
    setRepeatMode((current) => current === 'off' ? 'all' : current === 'all' ? 'one' : 'off');
  }

  if (!share.album || tracks.length === 0) {
    return <main className="share-empty"><h1>Album unavailable</h1><p>This shared album has no playable tracks.</p></main>;
  }

  const album = share.album;
  const albumMeta = [album.year, album.genre, `${tracks.length} track${tracks.length === 1 ? '' : 's'}`].filter(Boolean);
  const expiresAtLabel = formatExpiry(share.expiresAt);

  return (
    <main className="share-page">
      <header className="share-header">
        <div className="share-brand"><span className="share-brand-disc" />{share.siteTitle || 'Monochrome-Streamer'}</div>
        <div className="share-guest-badge">
          <span />
          <div className="share-guest-copy">
            <strong>Guest listening · Downloads off</strong>
            {expiresAtLabel ? <small>Expires {expiresAtLabel}</small> : null}
          </div>
        </div>
      </header>

      <section className="share-album-card">
        <div className="share-cover-wrap">
          {album.coverUrl ? <img className="share-cover" src={album.coverUrl} alt={`${album.title} cover`} /> : <div className="share-cover share-cover-empty"><span className="share-brand-disc" /></div>}
        </div>
        <div className="share-album-copy">
          <p className="share-eyebrow">Shared album</p>
          <h1>{album.title}</h1>
          <h2>{album.albumArtist || album.artist || 'Unknown artist'}</h2>
          <p className="share-meta">{albumMeta.join(' · ')}</p>
        </div>
      </section>

      <section className="share-track-section" aria-label="Album tracks">
        <div className="share-section-heading"><h3>Tracks</h3><span>Play only</span></div>
        <ol className="share-track-list">
          {tracks.map((track, index) => {
            const active = index === trackIndex;
            return (
              <li key={track.id}>
                <button className={`share-track${active ? ' is-active' : ''}`} type="button" onClick={() => selectTrack(index)}>
                  <span className="share-track-number">{active && playing ? <span className="share-playing-bars"><i /><i /><i /></span> : (track.trackNumber || index + 1)}</span>
                  <span className="share-track-copy"><strong>{track.title}</strong>{track.artist && track.artist !== album.albumArtist ? <small>{track.artist}</small> : null}</span>
                  <span className="share-track-duration">{formatTime(track.duration)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="share-player" aria-label="Shared album player">
        <audio ref={(node) => { audioPlayersRef.current[0] = node; }} preload="metadata" controlsList="nodownload noplaybackrate" onContextMenu={(event) => event.preventDefault()} />
        <audio ref={(node) => { audioPlayersRef.current[1] = node; }} preload="none" controlsList="nodownload noplaybackrate" onContextMenu={(event) => event.preventDefault()} />
        <div className="share-player-track">
          {album.coverUrl ? <img src={album.coverUrl} alt="" /> : <div />}
          <span><strong>{currentTrack.title}</strong><small>{album.title}</small><small>{currentTrack.artist || album.albumArtist}</small></span>
        </div>
        <div className="share-player-controls">
          <div className="share-progress"><span>{formatTime(currentTime)}</span><input type="range" min="0" max={Math.max(duration, 1)} step="0.1" value={Math.min(currentTime, Math.max(duration, 1))} onChange={(event) => seek(event.target.value)} aria-label="Seek" /><span>{formatTime(duration)}</span></div>
          <div className="share-transport">
            <button className={shuffle ? 'is-active' : ''} type="button" onClick={() => setShuffle((current) => !current)} aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'} aria-pressed={shuffle}><Icon name="shuffle" /></button>
            <button type="button" onClick={() => playAdjacent(-1)} disabled={!shuffle && repeatMode !== 'all' && trackIndex === 0} aria-label="Previous track"><Icon name="previous" /></button>
            <button className="share-play-button" type="button" onClick={togglePlayback} aria-label={playing ? 'Pause' : 'Play'}><Icon name={playing ? 'pause' : 'play'} /></button>
            <button type="button" onClick={() => playAdjacent(1)} disabled={!shuffle && repeatMode !== 'all' && trackIndex === tracks.length - 1} aria-label="Next track"><Icon name="next" /></button>
            <button className={repeatMode !== 'off' ? 'is-active' : ''} type="button" onClick={cycleRepeatMode} aria-label={`Repeat ${repeatMode}`} aria-pressed={repeatMode !== 'off'}><Icon name="repeat" />{repeatMode === 'one' ? <span className="share-repeat-one">1</span> : null}</button>
          </div>
        </div>
        <div className="share-player-actions">
          <span className="share-queue-status"><small>Queue</small><strong>{trackIndex + 1} of {tracks.length}</strong></span>
          <button className="share-utility-button" type="button" disabled aria-label="Downloads disabled" title="Downloads disabled"><Icon name="download" /></button>
          <button className="share-utility-button" type="button" onClick={toggleMute} aria-label={volume > 0 ? 'Mute' : 'Unmute'}><Icon name="volume" /></button>
          <label className="share-volume"><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => changeVolume(event.target.value)} aria-label="Volume" /></label>
        </div>
      </section>
    </main>
  );
}

function formatTime(value) {
  const seconds = Math.max(0, Number(value) || 0);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function formatExpiry(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getShuffledIndex(currentIndex) {
  if (tracks.length < 2) return currentIndex;
  const offset = 1 + Math.floor(Math.random() * (tracks.length - 1));
  return (currentIndex + offset) % tracks.length;
}

const root = document.querySelector('#share-root');
if (root) createRoot(root).render(<SharedAlbumPage />);
