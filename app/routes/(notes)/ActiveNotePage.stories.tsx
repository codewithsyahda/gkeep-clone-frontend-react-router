import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { expect, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import envConfig from '~/configs/envs';
import getNoteByIdHandler from '~/tests/mocks/apis/handlers/notes/getNoteByIdHandler';
import getNotesHandler from '~/tests/mocks/apis/handlers/notes/getNotesHandler';
import ActiveNotesPageContent from './_components/ActiveNotesPageContent';
import NotesPageLayoutContent from './_components/NotePageLayoutContent/NotePageLayoutContent';
import {
  getSessionHandler,
  signOutHandler,
} from './_components/NotePageLayoutContent/NotePageLayoutContent.stories';

const meta = {
  title: 'Pages/ActiveNotePage',
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
              Component: ActiveNotesPageContent,
            },
          ],
        },
      ],
      { initialEntries: ['/'] },
    );

    return <RouterProvider router={router} />;
  },
  excludeStories: [
    'getEmptyNotesHandler',
    'putNoteByIdHandler',
    'patchNoteByIdHandler',
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const postNoteHandler = http.post(
  `${envConfig.api.baseUrl}/notes`,
  async () => {
    await delay('real');
    return HttpResponse.json(null, { status: 201 });
  },
);

export const putNoteByIdHandler = http.put<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
  await delay('real');
  return HttpResponse.json(null);
});

export const patchNoteByIdHandler = http.patch<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
  await delay('real');
  return HttpResponse.json(null);
});

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        getSessionHandler,
        getNotesHandler,
        postNoteHandler,
        getNoteByIdHandler,
        putNoteByIdHandler,
        patchNoteByIdHandler,
        signOutHandler,
      ],
    },
  },
};

export const getEmptyNotesHandler = http.get(
  `${envConfig.api.baseUrl}/notes`,
  async () => {
    return HttpResponse.json({
      data: {
        notes: {
          active: [],
          archived: [],
          trash: [],
        },
      },
    });
  },
);

export const EmptyNotes: Story = {
  parameters: {
    msw: {
      handlers: [
        getSessionHandler,
        getEmptyNotesHandler,
        postNoteHandler,
        signOutHandler,
      ],
    },
  },
};

export const SearchNotesInputHotkeys: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByPlaceholderText('Search [ / ]')).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.keyboard('[Slash]');

        await expect(canvas.getByPlaceholderText('Search [ / ]')).toHaveFocus();

        await userEvent.keyboard('title 3');

        await expect(canvas.getByPlaceholderText('Search [ / ]')).toHaveValue(
          'title 3',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.keyboard('[Escape]');

        await expect(
          canvas.getByPlaceholderText('Search [ / ]'),
        ).not.toHaveFocus();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('link', {
            name: /^Edit$/,
          }),
        );

        await expect(
          canvas.getByRole('button', {
            name: /^Update note$/,
          }),
        ).toBeVisible();

        await expect(canvas.getByPlaceholderText('Search [ / ]')).toBeVisible();

        await userEvent.keyboard('[Slash]');

        await expect(
          canvas.getByPlaceholderText('Search [ / ]'),
        ).not.toHaveFocus();
      },
      { timeout: 3000 },
    );
  },
};
