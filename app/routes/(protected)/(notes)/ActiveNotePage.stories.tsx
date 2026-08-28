import type { Meta, StoryObj } from '@storybook/react-vite';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { expect, screen, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import { mockGetSessionHandler } from '.storybook/parameters/msw/authHandlers';
import {
  mockGetNotesHandler,
  mockPatchNoteByIdHandler,
  mockPostNoteHandler,
  mockPutNoteByIdHandler,
} from '.storybook/parameters/msw/notesHandlers';
import NotesSelectionCtxProvider from '~/contexts/NotesSelectionCtxProvider';
import getNoteByIdHandler from '~/tests/mocks/apis/handlers/notes/getNoteById';
import getNotesHandler from '~/tests/mocks/apis/handlers/notes/getNotes';
import signOutHandler from '~/tests/mocks/apis/handlers/users/signOut';
import ActiveNotesPageContent from './_components/ActiveNotesPageContent';
import NotesPageLayoutContent from './_components/NotePageLayoutContent/NotePageLayoutContent';

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

    return (
      <NotesSelectionCtxProvider>
        <RouterProvider router={router} />
      </NotesSelectionCtxProvider>
    );
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        mockGetSessionHandler(),
        getNotesHandler,
        mockPostNoteHandler(),
        getNoteByIdHandler,
        mockPutNoteByIdHandler(),
        mockPatchNoteByIdHandler(),
        signOutHandler,
      ],
    },
  },
};

export const CloseWithEscKey: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('link', {
            name: /^Create$/,
          }),
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        expect(
          canvas.getByRole('textbox', {
            name: /^Title note$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Escape}');

        expect(
          canvas.queryByRole('textbox', {
            name: /^Title note$/,
          }),
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};

export const EmptyNotes: Story = {
  parameters: {
    msw: {
      handlers: [
        mockGetSessionHandler(),
        mockGetNotesHandler({ emptyNotes: true }),
        mockPostNoteHandler(),
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

export const NotesSelectionMobile: Story = {
  parameters: Default.parameters,
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const [idx, { noteContent, totalSelection }] of [
      {
        noteContent: /^Note Title 3$/,
        totalSelection: /^1 selected$/,
      },
      {
        noteContent: /^Note Title 2$/,
        totalSelection: /^2 selected$/,
      },
      {
        noteContent: /^Note Title 1$/,
        totalSelection: /^3 selected$/,
      },
    ].entries()) {
      await waitFor(async () => {
        await userEvent.pointer({
          keys: idx === 0 ? '[TouchA>]' : '[TouchA]',
          target: canvas.getByText(noteContent),
        });
      });

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();

        if (idx === 0) {
          await waitFor(async () => {
            await userEvent.pointer('[/TouchA]');
          });
        }
      });

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        });
      });

      await waitFor(async () => {
        await expect(
          screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).toBeVisible();

        await expect(
          screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).toBeVisible();
      });

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: screen.getByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        });
      });

      await waitFor(async () => {
        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });

      await waitFor(async () => {
        await expect(
          canvas.queryByRole('link', {
            name: /^Create$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const UnselectNoteSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const [idx, { noteContent, totalSelection }] of [
      {
        noteContent: /^Note Title 3$/,
        totalSelection: /^1 selected$/,
      },
      {
        noteContent: /^Note Title 2$/,
        totalSelection: /^2 selected$/,
      },
      {
        noteContent: /^Note Title 1$/,
        totalSelection: /^3 selected$/,
      },
    ].entries()) {
      await waitFor(async () => {
        await userEvent.pointer({
          keys: idx === 0 ? '[TouchA>]' : '[TouchA]',
          target: canvas.getByText(noteContent),
        });
      });

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });

      if (idx === 0) {
        await waitFor(async () => {
          await userEvent.pointer('[/TouchA]');
        });
      }
    }

    for (const { noteContent, totalSelection } of [
      {
        noteContent: /^Note Title 1$/,
        totalSelection: /^2 selected$/,
      },
      {
        noteContent: /^Note Title 2$/,
        totalSelection: /^1 selected$/,
      },
    ]) {
      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByText(noteContent),
        });
      });

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByText(/^Note Title 3$/),
      });
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).not.toBeInTheDocument();

      await expect(canvas.queryByText(/^\d selected$/)).not.toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', {
          name: /^Selection menu$/,
        }),
      ).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', {
        name: /^Show the sidebar$/,
      }),
    ).toBeVisible();

    await expect(canvas.getByPlaceholderText(/^Search$/)).toBeVisible();

    await expect(
      canvas.getByRole('button', {
        name: /^Open user menu$/,
      }),
    ).toBeVisible();

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', {
          name: /^Create$/,
        }),
      ).toBeVisible();
    });
  },
};

