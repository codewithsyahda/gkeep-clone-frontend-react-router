import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { Toaster } from 'sonner';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, screen, waitFor } from 'storybook/test';

import notesSelectionDecorator from '.storybook/decorators/notesSelection';
import reactQueryDecorator from '.storybook/decorators/reactQuery';
import envConfig from '~/configs/envs';
import getNoteByIdHandler from '~/tests/mocks/apis/handlers/notes/getNoteByIdHandler';
import getNotesHandler from '~/tests/mocks/apis/handlers/notes/getNotesHandler';
import NotePageLayoutContent from './NotePageLayoutContent';

const meta = {
  title: 'Composites/NotePageLayoutContent',
  component: NotePageLayoutContent,
  parameters: {
    layout: 'fullscreen',
    reactRouter: reactRouterParameters({
      routing: {
        path: '/*',
      },
    }),
  },
  decorators: [reactQueryDecorator, withRouter, notesSelectionDecorator],
  render: function Render() {
    return (
      <>
        <NotePageLayoutContent />
        <Toaster duration={Infinity} />
      </>
    );
  },
  excludeStories: ['getSessionHandler', 'signOutHandler'],
} satisfies Meta<typeof NotePageLayoutContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const getSessionHandler = http.get(
  `${envConfig.api.baseUrl}/auth/get-session`,
  async () => {
    await delay('real');

    return HttpResponse.json(
      {
        session: {
          id: 'session-uuid',
          token: 'session-token',
          userId: 'user-uuid',
          expiresAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0...',
        },
        user: {
          id: 'id-user-1',
          name: 'Foo Doe',
          email: 'foo@doe.com',
          emailVerified: false,
          image: null,
          createdAt: new Date(2026, 0, 1),
          updatedAt: new Date(2026, 0, 1),
        },
      },
      {
        headers: {
          'content-type': 'application/json',
          'set-cookie': 'auth.user_id=id-user-1',
        },
      },
    );
  },
);

const getEmptyNotesHandler = http.get(
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

const postNoteHandler = http.post(
  `${envConfig.api.baseUrl}/notes`,
  async () => {
    await delay('real');
    return HttpResponse.json(null, { status: 201 });
  },
);

const putNoteByIdHandler = http.put<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
  await delay('real');
  return HttpResponse.json(null);
});

const patchNoteByIdHandler = http.patch<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
  await delay('real');
  return HttpResponse.json(null);
});

