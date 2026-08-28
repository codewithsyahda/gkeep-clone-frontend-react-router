import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster } from 'sonner';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import { mockPatchNoteByIdHandler } from '.storybook/parameters/msw/notesHandlers';
import NotesSelectionCtxProvider from '~/contexts/NotesSelectionCtxProvider';
import * as ActiveNoteCardStories from './ActiveNoteCard.stories';
import ArchivedNoteCardComponent from './ArchivedNoteCard';

const meta = {
  title: 'Composites/ArchivedNoteCard',
  component: ArchivedNoteCardComponent,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [mockPatchNoteByIdHandler()],
    },
    reactRouter: reactRouterParameters({
      routing: {
        path: '/*',
      },
    }),
  },
  decorators: [
    reactQueryDecorator,
    withRouter,
    (Story) => {
      return (
        <>
          <NotesSelectionCtxProvider>
            <div className="min-w-70 md:min-w-sm">
              <Story />
            </div>
          </NotesSelectionCtxProvider>
          <Toaster duration={Infinity} />
        </>
      );
    },
  ],
} satisfies Meta<typeof ArchivedNoteCardComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

const args = {
  noteId: 'id-note-1',
  noteTitle: 'Note Title 1',
  jsonContent:
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Note 1 Heading 1"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Note 1 Heading 2"}]},{"type":"paragraph","content":[{"type":"text","text":"Note 1 "},{"type":"text","marks":[{"type":"bold"}],"text":"paragraph"},{"type":"text","text":" 1."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list bullet 1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list bullet 2"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Note 1 "},{"type":"text","marks":[{"type":"italic"}],"text":"paragraph"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"2"},{"type":"text","text":"."}]},{"type":"orderedList","attrs":{"start":1,"type":null},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list #1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list #2"}]}]}]},{"type":"paragraph"}]}',
  updatedAt: new Date(2026, 0, 1).toISOString(),
};

export const Default: Story = {
  ...ActiveNoteCardStories.Default,
};

export const NoteSelectedMobile: Story = {
  args,
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA>]',
        target: canvas.getByText(/^Note Title 1$/),
      });
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Info',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await userEvent.pointer('[/TouchA]');
    });
  },
};

export const NoteSelectionMobile: Story = {
  args,
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA>]',
        target: canvas.getByText(/^Note Title 1$/),
      });
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Info',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Unarchive',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Trash',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('link', {
          name: 'Edit',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await userEvent.pointer('[/TouchA]');
    });

    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByText(/^Note Title 1$/),
      });
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Info',
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Unarchive',
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Trash',
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', {
          name: 'Edit',
        }),
      ).toBeVisible();
    });
  },
};

export const NoteSelectedDesktop: Story = {
  args,
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('checkbox', { name: /^Select note$/ }),
      );
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Info',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Unarchive',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Trash',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('link', {
          name: 'Edit',
        }),
      ).not.toBeInTheDocument();
    });
  },
};

export const NoteSelectionDesktop: Story = {
  args,
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('checkbox', { name: /^Select note$/ }),
      );
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Info',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Unarchive',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Trash',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('link', {
          name: 'Edit',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('checkbox', { name: /^Select note$/ }),
      );
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Info',
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Unarchive',
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Trash',
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', {
          name: 'Edit',
        }),
      ).toBeVisible();
    });
  },
};

export const NoteUnselectionWithNoteCardDesktop: Story = {
  args,
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('checkbox', { name: /^Select note$/ }),
      );
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Info',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Unarchive',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', {
          name: 'Trash',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.queryByRole('link', {
          name: 'Edit',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: /^Select note$/ }),
      );
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Info',
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Unarchive',
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Trash',
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', {
          name: 'Edit',
        }),
      ).toBeVisible();
    });
  },
};

export const ShowedNoteInfo: Story = {
  ...ActiveNoteCardStories.ShowedNoteInfo,
};

export const ClosedNoteInfo: Story = {
  ...ActiveNoteCardStories.ClosedNoteInfo,
};

export const Unarchive: Story = {
  args,
  parameters: ActiveNoteCardStories.Archiving.parameters,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Unarchive',
      }),
    );

    await expect(
      canvas.getByRole('button', { name: 'Unarchive' }),
    ).toBeDisabled();

    await expect(canvas.getByRole('button', { name: 'Trash' })).toBeDisabled();
  },
};

export const UnarchiveSuccess: Story = {
  args,
  parameters: ActiveNoteCardStories.ArchiveSuccess.parameters,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Unarchive',
      }),
    );

    await waitFor(async () => {
      await expect(canvas.getByText('Note unarchive')).toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', { name: 'Unarchive' }),
    ).toBeDisabled();

    await expect(canvas.getByRole('button', { name: 'Trash' })).toBeDisabled();
  },
};

export const UnarchiveError: Story = {
  args,
  parameters: ActiveNoteCardStories.ArchiveError.parameters,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Unarchive',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Unarchive note failed'),
      ).toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', { name: 'Undo' }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Unarchive' }),
      ).not.toBeDisabled();

      await expect(
        canvas.getByRole('button', { name: 'Trash' }),
      ).not.toBeDisabled();
    });
  },
};

export const Trashing: Story = {
  args,
  parameters: ActiveNoteCardStories.Trashing.parameters,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Trash',
      }),
    );

    await expect(canvas.getByRole('button', { name: 'Trash' })).toBeDisabled();

    await expect(
      canvas.getByRole('button', { name: 'Unarchive' }),
    ).toBeDisabled();
  },
};

export const TrashSuccess: Story = {
  args,
  parameters: ActiveNoteCardStories.TrashSuccess.parameters,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Trash',
      }),
    );

    await waitFor(async () => {
      await expect(canvas.getByText('Note trashed')).toBeInTheDocument();

      await expect(
        canvas.getByRole('button', {
          name: 'Undo',
        }),
      ).toBeInTheDocument();
    });

    await expect(canvas.getByRole('button', { name: 'Trash' })).toBeDisabled();

    await expect(
      canvas.getByRole('button', { name: 'Unarchive' }),
    ).toBeDisabled();
  },
};

export const TrashError: Story = {
  args,
  parameters: ActiveNoteCardStories.TrashError.parameters,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Trash',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Trashing note failed'),
      ).toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', {
          name: 'Undo',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Trash' }),
      ).not.toBeDisabled();

      await expect(
        canvas.getByRole('button', { name: 'Unarchive' }),
      ).not.toBeDisabled();
    });
  },
};
