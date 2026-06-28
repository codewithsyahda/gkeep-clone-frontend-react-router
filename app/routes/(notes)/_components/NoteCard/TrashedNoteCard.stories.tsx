import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { Toaster } from 'sonner';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, screen, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import envConfig from '~/configs/envs';
import * as ActiveNoteCardStories from './ActiveNoteCard.stories';
import { patchNoteSuccessByIdHandler } from './ActiveNoteCard.stories';
import TrashedNoteCardComponent from './TrashedNoteCard';

const meta = {
  title: 'Composites/TrashedNoteCard',
  component: TrashedNoteCardComponent,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        patchNoteSuccessByIdHandler,
        http.delete<{ noteId: string }>(
          `${envConfig.api.baseUrl}/notes/:noteId`,
          async () => {
            await delay('real');
            return HttpResponse.json(null, { status: 204 });
          },
        ),
      ],
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
          <div className="min-w-sm">
            <Story />
          </div>
          <Toaster duration={Infinity} />
        </>
      );
    },
  ],
} satisfies Meta<typeof TrashedNoteCardComponent>;

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

export const ShowedNoteInfo: Story = {
  ...ActiveNoteCardStories.ShowedNoteInfo,
};

export const ClosedNoteInfo: Story = {
  ...ActiveNoteCardStories.ClosedNoteInfo,
};

export const Restoring: Story = {
  args,
  parameters: ActiveNoteCardStories.Archiving.parameters,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Restore',
      }),
    );

    await expect(
      canvas.getByRole('button', { name: 'Restore' }),
    ).toBeDisabled();

    await expect(canvas.getByRole('button', { name: 'Delete' })).toBeDisabled();
  },
};

export const RestoreSuccess: Story = {
  args,
  parameters: ActiveNoteCardStories.ArchiveSuccess.parameters,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Restore',
      }),
    );

    await waitFor(async () => {
      await expect(canvas.getByText('Note restored')).toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('button', { name: 'Restore' }),
    ).toBeDisabled();

    await expect(canvas.getByRole('button', { name: 'Delete' })).toBeDisabled();
  },
};

export const RestoreError: Story = {
  args,
  parameters: ActiveNoteCardStories.ArchiveError.parameters,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Restore',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Restoring note failed'),
      ).toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', { name: 'Undo' }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Restore' }),
      ).not.toBeDisabled();

      await expect(
        canvas.getByRole('button', { name: 'Delete' }),
      ).not.toBeDisabled();
    });
  },
};

export const Deleting: Story = {
  args,
  parameters: {
    msw: {
      handlers: [
        patchNoteSuccessByIdHandler,
        http.delete<{ noteId: string }>(
          `${envConfig.api.baseUrl}/notes/:noteId`,
          async () => {
            await delay('infinite');
          },
        ),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Delete',
      }),
    );

    await waitFor(async () => {
      await expect(screen.getByText('Are you sure?')).toBeInTheDocument();

      await expect(
        screen.getByText('The note will be permanently deleted.'),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Yes',
      }),
    );

    await waitFor(async () => {
      await expect(
        screen.getByRole('button', {
          name: 'Yes',
        }),
      ).toBeDisabled();
    });
  },
};

export const DeleteSuccess: Story = {
  args,
  parameters: {
    msw: {
      handlers: [
        patchNoteSuccessByIdHandler,
        http.delete<{ noteId: string }>(
          `${envConfig.api.baseUrl}/notes/:noteId`,
          async () => {
            await delay('real');
            return new HttpResponse(null, { status: 200 });
          },
        ),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Delete',
      }),
    );

    await waitFor(async () => {
      await expect(screen.getByText('Are you sure?')).toBeInTheDocument();

      await expect(
        screen.getByText('The note will be permanently deleted.'),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Yes',
      }),
    );

    await waitFor(async () => {
      await expect(canvas.getByText('Note deleted')).toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', {
          name: 'Undo',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Restore',
        }),
      ).toBeDisabled();
    });
  },
};

export const DeleteError: Story = {
  args,
  parameters: {
    msw: {
      handlers: [
        patchNoteSuccessByIdHandler,
        http.delete<{ noteId: string }>(
          `${envConfig.api.baseUrl}/notes/:noteId`,
          async () => {
            await delay('real');
            return HttpResponse.json(null, { status: 500 });
          },
        ),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Delete',
      }),
    );

    await waitFor(async () => {
      await expect(screen.getByText('Are you sure?')).toBeInTheDocument();

      await expect(
        screen.getByText('The note will be permanently deleted.'),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Yes',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Deleting note failed'),
      ).toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', {
          name: 'Undo',
        }),
      ).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      await expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();

      await expect(
        screen.queryByText('The note will be permanently deleted.'),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('button', {
          name: 'No',
        }),
      ).not.toBeInTheDocument();

      await expect(
        screen.queryByRole('button', {
          name: 'Yes',
        }),
      ).not.toBeInTheDocument();
    });
  },
};