export const signOutHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-out`,
  async () => {
    await delay('real');
    return HttpResponse.json({ success: true });
  },
);

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
  play: async ({ canvas }) => {
    await waitFor(
      async () => {
        await expect(
          canvas.getByRole('button', {
            name: 'Minimize the sidebar',
          }),
        ).toBeVisible();

        await expect(canvas.getByText('Notes App')).toBeVisible();
        await expect(canvas.getByPlaceholderText('Search [ / ]')).toBeVisible();

        for (const link of ['Active', 'Archive', 'Trash']) {
          await expect(
            canvas.getByRole('link', {
              name: link,
            }),
          ).toBeVisible();
        }
      },
      { timeout: 3000 },
    );
  },
};

export const DefaultMobile: Story = {
  parameters: Default.parameters,
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas }) => {
    await waitFor(
      async () => {
        await expect(
          canvas.getByRole('button', {
            name: 'Show the sidebar',
          }),
        ).toBeVisible();

        await expect(canvas.getByText('Notes App')).not.toBeVisible();
        await expect(canvas.getByPlaceholderText('Search')).toBeVisible();

        for (const link of ['Active', 'Archive', 'Trash']) {
          await expect(
            canvas.getByRole('link', {
              name: link,
            }),
          ).toBeInTheDocument();
        }
      },
      { timeout: 3000 },
    );
  },
};

export const ActiveNotesSelectionBar: Story = {
  parameters: {
    msw: {
      handlers: [
        getSessionHandler,
        getEmptyNotesHandler,
        patchNoteByIdHandler,
        signOutHandler,
      ],
    },
    notesSelection: {
      mockedCtxValue: {
        notes: [
          {
            noteId: 'id-note-1',
            noteStatus: 'active',
            isTrashed: false,
          },
          {
            noteId: 'id-note-2',
            noteStatus: 'active',
            isTrashed: false,
          },
          {
            noteId: 'id-note-3',
            noteStatus: 'active',
            isTrashed: false,
          },
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeVisible();

      await expect(canvas.getByText(/^3 selected$/)).toBeVisible();
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

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Unarchive$/,
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
  },
};

export const ActiveNotesSelectionBarMobile: Story = {
  parameters: { ...ActiveNotesSelectionBar.parameters },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeVisible();

      await expect(canvas.getByText(/^3 selected$/)).toBeVisible();
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

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Unarchive$/,
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
  },
};

export const ArchivedNotesSelectionBar: Story = {
  parameters: {
    msw: {
      handlers: [
        getSessionHandler,
        getEmptyNotesHandler,
        patchNoteByIdHandler,
        signOutHandler,
      ],
    },
    notesSelection: {
      mockedCtxValue: {
        notes: [
          {
            noteId: 'id-note-1',
            noteStatus: 'archived',
            isTrashed: false,
          },
          {
            noteId: 'id-note-2',
            noteStatus: 'archived',
            isTrashed: false,
          },
          {
            noteId: 'id-note-3',
            noteStatus: 'archived',
            isTrashed: false,
          },
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeVisible();

      await expect(canvas.getByText(/^3 selected$/)).toBeVisible();
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

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Archive$/,
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

export const ArchivedNotesSelectionBarMobile: Story = {
  parameters: { ...ArchivedNotesSelectionBar.parameters },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeVisible();

      await expect(canvas.getByText(/^3 selected$/)).toBeVisible();
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

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Archive$/,
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
  },
};

export const NonTrashedNotesSelectionBar: Story = {
  parameters: {
    msw: {
      handlers: [
        getSessionHandler,
        getEmptyNotesHandler,
        patchNoteByIdHandler,
        signOutHandler,
      ],
    },
    notesSelection: {
      mockedCtxValue: {
        notes: [
          {
            noteId: 'id-note-1',
            noteStatus: 'active',
            isTrashed: false,
          },
          {
            noteId: 'id-note-2',
            noteStatus: 'archived',
            isTrashed: false,
          },
          {
            noteId: 'id-note-3',
            noteStatus: 'archived',
            isTrashed: false,
          },
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeVisible();

      await expect(canvas.getByText(/^3 selected$/)).toBeVisible();
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
          name: /^Unarchive$/,
        }),
      ).toBeVisible();

      await expect(
        screen.getByRole('menuitem', {
          name: /^Trash$/,
        }),
      ).toBeVisible();

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

export const NonTrashedNotesSelectionBarMobile: Story = {
  parameters: { ...NonTrashedNotesSelectionBar.parameters },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeVisible();

      await expect(canvas.getByText(/^3 selected$/)).toBeVisible();
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
          name: /^Unarchive$/,
        }),
      ).toBeVisible();

      await expect(
        screen.getByRole('menuitem', {
          name: /^Trash$/,
        }),
      ).toBeVisible();

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

export const TrashedNotesSelectionBar: Story = {
  parameters: {
    msw: ActiveNotesSelectionBar.parameters?.msw,
    notesSelection: {
      mockedCtxValue: {
        notes: [
          {
            noteId: 'id-note-1',
            noteStatus: 'active',
            isTrashed: true,
          },
          {
            noteId: 'id-note-2',
            noteStatus: 'archived',
            isTrashed: true,
          },
          {
            noteId: 'id-note-3',
            noteStatus: 'archived',
            isTrashed: true,
          },
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeVisible();

      await expect(canvas.getByText(/^3 selected$/)).toBeVisible();
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

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Archive$/,
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
  },
};

export const TrashedNotesSelectionBarMobile: Story = {
  parameters: { ...TrashedNotesSelectionBar.parameters },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Clear all selection$/,
        }),
      ).toBeVisible();

      await expect(canvas.getByText(/^3 selected$/)).toBeVisible();
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

      await expect(
        screen.queryByRole('menuitem', {
          name: /^Archive$/,
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
  },
};

export const OpenedUserMenu: Story = {
  parameters: {
    ...Default.parameters,
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Open user menu',
          }),
        );

        await expect(canvas.getByText('foo@doe.com')).toBeVisible();
        await expect(canvas.getByText('Hi, Foo!')).toBeVisible();

        await expect(
          canvas.getByRole('button', {
            name: 'Sign out',
          }),
        ).toBeVisible();
      },
      { timeout: 3000 },
    );
  },
};

export const ClosedUserMenu: Story = {
  parameters: {
    ...Default.parameters,
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Open user menu',
          }),
        );

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Hide user menu',
          }),
        );
      },
      { timeout: 3000 },
    );
  },
};

export const ShowSidebarMenuLinksMobile: Story = {
  parameters: { ...Default.parameters },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Show the sidebar',
          }),
        );
      },
      { timeout: 3000 },
    );
  },
};

export const ReHideSidebarMenuLinksMobile: Story = {
  parameters: { ...Default.parameters },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Show the sidebar',
          }),
        );
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Hide the sidebar',
      }),
    );
  },
};

export const MinimizeSidebarMenuLinks: Story = {
  parameters: { ...Default.parameters },
  afterEach: () => {
    if (window) {
      window.localStorage.removeItem('showSidebar');
    }
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Minimize the sidebar',
          }),
        );
      },
      { timeout: 3000 },
    );
  },
};

export const ReExpandedSidebarMenuLinks: Story = {
  parameters: { ...Default.parameters },
  afterEach: () => {
    if (window) {
      window.localStorage.removeItem('showSidebar');
    }
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Minimize the sidebar',
          }),
        );
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Expand the sidebar',
      }),
    );
  },
};

export const NoMatchedSearchNotesResult: Story = {
  parameters: { ...Default.parameters },
  beforeEach: () => {
    if (window) {
      window.localStorage.removeItem('showSidebar');
    }
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText('Search [ / ]'),
          'Unknown note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText('No matching results.')).toBeVisible();
      },
      { timeout: 3000 },
    );
  },
};

export const MatchedSearchActiveNotesResult: Story = {
  parameters: { ...Default.parameters },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText('Search [ / ]'),
          'Note 3',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(
          canvas.queryByText('No matching results.'),
        ).not.toBeInTheDocument();

        await expect(canvas.getByText('Active Notes')).toBeVisible();

        await expect(
          canvas.getByRole('heading', {
            name: 'Note Title 3',
          }),
        ).toBeInTheDocument();

        for (const [tagName, eachContent] of [
          ['h1', 'Note 3 Heading 1'],
          ['h2', 'Note 3 Heading 2'],
          ['p', 'Note 3 paragraph 1.'],
          ['li', 'Note 3 list bullet 1'],
          ['li', 'Note 3 list bullet 2'],
          ['p', 'Note 3 paragraph 2.'],
          ['li', 'Note 3 list #1'],
          ['li', 'Note 3 list #2'],
        ]) {
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
          canvas.getByRole('button', {
            name: 'Info',
          }),
        );

        await expect(
          canvas.getByText('Last edited • Feb, 03 2026'),
        ).toBeInTheDocument();

        await expect(
          canvas.getByRole('button', {
            name: 'Archive',
          }),
        ).toBeInTheDocument();

        await expect(
          canvas.getByRole('button', {
            name: 'Trash',
          }),
        ).toBeInTheDocument();

        await expect(
          canvas.getByRole('link', {
            name: 'Edit',
          }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};

export const MatchedSearchArchivedNotesResult: Story = {
  parameters: { ...Default.parameters },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText('Search [ / ]'),
          'Note 4',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(
          canvas.queryByText('No matching results.'),
        ).not.toBeInTheDocument();

        await expect(canvas.getByText('Archived Notes')).toBeVisible();

        await expect(
          canvas.getByRole('heading', {
            name: 'Note Title 4',
          }),
        ).toBeInTheDocument();

        for (const [tagName, eachContent] of [
          ['h1', 'Note 4 Heading 1'],
          ['h2', 'Note 4 Heading 2'],
          ['p', 'Note 4 paragraph 1.'],
          ['li', 'Note 4 list bullet 1'],
          ['li', 'Note 4 list bullet 2'],
          ['p', 'Note 4 paragraph 2.'],
          ['li', 'Note 4 list #1'],
          ['li', 'Note 4 list #2'],
        ]) {
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
          canvas.getByRole('button', {
            name: 'Info',
          }),
        );

        await expect(
          canvas.getByText('Last edited • Feb, 04 2026'),
        ).toBeInTheDocument();

        await expect(
          canvas.getByRole('button', {
            name: 'Unarchive',
          }),
        ).toBeInTheDocument();

        await expect(
          canvas.getByRole('button', {
            name: 'Trash',
          }),
        ).toBeInTheDocument();

        await expect(
          canvas.getByRole('link', {
            name: 'Edit',
          }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};

export const MatchedSearchNotesResult: Story = {
  parameters: { ...Default.parameters },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByPlaceholderText('Search [ / ]'),
          'Note',
        );
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(
          canvas.queryByText('No matching results.'),
        ).not.toBeInTheDocument();

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
          {
            title:
              'Note Titleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee 5',
            content: [
              ['h1', 'Note 5 Heading 1'],
              ['h2', 'Note 5 Heading 2'],
              ['p', 'Note 5 paragraph 1.'],
              ['li', 'Note 5 list bullet 1'],
              ['li', 'Note 5 list bullet 2'],
              ['p', 'Note 5 paragraph 2.'],
              ['li', 'Note 5 list #1'],
              ['li', 'Note 5 list #2'],
              [
                'p',
                'Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3.',
              ],
            ],
            updatedAt: 'Feb, 05 2026',
          },
          {
            title: 'Note Title 4',
            content: [
              ['h1', 'Note 4 Heading 1'],
              ['h2', 'Note 4 Heading 2'],
              ['p', 'Note 4 paragraph 1.'],
              ['li', 'Note 4 list bullet 1'],
              ['li', 'Note 4 list bullet 2'],
              ['p', 'Note 4 paragraph 2.'],
              ['li', 'Note 4 list #1'],
              ['li', 'Note 4 list #2'],
            ],
            updatedAt: 'Feb, 04 2026',
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

        await expect(canvas.getByText('Active Notes')).toBeVisible();

        await expect(
          canvas.getAllByRole('button', {
            name: 'Archive',
          }),
        ).toHaveLength(3);

        await expect(canvas.getByText('Archived Notes')).toBeVisible();

        await expect(
          canvas.getAllByRole('button', {
            name: 'Unarchive',
          }),
        ).toHaveLength(2);

        await expect(
          canvas.getAllByRole('button', {
            name: 'Trash',
          }),
        ).toHaveLength(5);
      },
      { timeout: 15000 },
    );
  },
};

export const SigningOut: Story = {
  parameters: {
    msw: {
      handlers: [
        getSessionHandler,
        getNotesHandler,
        http.post(`${envConfig.api.baseUrl}/auth/sign-out`, async () => {
          await delay('infinite');
        }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Open user menu',
          }),
        );

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Sign out',
          }),
        );

        await expect(
          canvas.getByRole('button', {
            name: 'Signing out',
          }),
        ).toBeDisabled();
      },
      { timeout: 3000 },
    );
  },
};

export const SignedOut: Story = {
  parameters: {
    ...Default.parameters,
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Open user menu',
          }),
        );

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Sign out',
          }),
        );

        await expect(
          canvas.getByRole('button', {
            name: 'Signing out',
          }),
        ).toBeDisabled();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(
          canvas.getByText('Signing out is successful'),
        ).toBeVisible();
      },
      { timeout: 3000 },
    );
  },
};

export const AllSearchedNotesSelectionMobile: Story = {
  parameters: Default.parameters,
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
      {
        noteContent: /^Note Title* 5$/,
        totalSelection: /^4 selected$/,
      },
      {
        noteContent: /^Note Title 4$/,
        totalSelection: /^5 selected$/,
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

export const AllSearchedUnselectNoteSelectionMobile: Story = {
  ...AllSearchedNotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
      {
        noteContent: /^Note Title* 5$/,
        totalSelection: /^4 selected$/,
      },
      {
        noteContent: /^Note Title 4$/,
        totalSelection: /^5 selected$/,
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
        noteContent: /^Note Title 4$/,
        totalSelection: /^4 selected$/,
      },
      {
        noteContent: /^Note Title* 5$/,
        totalSelection: /^3 selected$/,
      },
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

export const AllSearchedClearAllNotesSelectionMobile: Story = {
  ...AllSearchedNotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
          {
            noteContent: /^Note Title* 5$/,
            currentTotalSelection: /^4 selected$/,
          },
        ],
        totalSelection: /^4 selected$/,
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
          {
            noteContent: /^Note Title* 5$/,
            currentTotalSelection: /^4 selected$/,
          },
          {
            noteContent: /^Note Title 4$/,
            currentTotalSelection: /^5 selected$/,
          },
        ],
        totalSelection: /^5 selected$/,
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

export const AllSearchedArchiveNotesSelectionMobile: Story = {
  ...AllSearchedNotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^4 selected$/,
          },
        ],
        toastMessage: /^4 notes archived$/,
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
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^4 selected$/,
          },
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^5 selected$/,
          },
        ],
        toastMessage: /^5 notes archived$/,
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

export const AllSearchedUnarchiveNotesSelectionMobile: Story = {
  ...AllSearchedNotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note unarchive$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes unarchive$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^2 selected$/,
          },
          {
            noteContent: /^Note Title 1$/,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes unarchive$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^2 selected$/,
          },
          {
            noteContent: /^Note Title 1$/,
            totalSelection: /^3 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            totalSelection: /^4 selected$/,
          },
        ],
        toastMessage: /^4 notes unarchive$/,
      },
      {
        notesSelection: [
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^1 selected$/,
          },
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^2 selected$/,
          },
          {
            noteContent: /^Note Title 1$/,
            totalSelection: /^3 selected$/,
          },
          {
            noteContent: /^Note Title 2$/,
            totalSelection: /^4 selected$/,
          },
          {
            noteContent: /^Note Title 3$/,
            totalSelection: /^5 selected$/,
          },
        ],
        toastMessage: /^5 notes unarchive$/,
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
            name: /^Archive$/,
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
  ...AllSearchedNotesSelectionMobile,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByPlaceholderText(/^Search$/), 'note');
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await expect(canvas.getByText(/^Active Notes$/)).toBeVisible();
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^4 selected$/,
          },
        ],
        toastMessage: /^4 notes trashed$/,
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
          {
            noteContent: /^Note Title* 5$/,
            totalSelection: /^4 selected$/,
          },
          {
            noteContent: /^Note Title 4$/,
            totalSelection: /^5 selected$/,
          },
        ],
        toastMessage: /^5 notes trashed$/,
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

export const AllSearchedNotesSelectionDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { noteCheckboxNth, totalSelection } of [
      {
        noteCheckboxNth: 4,
        totalSelection: /^1 selected$/,
      },
      {
        noteCheckboxNth: 3,
        totalSelection: /^2 selected$/,
      },
      {
        noteCheckboxNth: 2,
        totalSelection: /^3 selected$/,
      },
      {
        noteCheckboxNth: 1,
        totalSelection: /^4 selected$/,
      },
      {
        noteCheckboxNth: 0,
        totalSelection: /^5 selected$/,
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
          name: /^Archive$/,
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

export const AllSearchedUnselectNoteSelectionDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
      {
        noteCheckboxNth: 3,
        totalSelection: /^4 selected$/,
      },
      {
        noteCheckboxNth: 4,
        totalSelection: /^5 selected$/,
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
        noteCheckboxNth: 4,
        totalSelection: /^4 selected$/,
      },
      {
        noteCheckboxNth: 3,
        totalSelection: /^3 selected$/,
      },
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

export const AllSearchedClearAllNotesSelectionDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
      {
        noteCheckboxNth: 3,
        totalSelection: /^4 selected$/,
      },
      {
        noteCheckboxNth: 4,
        totalSelection: /^5 selected$/,
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

export const AllSearchedArchiveNotesSelectionDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
          {
            noteCheckboxNth: 3,
            totalSelection: /^4 selected$/,
          },
        ],
        toastMessage: /^4 notes archived$/,
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
          {
            noteCheckboxNth: 3,
            totalSelection: /^4 selected$/,
          },
          {
            noteCheckboxNth: 4,
            totalSelection: /^5 selected$/,
          },
        ],
        toastMessage: /^5 notes archived$/,
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

export const AllSearchedUnarchiveNotesSelectionDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCheckboxNth: 4,
            totalSelection: /^1 selected$/,
          },
        ],
        toastMessage: /^Note unarchive$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 4,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 3,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes unarchive$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 4,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 3,
            totalSelection: /^2 selected$/,
          },
          {
            noteCheckboxNth: 2,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes unarchive$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 4,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 3,
            totalSelection: /^2 selected$/,
          },
          {
            noteCheckboxNth: 2,
            totalSelection: /^3 selected$/,
          },
          {
            noteCheckboxNth: 1,
            totalSelection: /^4 selected$/,
          },
        ],
        toastMessage: /^4 notes unarchive$/,
      },
      {
        notesSelection: [
          {
            noteCheckboxNth: 4,
            totalSelection: /^1 selected$/,
          },
          {
            noteCheckboxNth: 3,
            totalSelection: /^2 selected$/,
          },
          {
            noteCheckboxNth: 2,
            totalSelection: /^3 selected$/,
          },
          {
            noteCheckboxNth: 1,
            totalSelection: /^4 selected$/,
          },
          {
            noteCheckboxNth: 0,
            totalSelection: /^5 selected$/,
          },
        ],
        toastMessage: /^5 notes unarchive$/,
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
            name: /^Archive$/,
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

export const AllSearchedTrashNotesSelectionDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
            noteCheckboxNth: 3,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes trashed$/,
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
          {
            noteCheckboxNth: 3,
            totalSelection: /^4 selected$/,
          },
        ],
        toastMessage: /^4 notes trashed$/,
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
          {
            noteCheckboxNth: 3,
            totalSelection: /^4 selected$/,
          },
          {
            noteCheckboxNth: 4,
            totalSelection: /^5 selected$/,
          },
        ],
        toastMessage: /^5 notes trashed$/,
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

export const AllSearchedNotesSelectionByNoteCardDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
      {
        noteCardSelectionNth: 3,
        totalSelection: /^4 selected$/,
      },
      {
        noteCardSelectionNth: 4,
        totalSelection: /^5 selected$/,
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
          name: /^Archive$/,
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

export const AllSearchedUnselectNoteSelectionByNoteCardDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
      {
        noteCardSelectionNth: 3,
        totalSelection: /^4 selected$/,
      },
      {
        noteCardSelectionNth: 4,
        totalSelection: /^5 selected$/,
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
        noteCardSelectionNth: 4,
        totalSelection: /^4 selected$/,
      },
      {
        noteCardSelectionNth: 3,
        totalSelection: /^3 selected$/,
      },
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

export const AllSearchedClearAllNotesSelectionByNoteCardDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
      {
        noteCardSelectionNth: 3,
        totalSelection: /^4 selected$/,
      },
      {
        noteCardSelectionNth: 4,
        totalSelection: /^5 selected$/,
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

export const AllSearchedArchiveNotesSelectionByNoteCardDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
          {
            noteCardSelectionNth: 3,
            totalSelection: /^4 selected$/,
          },
        ],
        toastMessage: /^4 notes archived$/,
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
          {
            noteCardSelectionNth: 3,
            totalSelection: /^4 selected$/,
          },
          {
            noteCardSelectionNth: 4,
            totalSelection: /^5 selected$/,
          },
        ],
        toastMessage: /^5 notes archived$/,
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

export const AllSearchedUnarchiveNotesSelectionByNoteCardDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
      },
      { timeout: 3000 },
    );

    for (const { notesSelection, toastMessage } of [
      {
        notesSelection: [
          {
            noteCardSelectionNth: 3,
            totalSelection: /^2 selected$/,
          },
        ],
        toastMessage: /^2 notes unarchive$/,
      },
      {
        notesSelection: [
          {
            noteCardSelectionNth: 3,
            totalSelection: /^2 selected$/,
          },
          {
            noteCardSelectionNth: 2,
            totalSelection: /^3 selected$/,
          },
        ],
        toastMessage: /^3 notes unarchive$/,
      },
      {
        notesSelection: [
          {
            noteCardSelectionNth: 3,
            totalSelection: /^2 selected$/,
          },
          {
            noteCardSelectionNth: 2,
            totalSelection: /^3 selected$/,
          },
          {
            noteCardSelectionNth: 1,
            totalSelection: /^4 selected$/,
          },
        ],
        toastMessage: /^4 notes unarchive$/,
      },
      {
        notesSelection: [
          {
            noteCardSelectionNth: 3,
            totalSelection: /^2 selected$/,
          },
          {
            noteCardSelectionNth: 2,
            totalSelection: /^3 selected$/,
          },
          {
            noteCardSelectionNth: 1,
            totalSelection: /^4 selected$/,
          },
          {
            noteCardSelectionNth: 0,
            totalSelection: /^5 selected$/,
          },
        ],
        toastMessage: /^5 notes unarchive$/,
      },
    ]) {
      await userEvent.click(
        canvas.getAllByRole('checkbox', {
          name: /^Select note$/,
        })[4],
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
            name: /^Archive$/,
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

export const AllSearchedTrashNotesSelectionByNoteCardDesktop: Story = {
  parameters: Default.parameters,
  play: async ({ canvas, userEvent }) => {
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
        await expect(canvas.getByText(/^Archived Notes$/)).toBeVisible();
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
          {
            noteCardSelectionNth: 3,
            totalSelection: /^4 selected$/,
          },
        ],
        toastMessage: /^4 notes trashed$/,
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
          {
            noteCardSelectionNth: 3,
            totalSelection: /^4 selected$/,
          },
          {
            noteCardSelectionNth: 4,
            totalSelection: /^5 selected$/,
          },
        ],
        toastMessage: /^5 notes trashed$/,
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