export const ClearAllNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, totalSelection } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            currentTotalSelection: /^1 selected$/,
          },
        ],
        totalSelection: /^1 selected$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            currentTotalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            currentTotalSelection: /^2 selected$/,
          },
        ],
        totalSelection: /^2 selected$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            currentTotalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            currentTotalSelection: /^2 selected$/,
          },
          {
            noteContent: /^Note Title 1$/,
            currentTotalSelection: /^3 selected$/,
          },
        ],
        totalSelection: /^3 selected$/,
      },
    ]) {
      for (const [
        idx,
        { noteContent, currentTotalSelection },
      ] of notesSelection.entries()) {
        await waitFor(async () => {
          await userEvent.pointer({
            keys: idx === 0 ? '[TouchA>]' : '[TouchA]',
            target: canvas.getByText(noteContent),
          });
        });

        await waitFor(async () => {
          await expect(canvas.getByText(currentTotalSelection)).toBeVisible();
        });

        if (idx === 0) {
          await waitFor(async () => {
            await userEvent.pointer('[/TouchA]');
          });
        }
      }

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        });
      });

      await waitFor(async () => {
        await expect(
          canvas.queryByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          canvas.queryByText(totalSelection),
        ).not.toBeInTheDocument();

        await expect(
          canvas.queryByRole('button', {
            name: /^Selection menu$/,
          }),
        ).not.toBeInTheDocument();
      });

      await expect(
        canvas.getByRole('button', {
          name: /^Show the sidebar$/,
        }),
      ).toBeVisible();

      await expect(canvas.getByPlaceholderText(/^Search$/)).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Open user menu$/,
        }),
      ).toBeVisible();

      await waitFor(async () => {
        await expect(
          canvas.getByRole('link', {
            name: /^Create$/,
          }),
        ).toBeVisible();
      });
    }
  },
};

