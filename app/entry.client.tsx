import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import envConfig from './configs/envs';

async function enableMsw() {
  if (envConfig.dev.mock.api) {
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
