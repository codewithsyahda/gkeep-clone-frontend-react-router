import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, fn, screen, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import {
  mockDeleteNoteByIdHandler,
  mockGetNoteByIdHandler,
  mockPatchNoteByIdHandler,
  mockPutNoteByIdHandler,
} from '.storybook/parameters/msw/notesHandlers';
import DialogNoteDetailComponent from './DialogNoteDetail';

const meta = {
  title: 'Composites/DialogNoteDetail',
  component: DialogNoteDetailComponent,
  parameters: {
    layout: 'centered',
  },
  args: {
    onClose: fn(),
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
      handlers: [mockGetNoteByIdHandler({ delayInfinite: true })],
    },
  },
};

export const ActiveNote: Story = {
  parameters: {
    reactRouter: Loading?.parameters?.reactRouter,
    msw: {
      handlers: [mockGetNoteByIdHandler(), mockPatchNoteByIdHandler()],
    },
  },
  play: async ({ canvas }) => {
    await waitFor(() => {
      expect(
        canvas.getByRole('textbox', {
          name: /^Title note$/,
        }),
      ).toHaveFocus();
    });
  },
};

export const ActiveNoteFocusTrap: Story = {
  parameters: ActiveNote.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      () => {
        expect(
          canvas.getByRole('textbox', {
            name: /^Title note$/,
          }),
        ).toHaveFocus();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

        expect(
          canvas.getByRole('button', {
            name: /^Close dialog$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

        expect(
          canvas.getByRole('button', {
            name: /^Update note$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Tab}');

        expect(
          canvas.getByRole('button', {
            name: /^Close dialog$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Tab}');

        expect(
          canvas.getByRole('textbox', {
            name: /^Title note$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Tab>9/}');

        expect(
          canvas.getByRole('button', {
            name: /^Fullscreen$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{Shift>}{Tab>10/}{/Shift}');

        expect(
          canvas.getByRole('button', {
            name: /^Update note$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Tab}');

        expect(
          canvas.getByRole('textbox', {
            name: /^Title note$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Tab>9/}');

        expect(
          canvas.getByRole('button', {
            name: /^Fullscreen$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{Shift>}{Tab>10/}{/Shift}');

        expect(
          canvas.getByRole('button', {
            name: /^Close dialog$/,
          }),
        ).toHaveFocus();
      },
      { timeout: 5000 },
    );
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

export const ArchivingActiveNote: Story = {
  parameters: {
    ...ActiveNote.parameters,
    msw: {
      handlers: [
        mockGetNoteByIdHandler(),
        mockPutNoteByIdHandler({ delayInfinite: true }),
      ],
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

export const UpdatingActiveNote: Story = {
  parameters: {
    ...ActiveNote.parameters,
    msw: {
      handlers: [
        mockGetNoteByIdHandler(),
        mockPatchNoteByIdHandler({ delayInfinite: true }),
      ],
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
        mockGetNoteByIdHandler({ status: 'archived' }),
        mockPatchNoteByIdHandler(),
      ],
    },
  },
  play: ActiveNote.play,
};

export const ArchivedNoteFocusTrap: Story = {
  parameters: ArchivedNote.parameters,
  play: ActiveNoteFocusTrap.play,
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
      handlers: [
        mockGetNoteByIdHandler({ status: 'archived' }),
        mockPutNoteByIdHandler({ delayInfinite: true }),
      ],
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
      handlers: [
        mockGetNoteByIdHandler({ status: 'archived' }),
        mockPatchNoteByIdHandler({ delayInfinite: true }),
      ],
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
      handlers: [mockGetNoteByIdHandler({ status: 'trashed' })],
    },
  },
  play: async ({ canvas }) => {
    await waitFor(() => {
      expect(
        canvas.getByRole('textbox', {
          name: /^Title note$/,
        }),
      ).not.toHaveFocus();
    });
  },
};

export const TrashedNoteFocusTrap: Story = {
  parameters: TrashedNote.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      () => {
        expect(
          canvas.getByRole('button', {
            name: /^Close dialog$/,
          }),
        ).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      async () => {
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

        expect(
          canvas.getByRole('button', {
            name: /^Close$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Tab}');

        expect(
          canvas.getByRole('button', {
            name: /^Close dialog$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Tab}');

        expect(
          canvas.getByRole('button', {
            name: /^Fullscreen$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

        expect(
          canvas.getByRole('button', {
            name: /^Close$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Tab}');

        expect(
          canvas.getByRole('button', {
            name: /^Fullscreen$/,
          }),
        ).toHaveFocus();

        await userEvent.keyboard('{Enter}');

        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

        expect(
          canvas.getByRole('button', {
            name: /^Close dialog$/,
          }),
        ).toHaveFocus();
      },
      { timeout: 3000 },
    );
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
      handlers: [
        mockGetNoteByIdHandler({ status: 'trashed' }),
        mockPatchNoteByIdHandler({ delayInfinite: true }),
      ],
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
        mockGetNoteByIdHandler({ status: 'trashed' }),
        mockDeleteNoteByIdHandler({ delayInfinite: true }),
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
      handlers: [mockGetNoteByIdHandler({ errorStatus: '404' })],
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
      handlers: [mockGetNoteByIdHandler({ errorStatus: '500' })],
    },
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByText(/^Cannot process the request\.$/),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: 'Dismiss',
        }),
      ).toBeVisible();
    });
  },
};

export const FocusTrapNonExistentNote: Story = {
  parameters: NotFoundError.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: 'Dismiss',
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Close dialog$/,
        }),
      ).toHaveFocus();

      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

      await expect(
        canvas.getByRole('button', {
          name: 'Dismiss',
        }),
      ).toHaveFocus();

      await userEvent.keyboard('{Tab}');

      await expect(
        canvas.getByRole('button', {
          name: /^Close dialog$/,
        }),
      ).toHaveFocus();
    });
  },
};