export const ArchiveNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note archived$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes archived$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            totalSelection: /^2 selected$/,
          },
          {
            noteContent: /^Note Title 1$/,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes archived$/,
      },
    ]) {
      for (const [
        idx,
        { noteContent, totalSelection },
      ] of notesSelection.entries()) {
        await waitFor(async () => {
          await userEvent.pointer({
            keys: idx === 0 ? '[TouchA>]' : '[TouchA]',
            target: canvas.getByText(noteContent),
          });
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });

        if (idx === 0) {
          await waitFor(async () => {
            await userEvent.pointer('[/TouchA]');
          });
        }
      }

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        });
      });

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        });
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const TrashNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note trashed$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes trashed$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            totalSelection: /^2 selected$/,
          },
          {
            noteContent: /^Note Title 1$/,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes trashed$/,
      },
    ]) {
      for (const [
        idx,
        { noteContent, totalSelection },
      ] of notesSelection.entries()) {
        await waitFor(async () => {
          await userEvent.pointer({
            keys: idx === 0 ? '[TouchA>]' : '[TouchA]',
            target: canvas.getByText(noteContent),
          });
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });

        if (idx === 0) {
          await waitFor(async () => {
            await userEvent.pointer('[/TouchA]');
          });
        }
      }

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        });
      });

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        });
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const NotesSelectionDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 0,
        totalSelection: /^1 selected$/,
      },
      {
        noteCheckboxNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCheckboxNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[noteCheckboxNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await expect(
          screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).toBeVisible();

        await expect(
          screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).toBeVisible();
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });

      await waitFor(async () => {
        await expect(
          canvas.queryByRole('link', {
            name: /^Create$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const UnselectNoteSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 0,
        totalSelection: /^1 selected$/,
      },
      {
        noteCheckboxNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCheckboxNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[noteCheckboxNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 2,
        totalSelection: /^2 selected$/,
      },
      {
        noteCheckboxNth: 1,
        totalSelection: /^1 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[noteCheckboxNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).not.toBeInTheDocument();

      await expect(canvas.queryByText(/^\d selected$/)).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', {
        name: /^Minimize the sidebar$/,
      }),
    ).toBeVisible();

    await expect(canvas.getByText(/^Notes App$/)).toBeVisible();

    await expect(
      canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
    ).toBeVisible();

    await expect(
      canvas.getByRole('button', {
        name: /^Open user menu$/,
      }),
    ).toBeVisible();

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', {
          name: /^Create$/,
        }),
      ).toBeInTheDocument();
    });
  },
};

export const ClearAllNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 0,
        totalSelection: /^1 selected$/,
      },
      {
        noteCheckboxNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCheckboxNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[noteCheckboxNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    await userEvent.click(
      canvas.getByRole('button', {
        name: /^Clear all selection$/,
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).not.toBeInTheDocument();

      await expect(canvas.queryByText(/^\d selected$/)).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', {
        name: /^Minimize the sidebar$/,
      }),
    ).toBeVisible();

    await expect(canvas.getByText(/^Notes App$/)).toBeVisible();

    await expect(
      canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
    ).toBeVisible();

    await expect(
      canvas.getByRole('button', {
        name: /^Open user menu$/,
      }),
    ).toBeVisible();

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', {
          name: /^Create$/,
        }),
      ).toBeVisible();
    });
  },
};

export const ArchiveNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note archived$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 1,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes archived$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 1,
            totalSelection: /^2 selected$/,
          },
          {
            noteCheckboxNth: 2,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes archived$/,
      },
    ]) {
      for (const { noteCheckboxNth, totalSelection } of notesSelection) {
        await waitFor(async () => {
          await userEvent.click(
            canvas.getAllByRole('checkbox', {
              name: /^Select note$/,
            })[noteCheckboxNth],
          );
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });
      }

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        );
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const TrashNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note trashed$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 1,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes trashed$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 1,
            totalSelection: /^2 selected$/,
          },
          {
            noteCheckboxNth: 2,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes trashed$/,
      },
    ]) {
      for (const { noteCheckboxNth, totalSelection } of notesSelection) {
        await waitFor(async () => {
          await userEvent.click(
            canvas.getAllByRole('checkbox', {
              name: /^Select note$/,
            })[noteCheckboxNth],
          );
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });
      }

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        );
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const NotesSelectionByNoteCardDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();
    });

    await expect(canvas.getByText(/^1 selected$/)).toBeVisible();

    for (const { noteCardSelectionNth, totalSelection } of [
      {
        noteCardSelectionNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCardSelectionNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[noteCardSelectionNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await expect(
          screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).toBeVisible();

        await expect(
          screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).toBeVisible();
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });

      await waitFor(async () => {
        await expect(
          canvas.queryByRole('link', {
            name: /^Create$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const UnselectNoteSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();
    });

    await expect(canvas.getByText(/^1 selected$/)).toBeVisible();

    for (const { noteCardSelectionNth, totalSelection } of [
      {
        noteCardSelectionNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCardSelectionNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[noteCardSelectionNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    for (const { noteCardSelectionNth, totalSelection } of [
      {
        noteCardSelectionNth: 2,
        totalSelection: /^2 selected$/,
      },
      {
        noteCardSelectionNth: 1,
        totalSelection: /^1 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[noteCardSelectionNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    await userEvent.click(
      canvas.getAllByRole('button', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).not.toBeInTheDocument();

      await expect(canvas.queryByText(/^\d selected$/)).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', {
        name: /^Minimize the sidebar$/,
      }),
    ).toBeVisible();

    await expect(canvas.getByText(/^Notes App$/)).toBeVisible();

    await expect(
      canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
    ).toBeVisible();

    await expect(
      canvas.getByRole('button', {
        name: /^Open user menu$/,
      }),
    ).toBeVisible();

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', {
          name: /^Create$/,
        }),
      ).toBeVisible();
    });
  },
};

export const ClearAllNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();

      await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
    });

    for (const { noteCardSelectionNth, totalSelection } of [
      {
        noteCardSelectionNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCardSelectionNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[noteCardSelectionNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    await userEvent.click(
      canvas.getByRole('button', {
        name: /^Clear all selection$/,
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).not.toBeInTheDocument();

      await expect(canvas.queryByText(/^\d selected$/)).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', {
        name: /^Minimize the sidebar$/,
      }),
    ).toBeVisible();

    await expect(canvas.getByText(/^Notes App$/)).toBeVisible();

    await expect(
      canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
    ).toBeVisible();

    await expect(
      canvas.getByRole('button', {
        name: /^Open user menu$/,
      }),
    ).toBeVisible();

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', {
          name: /^Create$/,
        }),
      ).toBeVisible();
    });
  },
};

