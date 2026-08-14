import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import '../app/app.css';

import type { Preview } from '@storybook/react-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';

import { notes } from '~/tests/mocks/apis/fakeDB/notes';
import { users } from '~/tests/mocks/apis/fakeDB/users';
import muiThemeDecorator from './decorators/muiTheme';

initialize();

if (window) {
  window.sessionStorage.setItem('usersDB', JSON.stringify(users));
  window.sessionStorage.setItem('notesDB', JSON.stringify(notes));
}

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [muiThemeDecorator],
};

export default preview;
