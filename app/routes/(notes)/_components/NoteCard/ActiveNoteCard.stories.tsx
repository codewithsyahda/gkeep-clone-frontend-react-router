import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster } from 'sonner';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import {
  patchNoteByIdHandler,
  patchNoteByIdLoadingHandler,
  patchNoteByIdServerErrorHandler,
} from '.storybook/parameters/msw/notesHandlers';
import SelectionNotesCtxProvider from '~/contexts/SelectionNotesCtxProvider';
import ActiveNoteCardComponent from './ActiveNoteCard';

const meta = {
  title: 'Composites/ActiveNoteCard',
  component: ActiveNoteCardComponent,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [patchNoteByIdHandler],
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
          <SelectionNotesCtxProvider>
            <div className="min-w-70 md:min-w-sm">
              <Story />
            </div>
          </SelectionNotesCtxProvider>
          <Toaster duration={Infinity} />
        </>
      );
    },
  ],
} satisfies Meta<typeof ActiveNoteCardComponent>;

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
  args,
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
          name: 'Archive',
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
          name: 'Archive',
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
          name: 'Archive',
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
          name: 'Archive',
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
          name: 'Archive',
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
          name: 'Archive',
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
          name: 'Archive',
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
  args,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Info',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Last edited • Jan, 01 2026'),
      ).toBeInTheDocument();
    });
  },
};

export const ClosedNoteInfo: Story = {
  args,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Info',
      }),
    );

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Info',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.queryByText('Last edited • Jan, 01 2026'),
      ).not.toBeInTheDocument();
    });
  },
};

export const Archiving: Story = {
  args,
  parameters: {
    msw: {
      handlers: [patchNoteByIdLoadingHandler],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Archive',
      }),
    );

    await expect(
      canvas.getByRole('button', { name: 'Archive' }),
    ).toBeDisabled();

    await expect(canvas.getByRole('button', { name: 'Trash' })).toBeDisabled();
  },
};

export const ArchiveSuccess: Story = {
  args,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Archive',
      }),
    );

    await waitFor(async () => {
      await expect(canvas.getByText('Note archived')).toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', { name: 'Archive' }),
    ).toBeDisabled();

    await expect(canvas.getByRole('button', { name: 'Trash' })).toBeDisabled();
  },
};

export const ArchiveError: Story = {
  args,
  parameters: {
    msw: {
      handlers: [patchNoteByIdServerErrorHandler],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Archive',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Archiving note failed'),
      ).toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', { name: 'Undo' }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Archive' }),
      ).not.toBeDisabled();

      await expect(
        canvas.getByRole('button', { name: 'Trash' }),
      ).not.toBeDisabled();
    });
  },
};

export const Trashing: Story = {
  args,
  parameters: { ...Archiving.parameters },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Trash',
      }),
    );

    await expect(canvas.getByRole('button', { name: 'Trash' })).toBeDisabled();

    await expect(
      canvas.getByRole('button', { name: 'Archive' }),
    ).toBeDisabled();
  },
};

export const TrashSuccess: Story = {
  args,
  parameters: { ...ArchiveSuccess.parameters },
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
      canvas.getByRole('button', { name: 'Archive' }),
    ).toBeDisabled();
  },
};

export const TrashError: Story = {
  args,
  parameters: { ...ArchiveError.parameters },
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
        canvas.getByRole('button', { name: 'Archive' }),
      ).not.toBeDisabled();
    });
  },
};
