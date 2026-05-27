export function ensureAudioGraph({ state, audioPlayer, windowRef = window }) {
  if (state.audioContext && state.audioSource && state.analyser) {
    state.audioContext.resume?.().catch(() => {});
    return true;
  }

  const AudioContextClass = windowRef.AudioContext || windowRef.webkitAudioContext;
  if (!AudioContextClass) return false;
  state.audioContext = new AudioContextClass();
  state.audioSource = state.audioContext.createMediaElementSource(audioPlayer);
  state.analyser = state.audioContext.createAnalyser();
  state.analyser.fftSize = 128;
  state.analyserData = new Uint8Array(state.analyser.frequencyBinCount);
  state.audioSource.connect(state.analyser);
  state.analyser.connect(state.audioContext.destination);
  return true;
}

export function shouldRunVisualizer({ visualizerActive, view, paused }) {
  return Boolean(visualizerActive && view === 'fullscreen' && !paused);
}

export function updateVisualizerState({
  state,
  audioPlayer,
  canvas,
  button,
  windowRef = window,
}) {
  button.classList.toggle('active', state.visualizerActive);
  canvas.hidden = !state.visualizerActive;
  if (shouldRunVisualizer({
    visualizerActive: state.visualizerActive,
    view: state.route.view,
    paused: audioPlayer.paused,
  })) {
    ensureAudioGraph({ state, audioPlayer, windowRef });
    startVisualizer({ state, canvas, windowRef });
  } else {
    stopVisualizer({ state, windowRef });
  }
}

export function startVisualizer({ state, canvas, windowRef = window }) {
  if (state.visualizerFrameId || !state.analyser || !state.analyserData) return;
  const context = canvas.getContext('2d');
  const draw = () => {
    state.visualizerFrameId = windowRef.requestAnimationFrame(draw);
    drawVisualizerFrame({ state, canvas, context, windowRef });
  };
  draw();
}

export function drawVisualizerFrame({ state, canvas, context, windowRef = window }) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const scale = windowRef.devicePixelRatio || 1;
  if (canvas.width !== Math.floor(width * scale) || canvas.height !== Math.floor(height * scale)) {
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
  }
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, width, height);
  state.analyser.getByteFrequencyData(state.analyserData);
  const bars = state.analyserData.length;
  const barWidth = width / bars;
  for (let index = 0; index < bars; index += 1) {
    const value = state.analyserData[index] / 255;
    const barHeight = Math.max(4, value * height * 0.42);
    context.fillStyle = `rgba(255, 255, 255, ${0.08 + value * 0.28})`;
    context.fillRect(index * barWidth, height - barHeight, Math.max(1, barWidth - 2), barHeight);
  }
}

export function stopVisualizer({ state, windowRef = window }) {
  if (!state.visualizerFrameId) return;
  windowRef.cancelAnimationFrame(state.visualizerFrameId);
  state.visualizerFrameId = 0;
}