export const ArchiveNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCardSelectionNth: 1,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes archived$/,
      },
      {
        notesSelection: [
          {
            noteCardSelectionNth: 1,
            totalSelection: /^2 selected$/,
          },
          {
            noteCardSelectionNth: 2,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes archived$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[0],
      );

      await waitFor(async () => {
        await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
      });

      for (const { noteCardSelectionNth, totalSelection } of notesSelection) {
        await waitFor(async () => {
          await userEvent.click(
            canvas.getAllByRole('button', {
              name: /^Select note$/,
            })[noteCardSelectionNth],
          );
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });
      }

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        );
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const TrashNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCardSelectionNth: 1,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes trashed$/,
      },
      {
        notesSelection: [
          {
            noteCardSelectionNth: 1,
            totalSelection: /^2 selected$/,
          },
          {
            noteCardSelectionNth: 2,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes trashed$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[0],
      );

      await waitFor(async () => {
        await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
      });

      for (const { noteCardSelectionNth, totalSelection } of notesSelection) {
        await waitFor(async () => {
          await userEvent.click(
            canvas.getAllByRole('button', {
              name: /^Select note$/,
            })[noteCardSelectionNth],
          );
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });
      }

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        );
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const SearchedNotesSelectionMobile: Story = {
  parameters: Default.parameters,
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const [idx, { noteContent, totalSelection }] of [
      {
        noteContent: /^Note Title 3$/,
        totalSelection: /^1 selected$/,
      },
      {
        noteContent: /^Note Title 2$/,
        totalSelection: /^2 selected$/,
      },
      {
        noteContent: /^Note Title 1$/,
        totalSelection: /^3 selected$/,
      },
    ].entries()) {
      await waitFor(async () => {
        await userEvent.pointer({
          keys: idx === 0 ? '[TouchA>]' : '[TouchA]',
          target: canvas.getByText(noteContent),
        });
      });

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();

        if (idx === 0) {
          await waitFor(async () => {
            await userEvent.pointer('[/TouchA]');
          });
        }
      });

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        });
      });

      await waitFor(async () => {
        await expect(
          screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).toBeVisible();

        await expect(
          screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).toBeVisible();
      });

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: screen.getByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        });
      });

      await waitFor(async () => {
        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const SearchedUnselectNoteSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const [idx, { noteContent, totalSelection }] of [
      {
        noteContent: /^Note Title 3$/,
        totalSelection: /^1 selected$/,
      },
      {
        noteContent: /^Note Title 2$/,
        totalSelection: /^2 selected$/,
      },
      {
        noteContent: /^Note Title 1$/,
        totalSelection: /^3 selected$/,
      },
    ].entries()) {
      await waitFor(async () => {
        await userEvent.pointer({
          keys: idx === 0 ? '[TouchA>]' : '[TouchA]',
          target: canvas.getByText(noteContent),
        });
      });

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });

      if (idx === 0) {
        await waitFor(async () => {
          await userEvent.pointer('[/TouchA]');
        });
      }
    }

    for (const { noteContent, totalSelection } of [
      {
        noteContent: /^Note Title 1$/,
        totalSelection: /^2 selected$/,
      },
      {
        noteContent: /^Note Title 2$/,
        totalSelection: /^1 selected$/,
      },
    ]) {
      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByText(noteContent),
        });
      });

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByText(/^Note Title 3$/),
      });
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).not.toBeInTheDocument();

      await expect(canvas.queryByText(/^\d selected$/)).not.toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', {
          name: /^Selection menu$/,
        }),
      ).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', {
        name: /^Show the sidebar$/,
      }),
    ).toBeVisible();

    await expect(canvas.getByPlaceholderText(/^Search$/)).toBeVisible();

    await expect(
      canvas.getByRole('button', {
        name: /^Open user menu$/,
      }),
    ).toBeVisible();
  },
};

