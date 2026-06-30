import type { Meta, StoryObj } from '@storybook/react-vite';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import getNoteByIdHandler from '~/tests/mocks/apis/handlers/notes/getNoteByIdHandler';
import getNotesHandler from '~/tests/mocks/apis/handlers/notes/getNotesHandler';
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
import NotesPageLayoutContent from './../_components/NotePageLayoutContent/NotePageLayoutContent';
import ArchivedNotesPageContent from './_components/ArchiveNotesPageContent';

const meta = {
  title: 'Pages/ArchivedNotesPage',
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
              Component: ArchivedNotesPageContent,
            },
          ],
        },
      ],
      {
        initialEntries: ['/archive'],
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
