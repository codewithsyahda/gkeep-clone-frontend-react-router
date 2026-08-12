import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import envConfig from './configs/envs';

async function enableMsw() {
  if (import.meta.env.DEV && envConfig.dev.mock.msw) {
    const { mswBrowserWorker } = await import('./tests/mocks/apis/mswBrowser');
    await mswBrowserWorker.start();
  }
}

await enableMsw();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