export const SearchedClearAllNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, totalSelection } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            currentTotalSelection: /^1 selected$/,
          },
        ],
        totalSelection: /^1 selected$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            currentTotalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            currentTotalSelection: /^2 selected$/,
          },
        ],
        totalSelection: /^2 selected$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            currentTotalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            currentTotalSelection: /^2 selected$/,
          },
          {
            noteContent: /^Note Title 1$/,
            currentTotalSelection: /^3 selected$/,
          },
        ],
        totalSelection: /^3 selected$/,
      },
    ]) {
      for (const [
        idx,
        { noteContent, currentTotalSelection },
      ] of notesSelection.entries()) {
        await waitFor(async () => {
          await userEvent.pointer({
            keys: idx === 0 ? '[TouchA>]' : '[TouchA]',
            target: canvas.getByText(noteContent),
          });
        });

        await waitFor(async () => {
          await expect(canvas.getByText(currentTotalSelection)).toBeVisible();
        });

        if (idx === 0) {
          await waitFor(async () => {
            await userEvent.pointer('[/TouchA]');
          });
        }
      }

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        });
      });

      await waitFor(async () => {
        await expect(
          canvas.queryByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          canvas.queryByText(totalSelection),
        ).not.toBeInTheDocument();

        await expect(
          canvas.queryByRole('button', {
            name: /^Selection menu$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const SearchedArchiveNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note archived$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes archived$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            totalSelection: /^2 selected$/,
          },
          {
            noteContent: /^Note Title 1$/,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes archived$/,
      },
    ]) {
      for (const [
        idx,
        { noteContent, totalSelection },
      ] of notesSelection.entries()) {
        await waitFor(async () => {
          await userEvent.pointer({
            keys: idx === 0 ? '[TouchA>]' : '[TouchA]',
            target: canvas.getByText(noteContent),
          });
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });

        if (idx === 0) {
          await waitFor(async () => {
            await userEvent.pointer('[/TouchA]');
          });
        }
      }

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        });
      });

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        });
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const SearchedTrashNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note trashed$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes trashed$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            totalSelection: /^2 selected$/,
          },
          {
            noteContent: /^Note Title 1$/,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes trashed$/,
      },
    ]) {
      for (const [
        idx,
        { noteContent, totalSelection },
      ] of notesSelection.entries()) {
        await waitFor(async () => {
          await userEvent.pointer({
            keys: idx === 0 ? '[TouchA>]' : '[TouchA]',
            target: canvas.getByText(noteContent),
          });
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });

        if (idx === 0) {
          await waitFor(async () => {
            await userEvent.pointer('[/TouchA]');
          });
        }
      }

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        });
      });

      await waitFor(async () => {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        });
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const SearchedNotesSelectionDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
          'note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 0,
        totalSelection: /^1 selected$/,
      },
      {
        noteCheckboxNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCheckboxNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[noteCheckboxNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await expect(
          screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).toBeVisible();

        await expect(
          screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).toBeVisible();
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const SearchedUnselectNoteSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
          'note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 0,
        totalSelection: /^1 selected$/,
      },
      {
        noteCheckboxNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCheckboxNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[noteCheckboxNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 2,
        totalSelection: /^2 selected$/,
      },
      {
        noteCheckboxNth: 1,
        totalSelection: /^1 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[noteCheckboxNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).not.toBeInTheDocument();

      await expect(canvas.queryByText(/^\d selected$/)).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', {
        name: /^Minimize the sidebar$/,
      }),
    ).toBeVisible();

    await expect(canvas.getByText(/^Notes App$/)).toBeVisible();

    await expect(
      canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
    ).toBeVisible();

    await expect(
      canvas.getByRole('button', {
        name: /^Open user menu$/,
      }),
    ).toBeVisible();
  },
};

