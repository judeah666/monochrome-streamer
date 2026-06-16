import React, { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { AppShell } from '../layouts/AppShell.jsx';
import { installMonochromeReactBridge } from '../services/rendererBridge.jsx';

function ReactReadySignal() {
  useEffect(() => {
    document.documentElement.dataset.react = 'ready';
    window.dispatchEvent(new CustomEvent('monochrome:react-ready'));

    return () => {
      delete document.documentElement.dataset.react;
    };
  }, []);

  return null;
}

installMonochromeReactBridge();

const rootElement = document.querySelector('#react-root');

if (rootElement) {
  const appRoot = createRoot(rootElement);
  flushSync(() => {
    appRoot.render(
      <React.StrictMode>
        <AppShell />
        <ReactReadySignal />
      </React.StrictMode>,
    );
  });
}

import('../controller/appController.js').catch((error) => {
  console.error('Unable to start Monochrome Streamer controller', error);
});
