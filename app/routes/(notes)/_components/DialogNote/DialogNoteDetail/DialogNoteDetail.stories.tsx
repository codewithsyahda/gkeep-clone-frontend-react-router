import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, screen, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import envConfig from '~/configs/envs';
import DialogNoteDetailComponent from './DialogNoteDetail';

const meta = {
  title: 'Composites/DialogNoteDetail',
  component: DialogNoteDetailComponent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    reactQueryDecorator,
    withRouter,
    (Story) => (
      <div className="min-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DialogNoteDetailComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockedResponseNote = {
  id: 'id-note-1',
  title: 'Note Title 1',
  jsonContent:
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Note 1 Heading 1"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Note 1 Heading 2"}]},{"type":"paragraph","content":[{"type":"text","text":"Note 1 "},{"type":"text","marks":[{"type":"bold"}],"text":"paragraph"},{"type":"text","text":" 1."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list bullet 1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list bullet 2"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Note 1 "},{"type":"text","marks":[{"type":"italic"}],"text":"paragraph"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"2"},{"type":"text","text":"."}]},{"type":"orderedList","attrs":{"start":1,"type":null},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list #1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list #2"}]}]}]},{"type":"paragraph"}]}',
  createdAt: new Date(2026, 1, 1).toISOString(),
  updatedAt: new Date(2026, 1, 1).toISOString(),
  authorId: 'id-user-1',
};

export const Loading: Story = {
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        hash: '#notes/id-note-1',
      },
      routing: {
        path: '/',
      },
    }),
    msw: {
      handlers: [
        http.get<{ noteId: string }>(
          `${envConfig.api.baseUrl}/notes/:noteId`,
          async () => {
            await delay('infinite');
          },
        ),
      ],
    },
  },
};

const getActiveNoteByIdHandler = http.get<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('real');
    return HttpResponse.json({
      data: {
        note: {
          ...mockedResponseNote,
          archivedAt: null,
          trashedAt: null,
        },
      },
    });
  },
);

const patchContentNoteByIdSuccessHandler = http.patch<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
  await delay(1000);
  return HttpResponse.json(null);
});

export const ActiveNote: Story = {
  parameters: {
    reactRouter: Loading?.parameters?.reactRouter,
    msw: {
      handlers: [getActiveNoteByIdHandler, patchContentNoteByIdSuccessHandler],
    },
  },
};

export const ShowedActiveNoteInfoSmallMobile: Story = {
  parameters: {
    ...ActiveNote.parameters,
  },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Info',
        }),
      );
    });

    await waitFor(async () => {
      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[0],
      ).toBeVisible();

      await expect(canvas.getByText('Status •')).toBeVisible();
      await expect(canvas.getAllByText('Active')[0]).toBeVisible();
      await expect(canvas.getAllByText('Active')[1]).not.toBeVisible();

      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[1],
      ).not.toBeVisible();
    });
  },
};

export const ClosedActiveNoteInfoSmallMobile: Story = {
  parameters: {
    ...ActiveNote.parameters,
  },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Info',
        }),
      );
    });

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Info',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Last edited • Feb, 01 2026'),
      ).not.toBeVisible();
    });
  },
};

const putNoteByIdInfiniteHandler = http.put<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
  await delay('infinite');
});

export const ArchivingActiveNote: Story = {
  parameters: {
    ...ActiveNote.parameters,
    msw: {
      handlers: [getActiveNoteByIdHandler, putNoteByIdInfiniteHandler],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Archive',
        }),
      );
    });

    await expect(
      canvas.getByRole('button', {
        name: 'Archive',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Trash',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Close',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Update note',
      }),
    ).toBeDisabled();
  },
};

export const TrashingActiveNote: Story = {
  parameters: {
    ...ArchivingActiveNote.parameters,
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Trash',
        }),
      );
    });

    await expect(
      canvas.getByRole('button', {
        name: 'Archive',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Trash',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Close',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Update note',
      }),
    ).toBeDisabled();
  },
};

const patchNoteByIdInfiniteHandler = http.patch<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
  await delay('infinite');
});

