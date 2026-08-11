import type { Meta, StoryObj } from '@storybook/react-vite';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { expect, screen, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import SelectionNotesCtxProvider from '~/contexts/SelectionNotesCtxProvider';
import getNoteByIdHandler from '~/tests/mocks/apis/handlers/notes/getNoteByIdHandler';
import getNotesHandler from '~/tests/mocks/apis/handlers/notes/getNotesHandler';
import signOutHandler from '~/tests/mocks/apis/handlers/users/signOutHandler';
import { getSessionHandler } from '../_components/NotePageLayoutContent/NotePageLayoutContent.stories';
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const [idx, { noteContent, totalSelection }] of [
      {
        noteContent: /^Note Title* 5$/,
        totalSelection: /^1 selected$/,
      },
      {
        noteContent: /^Note Title 4$/,
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
            name: /^Unarchive$/,
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
            name: /^Unarchive$/,
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

export const UnselectNoteSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const [idx, { noteContent, totalSelection }] of [
      {
        noteContent: /^Note Title* 5$/,
        totalSelection: /^1 selected$/,
      },
      {
        noteContent: /^Note Title 4$/,
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
        target: canvas.getByText(/^Note Title 4$/),
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
        target: canvas.getByText(/^Note Title* 5$/),
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

export const ClearAllNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, totalSelection } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            currentTotalSelection: /^1 selected$/,
          },
        ],
        totalSelection: /^1 selected$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            currentTotalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 4$/,
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
    }
  },
};

export const UnarchiveNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note unarchive$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes unarchive$/,
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
            name: /^Unarchive$/,
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
            name: /^Unarchive$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note trashed$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes trashed$/,
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
            name: /^Unarchive$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
            name: /^Unarchive$/,
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
            name: /^Unarchive$/,
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

export const UnselectNoteSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
  },
};

export const ClearAllNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
  },
};

export const UnarchiveNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        toastMessage: /^Note unarchive$/,
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
        toastMessage: /^2 notes unarchive$/,
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
            name: /^Unarchive$/,
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
            name: /^Unarchive$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
            name: /^Unarchive$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
          name: /^Unarchive$/,
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
          name: /^Unarchive$/,
        }),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Trash$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
  },
};

export const ClearAllNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
  },
};

export const UnarchiveNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
          name: /^Unarchive$/,
        }),
      );
    });

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^2 notes unarchive$/)).toBeVisible();
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
          name: /^Unarchive$/,
        }),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Trash$/,
        }),
      ).not.toBeInTheDocument();
    });
  },
};

export const TrashNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
          name: /^Trash$/,
        }),
      );
    });

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^2 notes trashed$/)).toBeVisible();
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
          name: /^Unarchive$/,
        }),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Trash$/,
        }),
      ).not.toBeInTheDocument();
    });
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const [idx, { noteContent, totalSelection }] of [
      {
        noteContent: /^Note Title* 5$/,
        totalSelection: /^1 selected$/,
      },
      {
        noteContent: /^Note Title 4$/,
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
            name: /^Unarchive$/,
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
            name: /^Unarchive$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const [idx, { noteContent, totalSelection }] of [
      {
        noteContent: /^Note Title* 5$/,
        totalSelection: /^1 selected$/,
      },
      {
        noteContent: /^Note Title 4$/,
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
        target: canvas.getByText(/^Note Title 4$/),
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
        target: canvas.getByText(/^Note Title* 5$/),
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, totalSelection } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            currentTotalSelection: /^1 selected$/,
          },
        ],
        totalSelection: /^1 selected$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            currentTotalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 4$/,
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
    }
  },
};

export const SearchedUnarchiveNotesSelectionMobile: Story = {
  ...NotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note unarchive$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes unarchive$/,
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
            name: /^Unarchive$/,
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
            name: /^Unarchive$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note trashed$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes trashed$/,
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
            name: /^Unarchive$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 3,
        totalSelection: /^1 selected$/,
      },
      {
        noteCheckboxNth: 4,
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
            name: /^Unarchive$/,
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
            name: /^Unarchive$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 3,
        totalSelection: /^1 selected$/,
      },
      {
        noteCheckboxNth: 4,
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
      })[4],
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
      })[3],
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 3,
        totalSelection: /^1 selected$/,
      },
      {
        noteCheckboxNth: 4,
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
  },
};

export const SearchedUnarchiveNotesSelectionDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCheckboxNth: 3,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note unarchive$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 3,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 4,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes unarchive$/,
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
            name: /^Unarchive$/,
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
            name: /^Unarchive$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCheckboxNth: 3,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note trashed$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 3,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 4,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes trashed$/,
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
            name: /^Unarchive$/,
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[3],
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
      })[4],
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
          name: /^Unarchive$/,
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
          name: /^Unarchive$/,
        }),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Trash$/,
        }),
      ).not.toBeInTheDocument();
    });
  },
};

export const SearchedUnselectNoteSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[3],
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
      })[4],
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
      })[4],
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
      })[3],
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
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[3],
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
      })[4],
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
  },
};

export const SearchedUnarchiveNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[3],
    );

    await waitFor(async () => {
      await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
    });

    await waitFor(async () => {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[4],
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
          name: /^Unarchive$/,
        }),
      );
    });

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^2 notes unarchive$/)).toBeVisible();
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
          name: /^Unarchive$/,
        }),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Trash$/,
        }),
      ).not.toBeInTheDocument();
    });
  },
};

export const SearchedTrashNotesSelectionByNoteCardDesktop: Story = {
  ...NotesSelectionDesktop,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Note Title* 5$/)).toBeVisible();
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getAllByRole('checkbox', {
        name: /^Select note$/,
      })[3],
    );

    await waitFor(async () => {
      await expect(canvas.getByText(/^1 selected$/)).toBeVisible();
    });

    await waitFor(async () => {
      await userEvent.click(
        canvas.getAllByRole('button', {
          name: /^Select note$/,
        })[4],
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
          name: /^Trash$/,
        }),
      );
    });

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^2 notes trashed$/)).toBeVisible();
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
          name: /^Unarchive$/,
        }),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Trash$/,
        }),
      ).not.toBeInTheDocument();
    });
  },
};
