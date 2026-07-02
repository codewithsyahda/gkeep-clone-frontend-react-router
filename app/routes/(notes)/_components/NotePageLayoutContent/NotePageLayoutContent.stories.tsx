import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { Toaster } from 'sonner';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import envConfig from '~/configs/envs';
import getNotesHandler from '~/tests/mocks/apis/handlers/notes/getNotesHandler';
import NotePageLayoutContent from './NotePageLayoutContent';

const meta = {
  title: 'Composites/NotePageLayoutContent',
  component: NotePageLayoutContent,
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
      <>
        <div className="-m-4 w-screen">
          <Story />
        </div>
        <Toaster duration={Infinity} />
      </>
    ),
  ],
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
      handlers: [getSessionHandler, getNotesHandler, signOutHandler],
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
