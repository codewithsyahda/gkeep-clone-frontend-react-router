import type { Meta, StoryObj } from '@storybook/react-vite';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { expect, screen, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import { getSessionHandler } from '.storybook/parameters/msw/authHandlers';
import {
  deleteNoteByIdHandler,
  deleteNotesHandler,
  getEmptyNotesHandler,
  patchNoteByIdHandler,
  putNoteByIdHandler,
} from '.storybook/parameters/msw/notesHandlers';
import SelectionNotesCtxProvider from '~/contexts/SelectionNotesCtxProvider';
import getNoteByIdHandler from '~/tests/mocks/apis/handlers/notes/getNoteByIdHandler';
import getNotesHandler from '~/tests/mocks/apis/handlers/notes/getNotesHandler';
import signOutHandler from '~/tests/mocks/apis/handlers/users/signOutHandler';
import NotesPageLayoutContent from '../_components/NotePageLayoutContent/NotePageLayoutContent';
import * as ActiveNotePageStories from '../ActiveNotePage.stories';
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

    return (
      <SelectionNotesCtxProvider>
        <RouterProvider router={router} />
      </SelectionNotesCtxProvider>
    );
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
        deleteNoteByIdHandler,
        deleteNotesHandler,
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

export const NotesSelectionMobile: Story = {
  parameters: Default.parameters,
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const [idx, { noteContent, totalSelection }] of [
      {
        noteContent: /^Untitled$/,
        totalSelection: /^1 selected$/,
      },
      {
        noteContent: /^Note Title 6$/,
        totalSelection: /^2 selected$/,
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
            name: /^Restore$/,
          }),
        ).toBeVisible();

        await expect(
          screen.getByRole('menuitem', {
            name: /^Delete$/,
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
            name: /^Restore$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Delete$/,
          }),
        ).not.toBeInTheDocument();
      });

      await waitFor(async () => {
        await expect(
          canvas.queryByRole('button', {
            name: /^Empty all$/,
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
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const [idx, { noteContent, totalSelection }] of [
      {
        noteContent: /^Untitled$/,
        totalSelection: /^1 selected$/,
      },
      {
        noteContent: /^Note Title 6$/,
        totalSelection: /^2 selected$/,
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

    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByText(/^Note Title 6$/),
      });
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();

      await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
    });

    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByText(/^Untitled$/),
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
        canvas.queryByRole('button', {
          name: /^Empty all$/,
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
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, totalSelection } of [
      {
        notesSelection: [
          {
            noteContent: /^Untitled$/,
            currentTotalSelection: /^1 selected$/,
          },
        ],
        totalSelection: /^1 selected$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Untitled$/,
            currentTotalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 6$/,
            currentTotalSelection: /^2 selected$/,
          },
        ],
        totalSelection: /^2 selected$/,
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
          canvas.getByRole('button', {
            name: /^Empty all$/,
          }),
        ).toBeVisible();
      });
    }
  },
};

export const RestoreNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Untitled$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note restored$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Untitled$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 6$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes restored$/,
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
            name: /^Restore$/,
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
            name: /^Restore$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Delete$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const DeleteNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Untitled$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note deleted$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Untitled$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 6$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes deleted$/,
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
            name: /^Delete$/,
          }),
        });
      });

      await waitFor(async () => {
        await expect(screen.getByText(/^Are you sure?/)).toBeVisible();

        await userEvent.pointer({
          keys: '[TouchA]',
          target: screen.getByRole('button', {
            name: /^Yes$/,
          }),
        });
      });

      await waitFor(
        async () => {
          await expect(
            screen.queryByText(/^Are you sure?/),
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

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
            name: /^Restore$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Delete$/,
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
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
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
            name: /^Restore$/,
          }),
        ).toBeVisible();

        await expect(
          screen.getByRole('menuitem', {
            name: /^Delete$/,
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
            name: /^Restore$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Delete$/,
          }),
        ).not.toBeInTheDocument();
      });

      await waitFor(async () => {
        await expect(
          canvas.queryByRole('button', {
            name: /^Empty all$/,
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
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
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
      })[1],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();

      await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
    });

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
        canvas.getByRole('button', {
          name: /^Empty all$/,
        }),
      ).toBeVisible();
    });
  },
};