export const SearchedClearAllNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
          'note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 0,
        totalSelection: /^1 selected$/,
      },
      {
        noteCheckboxNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCheckboxNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[noteCheckboxNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    await userEvent.click(
      canvas.getByRole('button', {
        name: /^Clear all selection$/,
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).not.toBeInTheDocument();

      await expect(canvas.queryByText(/^\d selected$/)).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', {
        name: /^Minimize the sidebar$/,
      }),
    ).toBeVisible();

    await expect(canvas.getByText(/^Notes App$/)).toBeVisible();

    await expect(
      canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
    ).toBeVisible();

    await expect(
      canvas.getByRole('button', {
        name: /^Open user menu$/,
      }),
    ).toBeVisible();
  },
};

export const SearchedArchiveNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
          'note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note archived$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 1,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes archived$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 1,
            totalSelection: /^2 selected$/,
          },
          {
            noteCheckboxNth: 2,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes archived$/,
      },
    ]) {
      for (const { noteCheckboxNth, totalSelection } of notesSelection) {
        await waitFor(async () => {
          await userEvent.click(
            canvas.getAllByRole('checkbox', {
              name: /^Select note$/,
            })[noteCheckboxNth],
          );
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });
      }

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        );
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const SearchedTrashNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
          'note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note trashed$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 1,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes trashed$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 0,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 1,
            totalSelection: /^2 selected$/,
          },
          {
            noteCheckboxNth: 2,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes trashed$/,
      },
    ]) {
      for (const { noteCheckboxNth, totalSelection } of notesSelection) {
        await waitFor(async () => {
          await userEvent.click(
            canvas.getAllByRole('checkbox', {
              name: /^Select note$/,
            })[noteCheckboxNth],
          );
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });
      }

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        );
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const SearchedNotesSelectionByNoteCardDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
          'note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();
    });

    await expect(canvas.getByText(/^1 selected$/)).toBeVisible();

    for (const { noteCardSelectionNth, totalSelection } of [
      {
        noteCardSelectionNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCardSelectionNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[noteCardSelectionNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await expect(
          screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).toBeVisible();

        await expect(
          screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).toBeVisible();
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const SearchedUnselectNoteSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
          'note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();
    });

    await expect(canvas.getByText(/^1 selected$/)).toBeVisible();

    for (const { noteCardSelectionNth, totalSelection } of [
      {
        noteCardSelectionNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCardSelectionNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[noteCardSelectionNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    for (const { noteCardSelectionNth, totalSelection } of [
      {
        noteCardSelectionNth: 2,
        totalSelection: /^2 selected$/,
      },
      {
        noteCardSelectionNth: 1,
        totalSelection: /^1 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[noteCardSelectionNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    await userEvent.click(
      canvas.getAllByRole('button', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).not.toBeInTheDocument();

      await expect(canvas.queryByText(/^\d selected$/)).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', {
        name: /^Minimize the sidebar$/,
      }),
    ).toBeVisible();

    await expect(canvas.getByText(/^Notes App$/)).toBeVisible();

    await expect(
      canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
    ).toBeVisible();

    await expect(
      canvas.getByRole('button', {
        name: /^Open user menu$/,
      }),
    ).toBeVisible();
  },
};

export const SearchedClearAllNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
          'note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();

      await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
    });

    for (const { noteCardSelectionNth, totalSelection } of [
      {
        noteCardSelectionNth: 1,
        totalSelection: /^2 selected$/,
      },
      {
        noteCardSelectionNth: 2,
        totalSelection: /^3 selected$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[noteCardSelectionNth],
      );

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', {
            name: /^Clear all selection$/,
          }),
        ).toBeInTheDocument();

        await expect(canvas.getByText(totalSelection)).toBeVisible();
      });
    }

    await userEvent.click(
      canvas.getByRole('button', {
        name: /^Clear all selection$/,
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).not.toBeInTheDocument();

      await expect(canvas.queryByText(/^\d selected$/)).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', {
        name: /^Minimize the sidebar$/,
      }),
    ).toBeVisible();

    await expect(canvas.getByText(/^Notes App$/)).toBeVisible();

    await expect(
      canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
    ).toBeVisible();

    await expect(
      canvas.getByRole('button', {
        name: /^Open user menu$/,
      }),
    ).toBeVisible();
  },
};