export const UpdatingActiveNote: Story = {
  parameters: {
    ...ActiveNote.parameters,
    msw: {
      handlers: [getActiveNoteByIdHandler, patchNoteByIdInfiniteHandler],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.type(
        canvas.getByRole('textbox', {
          name: 'Title note',
        }),
        ' (Updated Title)',
      );

      await userEvent.type(
        canvas.getByRole('textbox', {
          name: 'Content note',
        }),
        '(Updated Content)',
      );
    });

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Update note',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Updating note',
        }),
      ).toBeDisabled();
    });
  },
};

export const UpdateSuccessActiveNote: Story = {
  parameters: {
    ...ActiveNote.parameters,
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.type(
        canvas.getByRole('textbox', {
          name: 'Title note',
        }),
        ' (Updated Title)',
      );

      await userEvent.type(
        canvas.getByRole('textbox', {
          name: 'Content note',
        }),
        '(Updated Content)',
      );
    });

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Update note',
      }),
    );

    await waitFor(
      async () => {
        await expect(
          canvas.getByRole('button', {
            name: 'Updating note',
          }),
        ).toBeDisabled();
      },
      { timeout: 15000 },
    );

    await waitFor(
      async () => {
        await expect(
          canvas.getByRole('button', {
            name: 'Note updated',
          }),
        ).toBeDisabled();
      },
      { timeout: 15000 },
    );

    await waitFor(
      async () => {
        await expect(
          canvas.getByRole('button', {
            name: 'Update note',
          }),
        ).not.toBeDisabled();
      },
      { timeout: 15000 },
    );
  },
};

const getArchivedNoteByIdHandler = http.get<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('real');
    return HttpResponse.json({
      data: {
        note: {
          ...mockedResponseNote,
          archivedAt: new Date(2026, 1, 2).toISOString(),
          trashedAt: null,
        },
      },
    });
  },
);

export const ArchivedNote: Story = {
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        path: '/archive',
        hash: '#notes/id-note-1',
      },
      routing: {
        path: '/archive',
      },
    }),
    msw: {
      handlers: [
        getArchivedNoteByIdHandler,
        patchContentNoteByIdSuccessHandler,
      ],
    },
  },
};

export const ShowedArchivedNoteInfoSmallMobile: Story = {
  parameters: {
    ...ArchivedNote.parameters,
  },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Info',
        }),
      );
    });

    await waitFor(async () => {
      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[0],
      ).toBeVisible();

      await expect(canvas.getByText('Status •')).toBeVisible();
      await expect(canvas.getAllByText('Archived')[0]).toBeVisible();
      await expect(canvas.getAllByText('Archived')[1]).not.toBeVisible();

      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[1],
      ).not.toBeVisible();
    });
  },
};

export const ClosedArchivedNoteInfoSmallMobile: Story = {
  parameters: {
    ...ArchivedNote.parameters,
  },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Info',
        }),
      );
    });

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Info',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Last edited • Feb, 01 2026'),
      ).not.toBeVisible();
    });
  },
};

export const UnarchiveArchivedNote: Story = {
  parameters: {
    ...ArchivedNote.parameters,
    msw: {
      handlers: [getArchivedNoteByIdHandler, putNoteByIdInfiniteHandler],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Unarchive',
        }),
      );
    });

    await expect(
      canvas.getByRole('button', {
        name: 'Unarchive',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Trash',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Close',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Update note',
      }),
    ).toBeDisabled();
  },
};

export const TrashingArchivedNote: Story = {
  parameters: {
    ...UnarchiveArchivedNote.parameters,
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Trash',
        }),
      );
    });

    await expect(
      canvas.getByRole('button', {
        name: 'Unarchive',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Trash',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Close',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Update note',
      }),
    ).toBeDisabled();
  },
};

