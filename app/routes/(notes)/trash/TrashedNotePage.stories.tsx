import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import envConfig from '~/configs/envs';
import getNoteByIdHandler from '~/tests/mocks/apis/handlers/notes/getNoteByIdHandler';
import getNotesHandler from '~/tests/mocks/apis/handlers/notes/getNotesHandler';
import NotesPageLayoutContent from '../_components/NotePageLayoutContent/NotePageLayoutContent';
import {
  getSessionHandler,
  signOutHandler,
} from '../_components/NotePageLayoutContent/NotePageLayoutContent.stories';
import * as ActiveNotePageStories from '../ActiveNotePage.stories';
import {
  getEmptyNotesHandler,
  patchNoteByIdHandler,
  putNoteByIdHandler,
} from '../ActiveNotePage.stories';
import TrashedNotesPageContent from './_components/TrashedNotesPageContent';

const meta = {
  title: 'Pages/TrashedNotesPage',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    reactQueryDecorator,
    (Story) => (
      <>
        <div className="-m-4 w-screen">
          <Story />
        </div>
        <Toaster />
      </>
    ),
  ],
  render: () => {
    const router = createMemoryRouter(
      [
        {
          Component: NotesPageLayoutContent,
          children: [
            {
              path: '/*',
              Component: TrashedNotesPageContent,
            },
          ],
        },
      ],
      {
        initialEntries: ['/trash'],
      },
    );

    return <RouterProvider router={router} />;
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        getSessionHandler,
        getNotesHandler,
        getNoteByIdHandler,
        putNoteByIdHandler,
        patchNoteByIdHandler,
        http.delete<{ noteId: string }>(
          `${envConfig.api.baseUrl}/notes/:noteId`,
          async () => {
            await delay('real');
            return HttpResponse.json(null);
          },
        ),
        http.delete<{ noteId: string }>(
          `${envConfig.api.baseUrl}/notes`,
          async () => {
            await delay('real');
            return HttpResponse.json(null);
          },
        ),
        signOutHandler,
      ],
    },
  },
};

export const EmptyNotes: Story = {
  parameters: {
    msw: {
      handlers: [getSessionHandler, getEmptyNotesHandler, signOutHandler],
    },
  },
};

export const SearchNotesInputHotkeys: Story =
  ActiveNotePageStories.SearchNotesInputHotkeys;