export const ClearAllNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
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
        canvas.getByRole('button', {
          name: /^Empty all$/,
        }),
      ).toBeVisible();
    });
  },
};

export const RestoreNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
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
        toastMessage: /^Note restored$/,
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
        toastMessage: /^2 notes restored$/,
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
            name: /^Restore$/,
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
            name: /^Restore$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Delete$/,
          }),
        ).not.toBeInTheDocument();
      });
    }
  },
};

export const DeleteNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
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
        toastMessage: /^Note deleted$/,
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
        toastMessage: /^2 notes deleted$/,
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
            name: /^Delete$/,
          }),
        );
      });

      await waitFor(async () => {
        await expect(screen.getByText(/^Are you sure?/)).toBeVisible();

        await userEvent.click(
          screen.getByRole('button', {
            name: /^Yes$/,
          }),
        );
      });

      await waitFor(
        async () => {
          await expect(
            screen.queryByText(/^Are you sure?/),
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

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
            name: /^Restore$/,
          }),
        ).not.toBeInTheDocument();

        await expect(
          screen.queryByRole('menuitem', {
            name: /^Delete$/,
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
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
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

    await userEvent.click(
      canvas.getAllByRole('button', {
        name: /^Select note$/,
      })[1],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();

      await expect(canvas.getByText(/^2 selected$/)).toBeVisible();
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
          name: /^Restore$/,
        }),
      ).toBeVisible();

      await expect(
        screen.getByRole('menuitem', {
          name: /^Delete$/,
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
          name: /^Restore$/,
        }),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Delete$/,
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: /^Empty all$/,
        }),
      ).not.toBeInTheDocument();
    });
  },
};

export const UnselectNoteSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
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

    await userEvent.click(
      canvas.getAllByRole('button', {
        name: /^Select note$/,
      })[1],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();

      await expect(canvas.getByText(/^2 selected$/)).toBeVisible();
    });

    await userEvent.click(
      canvas.getAllByRole('button', {
        name: /^Select note$/,
      })[1],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();

      await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
    });

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
        canvas.getByRole('button', {
          name: /^Empty all$/,
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
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
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

    await userEvent.click(
      canvas.getAllByRole('button', {
        name: /^Select note$/,
      })[1],
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeInTheDocument();

      await expect(canvas.getByText(/^2 selected$/)).toBeVisible();
    });

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
        canvas.getByRole('button', {
          name: /^Empty all$/,
        }),
      ).toBeVisible();
    });
  },
};

export const RestoreNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
    });

    await waitFor(async () => {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[1],
      );
    });

    await waitFor(async () => {
      await expect(canvas.getByText(/^2 selected$/)).toBeVisible();
    });

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
          name: /^Restore$/,
        }),
      );
    });

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^2 notes restored$/)).toBeVisible();
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
          name: /^Restore$/,
        }),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Delete$/,
        }),
      ).not.toBeInTheDocument();
    });
  },
};

export const DeleteNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Untitled$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[0],
    );

    await waitFor(async () => {
      await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
    });

    await waitFor(async () => {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[1],
      );
    });

    await waitFor(async () => {
      await expect(canvas.getByText(/^2 selected$/)).toBeVisible();
    });

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
          name: /^Delete$/,
        }),
      );
    });

    await waitFor(async () => {
      await expect(screen.getByText(/^Are you sure?/)).toBeVisible();

      await userEvent.click(
        screen.getByRole('button', {
          name: /^Yes$/,
        }),
      );
    });

    await waitFor(
      async () => {
        await expect(
          screen.queryByText(/^Are you sure?/),
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^2 notes deleted$/)).toBeVisible();
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
          name: /^Restore$/,
        }),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Delete$/,
        }),
      ).not.toBeInTheDocument();
    });
  },
};
