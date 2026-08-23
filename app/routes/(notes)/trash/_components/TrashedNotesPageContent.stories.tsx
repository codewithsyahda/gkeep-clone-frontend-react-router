import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, screen, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import {
  mockDeleteNoteByIdHandler,
  mockDeleteNotesHandler,
  mockGetNotesHandler,
  mockPatchNoteByIdHandler,
} from '.storybook/parameters/msw/notesHandlers';
import NotesSelectionCtxProvider from '~/contexts/NotesSelectionCtxProvider';
import TrashedNotesPageContent from './TrashedNotesPageContent';

const meta = {
  title: 'Composites/TrashedNotesPageContent',
  component: TrashedNotesPageContent,
  parameters: {
    layout: 'centered',
    reactRouter: reactRouterParameters({
      location: {
        path: '/trash',
      },
      routing: {
        path: '/*',
      },
    }),
  },
  decorators: [
    reactQueryDecorator,
    withRouter,
    (Story) => (
      <NotesSelectionCtxProvider>
        <div className="h-[95dvh] w-[96vw]">
          <Story />
        </div>
      </NotesSelectionCtxProvider>
    ),
  ],
} satisfies Meta<typeof TrashedNotesPageContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [mockGetNotesHandler({ delayInfinite: true })],
    },
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(
        canvas.queryByText('Trashed notes appear here.'),
      ).not.toBeInTheDocument();

      await expect(
        canvas.queryByText('Notes in Trash are deleted after 7 days.'),
      ).not.toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', {
          name: 'Empty all',
        }),
      ).not.toBeInTheDocument();
    });
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [mockGetNotesHandler({ emptyNotes: true })],
    },
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByText('Trashed notes appear here.'),
      ).toBeInTheDocument();

      await expect(
        canvas.queryByText('Notes in Trash are deleted after 7 days.'),
      ).not.toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', {
          name: 'Empty all',
        }),
      ).not.toBeInTheDocument();
    });
  },
};

export const AvailableNotes: Story = {
  parameters: {
    msw: {
      handlers: [
        mockGetNotesHandler(),
        mockPatchNoteByIdHandler(),
        mockDeleteNotesHandler(),
        mockDeleteNoteByIdHandler(),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        for (const [idx, eachNote] of [
          {
            title: 'Note Title 3',
            content: [
              ['h1', 'Note 3 Heading 1'],
              ['h2', 'Note 3 Heading 2'],
              ['p', 'Note 3 paragraph 1.'],
              ['li', 'Note 3 list bullet 1'],
              ['li', 'Note 3 list bullet 2'],
              ['p', 'Note 3 paragraph 2.'],
              ['li', 'Note 3 list #1'],
              ['li', 'Note 3 list #2'],
            ],
            updatedAt: 'Feb, 03 2026',
          },
          {
            title: 'Note Title 2',
            content: [
              ['h1', 'Note 2 Heading 1'],
              ['h2', 'Note 2 Heading 2'],
              ['p', 'Note 2 paragraph 1.'],
              ['li', 'Note 2 list bullet 1'],
              ['li', 'Note 2 list bullet 2'],
              ['p', 'Note 2 paragraph 2.'],
              ['li', 'Note 2 list #1'],
              ['li', 'Note 2 list #2'],
            ],
            updatedAt: 'Feb, 02 2026',
          },
          {
            title: 'Note Title 1',
            content: [
              ['h1', 'Note 1 Heading 1'],
              ['h2', 'Note 1 Heading 2'],
              ['p', 'Note 1 paragraph 1.'],
              ['li', 'Note 1 list bullet 1'],
              ['li', 'Note 1 list bullet 2'],
              ['p', 'Note 1 paragraph 2.'],
              ['li', 'Note 1 list #1'],
              ['li', 'Note 1 list #2'],
            ],
            updatedAt: 'Feb, 01 2026',
          },
        ].entries()) {
          await expect(
            canvas.getByRole('heading', {
              name: eachNote.title,
            }),
          ).toBeInTheDocument();

          for (const [tagName, eachContent] of eachNote.content) {
            await waitFor(async () => {
              await expect(
                canvas.getByText((_content, element) => {
                  return (
                    element?.tagName.toLowerCase() === tagName &&
                    element?.textContent === eachContent
                  );
                }),
              ).toBeInTheDocument();
            });
          }

          await userEvent.click(
            canvas.getAllByRole('button', {
              name: 'Info',
            })[idx],
          );

          await expect(
            canvas.getByText(`Last edited • ${eachNote.updatedAt}`),
          ).toBeInTheDocument();
        }
      },
      { timeout: 15000 },
    );

    await expect(
      canvas.getAllByRole('button', {
        name: 'Restore',
      }),
    ).toHaveLength(3);

    await expect(
      canvas.getAllByRole('button', {
        name: 'Delete',
      }),
    ).toHaveLength(3);

    await expect(
      canvas.getAllByRole('link', {
        name: 'Note detail',
      }),
    ).toHaveLength(3);

    await expect(
      canvas.queryByText('Trashed notes appear here.'),
    ).not.toBeInTheDocument();

    await expect(
      canvas.getByText('Notes in Trash are deleted after 7 days.'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('button', {
        name: 'Empty all',
      }),
    ).toBeInTheDocument();
  },
};

export const DeletingAllNotes: Story = {
  parameters: {
    msw: {
      handlers: [
        mockGetNotesHandler(),
        mockPatchNoteByIdHandler(),
        mockDeleteNoteByIdHandler(),
        mockDeleteNotesHandler({ delayInfinite: true }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Empty all',
        }),
      );
    });

    await waitFor(async () => {
      await expect(screen.getByText('Empty trash?')).toBeVisible();

      await expect(
        screen.getByText('All notes in Trash will be permanently deleted.'),
      ).toBeVisible();

      await userEvent.click(
        screen.getByRole('button', {
          name: 'Yes',
        }),
      );
    });

    await expect(
      screen.getByRole('button', {
        name: 'Yes',
      }),
    ).toBeDisabled();
  },
};