export const UpdatingArchivedNote: Story = {
  parameters: {
    ...ArchivedNote.parameters,
    msw: {
      handlers: [getArchivedNoteByIdHandler, patchNoteByIdInfiniteHandler],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.type(
        canvas.getByRole('textbox', {
          name: 'Title note',
        }),
        ' (Updated Title)',
      );

      await userEvent.type(
        canvas.getByRole('textbox', {
          name: 'Content note',
        }),
        '(Updated Content)',
      );
    });

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Update note',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Updating note',
        }),
      ).toBeDisabled();
    });
  },
};

export const UpdateSuccessArchivedNote: Story = {
  parameters: {
    ...ArchivedNote.parameters,
  },
  play: UpdateSuccessActiveNote.play,
};

const getTrashedNoteByIdHandler = http.get<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('real');
    return HttpResponse.json({
      data: {
        note: {
          ...mockedResponseNote,
          archivedAt: null,
          trashedAt: new Date(2026, 1, 2).toISOString(),
        },
      },
    });
  },
);

export const TrashedNote: Story = {
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        path: '/trash',
        hash: '#notes/id-note-1',
      },
      routing: {
        path: '/trash',
      },
    }),
    msw: {
      handlers: [getTrashedNoteByIdHandler],
    },
  },
};

export const ShowedTrashedNoteInfoSmallMobile: Story = {
  parameters: {
    ...TrashedNote.parameters,
  },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Info',
        }),
      );
    });

    await waitFor(async () => {
      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[0],
      ).toBeVisible();

      await expect(canvas.getByText('Status •')).toBeVisible();
      await expect(canvas.getAllByText('Trashed')[0]).toBeVisible();
      await expect(canvas.getAllByText('Trashed')[1]).not.toBeVisible();

      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[1],
      ).not.toBeVisible();
    });
  },
};

export const ClosedTrashedNoteInfoSmallMobile: Story = {
  parameters: {
    ...TrashedNote.parameters,
  },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Info',
        }),
      );
    });

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Info',
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Last edited • Feb, 01 2026'),
      ).not.toBeVisible();
    });
  },
};

export const RestoringTrashedNote: Story = {
  parameters: {
    ...TrashedNote.parameters,
    msw: {
      handlers: [getTrashedNoteByIdHandler, patchNoteByIdInfiniteHandler],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Restore',
        }),
      );
    });

    await expect(
      canvas.getByRole('button', {
        name: 'Restore',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Delete',
      }),
    ).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Close',
      }),
    ).toBeDisabled();

    await expect(
      canvas.queryByRole('button', {
        name: 'Update note',
      }),
    ).not.toBeInTheDocument();
  },
};

export const DeletingTrashedNote: Story = {
  parameters: {
    ...RestoringTrashedNote.parameters,
    msw: {
      handlers: [
        getTrashedNoteByIdHandler,
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
    await waitFor(async () => {
      await userEvent.click(
        canvas.getByRole('button', {
          name: 'Delete',
        }),
      );
    });

    await waitFor(async () => {
      await expect(screen.getByText('Are you sure?')).toBeInTheDocument();

      await expect(
        screen.getByText('The note will be permanently deleted.'),
      ).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
    });

    await waitFor(async () => {
      await expect(screen.getByRole('button', { name: 'No' })).toBeDisabled();
      await expect(screen.getByRole('button', { name: 'Yes' })).toBeDisabled();
    });
  },
};

export const NotFoundError: Story = {
  parameters: {
    ...ActiveNote.parameters,
    msw: {
      handlers: [
        http.get<{ noteId: string }>(
          `${envConfig.api.baseUrl}/notes/:noteId`,
          async () => {
            await delay('real');
            return HttpResponse.json(null, { status: 404 });
          },
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getByText('Note is not found')).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: 'Dismiss',
        }),
      ).toBeVisible();
    });
  },
};

export const ServerError: Story = {
  parameters: {
    ...ArchivedNote.parameters,
    msw: {
      handlers: [
        http.get<{ noteId: string }>(
          `${envConfig.api.baseUrl}/notes/:noteId`,
          async () => {
            await delay('real');
            return HttpResponse.json(null, { status: 500 });
          },
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getByText('Something went wrong')).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: 'Dismiss',
        }),
      ).toBeVisible();
    });
  },
};
