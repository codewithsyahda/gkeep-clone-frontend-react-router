import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import envConfig from './configs/envs';

async function startEntryClient() {
  if (import.meta.env.DEV) {
    const { UsersDB } = await import('./tests/mocks/apis/fakeDB/users');
    const { NotesDB } = await import('./tests/mocks/apis/fakeDB/notes');

    const dbIsInitialized =
      window.sessionStorage.getItem('dbIsInitialized') === 'true';

    if (!dbIsInitialized) {
      UsersDB.init();
      NotesDB.init();

      window.sessionStorage.setItem('dbIsInitialized', 'true');
    }
  }

  if (import.meta.env.DEV && envConfig.dev.mock.msw) {
    const { mswBrowserWorker } = await import('./tests/mocks/apis/mswBrowser');
    await mswBrowserWorker.start();
  }

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
}

startEntryClient();
