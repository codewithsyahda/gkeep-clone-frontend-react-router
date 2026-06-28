import { setupWorker } from 'msw/browser';
import { mswNotesHandlers } from './handlers/mswNotesHandlers';

export const mswBrowserWorker = setupWorker(...mswNotesHandlers);