export const SearchedArchiveNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
          'note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCardSelectionNth: 1,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes archived$/,
      },
      {
        notesSelection: [
          {
            noteCardSelectionNth: 1,
            totalSelection: /^2 selected$/,
          },
          {
            noteCardSelectionNth: 2,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes archived$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[0],
      );

      await waitFor(async () => {
        await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
      });

      for (const { noteCardSelectionNth, totalSelection } of notesSelection) {
        await waitFor(async () => {
          await userEvent.click(
            canvas.getAllByRole('button', {
              name: /^Select note$/,
            })[noteCardSelectionNth],
          );
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });
      }

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('menuitem', {
            name: /^Archive$/,
          }),
        );
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const SearchedTrashNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title 3$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText(/^Search \[ \/ \]$/),
          'note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCardSelectionNth: 1,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes trashed$/,
      },
      {
        notesSelection: [
          {
            noteCardSelectionNth: 1,
            totalSelection: /^2 selected$/,
          },
          {
            noteCardSelectionNth: 2,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes trashed$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[0],
      );

      await waitFor(async () => {
        await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
      });

      for (const { noteCardSelectionNth, totalSelection } of notesSelection) {
        await waitFor(async () => {
          await userEvent.click(
            canvas.getAllByRole('button', {
              name: /^Select note$/,
            })[noteCardSelectionNth],
          );
        });

        await waitFor(async () => {
          await expect(canvas.getByText(totalSelection)).toBeVisible();
        });
      }

      await waitFor(async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: /^Selection menu$/,
          }),
        );
      });

      await waitFor(async () => {
        await userEvent.click(
          screen.getByRole('menuitem', {
            name: /^Trash$/,
          }),
        );
      });

      await waitFor(
        async () => {
          await expect(canvas.getByText(toastMessage)).toBeVisible();
        },
        { timeout: 3000 },
      );

      await waitFor(async () => {
        await expect(
          screen.queryByRole('button', {
            name: /^Close selection actions menu$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Archive$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Trash$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};
