import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import {
  getEmptyNotesHandler,
  getNotesHandler,
  getNotesLoadingHandler,
  patchNoteByIdHandler,
  putNoteByIdHandler,
} from '.storybook/parameters/msw/notesHandlers';
import NotesSelectionCtxProvider from '~/contexts/NotesSelectionCtxProvider';
import ActiveNotesPageContent from './ActiveNotesPageContent';

const meta = {
  title: 'Composites/ActiveNotesPageContent',
  component: ActiveNotesPageContent,
  parameters: {
    layout: 'centered',
    reactRouter: reactRouterParameters({
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
} satisfies Meta<typeof ActiveNotesPageContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [getNotesLoadingHandler],
    },
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(
        canvas.queryByText('Notes clear. Enjoy and take a break.'),
      ).not.toBeInTheDocument();
    });
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [getEmptyNotesHandler],
    },
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByText('Notes clear. Enjoy and take a break.'),
      ).toBeInTheDocument();
    });
  },
};

export const AvailableNotes: Story = {
  parameters: {
    msw: {
      handlers: [getNotesHandler, putNoteByIdHandler, patchNoteByIdHandler],
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
        name: 'Archive',
      }),
    ).toHaveLength(3);

    await expect(
      canvas.getAllByRole('button', {
        name: 'Trash',
      }),
    ).toHaveLength(3);

    await expect(
      canvas.getAllByRole('link', {
        name: 'Edit',
      }),
    ).toHaveLength(3);

    await waitFor(async () => {
      await expect(
        canvas.queryByText('Notes clear. Enjoy and take a break.'),
      ).not.toBeInTheDocument();
    });
  },
};
