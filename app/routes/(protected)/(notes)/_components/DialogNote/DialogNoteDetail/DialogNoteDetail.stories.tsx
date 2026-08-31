import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import type { Canvas, Globals } from 'storybook/internal/csf';
import {
  expect,
  fn,
  screen,
  waitFor,
  type UserEventObject,
} from 'storybook/test';

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
    layout: 'fullscreen',
  },
  args: {
    onClose: fn(),
  },
  decorators: [reactQueryDecorator, withRouter],
} satisfies Meta<typeof DialogNoteDetailComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoadingMobile: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
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
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getByText(/^Fetching note detail$/)).toBeVisible();
    });
  },
};

export const Loading: Story = {
  parameters: LoadingMobile.parameters,
  play: LoadingMobile.play,
};

export const ActiveNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: {
    ...Loading.parameters,
    msw: {
      handlers: [mockGetNoteByIdHandler(), mockPatchNoteByIdHandler()],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(() => {
      expect(
        canvas.getByRole('textbox', {
          name: /^Title note$/,
        }),
      ).toHaveFocus();

      expect(
        canvas.getByRole('textbox', {
          name: /^Content note$/,
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByRole('button', {
          name: 'Info',
        }),
      });
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

    await userEvent.pointer({
      keys: '[TouchA]',
      target: canvas.getByRole('button', {
        name: 'Info',
      }),
    });

    await waitFor(async () => {
      await expect(
        canvas.getByText('Last edited • Feb, 01 2026'),
      ).not.toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Archive$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Trash$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Close$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Update note$/,
        }),
      ).toBeVisible();
    });
  },
};

export const ActiveNoteMobileLg: Story = {
  globals: {
    viewport: { value: 'mobile2', isRotated: false },
  },
  parameters: ActiveNoteMobile.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(() => {
      expect(
        canvas.getByRole('textbox', {
          name: /^Title note$/,
        }),
      ).toHaveFocus();

      expect(
        canvas.getByRole('textbox', {
          name: /^Content note$/,
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByRole('button', {
          name: 'Info',
        }),
      });
    });

    await waitFor(async () => {
      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[0],
      ).toBeVisible();

      await expect(canvas.getByText('Status •')).not.toBeVisible();
      await expect(canvas.getAllByText('Active')[0]).not.toBeVisible();
      await expect(canvas.getAllByText('Active')[1]).toBeVisible();

      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[1],
      ).not.toBeVisible();
    });

    await userEvent.pointer({
      keys: '[TouchA]',
      target: canvas.getByRole('button', {
        name: 'Info',
      }),
    });

    await waitFor(async () => {
      await expect(
        canvas.getByText('Last edited • Feb, 01 2026'),
      ).not.toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Archive$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Trash$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Close$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Update note$/,
        }),
      ).toBeVisible();
    });
  },
};

export const ActiveNote: Story = {
  parameters: ActiveNoteMobile.parameters,
  play: async ({ canvas }) => {
    await waitFor(() => {
      expect(
        canvas.getByRole('textbox', {
          name: /^Title note$/,
        }),
      ).toHaveFocus();

      expect(
        canvas.getByRole('textbox', {
          name: /^Content note$/,
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(canvas.getByText(/^Active$/)).toBeVisible();

      await expect(
        canvas.getByText(/^Last edited • Feb, 01 2026$/),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Fullscreen$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Archive$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Trash$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Close$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Update note$/,
        }),
      ).toBeVisible();
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

export const ArchivingActiveNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: {
    ...ActiveNote.parameters,
    msw: {
      handlers: [
        mockGetNoteByIdHandler(),
        mockPutNoteByIdHandler({ delayInfinite: true }),
      ],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await waitFor(async () => {
      if (globals?.viewport?.value === 'mobile1') {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: 'Archive',
          }),
        });
      } else {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Archive',
          }),
        );
      }
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

export const ArchivingActiveNote: Story = {
  parameters: ArchivingActiveNoteMobile.parameters,
  play: ArchivingActiveNoteMobile.play,
};

export const TrashingActiveNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: ArchivingActiveNote.parameters,
  play: async ({ globals, canvas, userEvent }) => {
    await waitFor(async () => {
      if (globals?.viewport?.value === 'mobile1') {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: 'Trash',
          }),
        });
      } else {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Trash',
          }),
        );
      }
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
  parameters: TrashingActiveNoteMobile.parameters,
  play: TrashingActiveNoteMobile.play,
};

async function playBasicUpdateActiveNote({
  globals,
  canvas,
  userEvent,
}: Readonly<{
  globals: Globals;
  canvas: Canvas;
  userEvent: UserEventObject;
}>) {
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

  if (globals?.viewport?.value === 'mobile1') {
    await userEvent.pointer({
      keys: '[TouchA]',
      target: canvas.getByRole('button', {
        name: 'Update note',
      }),
    });
  } else {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Update note',
      }),
    );
  }

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

  await waitFor(async () => {
    await expect(
      canvas.getByRole('button', {
        name: 'Updating note',
      }),
    ).toBeDisabled();
  });
}

export const UpdatingActiveNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: {
    ...ActiveNote.parameters,
    msw: {
      handlers: [
        mockGetNoteByIdHandler(),
        mockPatchNoteByIdHandler({ delayInfinite: true }),
      ],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicUpdateActiveNote({ globals, canvas, userEvent });
  },
};

export const UpdatingActiveNote: Story = {
  parameters: UpdatingActiveNoteMobile.parameters,
  play: UpdatingActiveNoteMobile.play,
};

export const UpdateSuccessActiveNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: ActiveNote.parameters,
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicUpdateActiveNote({ globals, canvas, userEvent });

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

export const UpdateSuccessActiveNote: Story = {
  parameters: ActiveNote.parameters,
  play: UpdateSuccessActiveNoteMobile.play,
};

export const ArchivedNoteMobile: Story = {
  globals: LoadingMobile.globals,
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
  play: async ({ canvas, userEvent }) => {
    await waitFor(() => {
      expect(
        canvas.getByRole('textbox', {
          name: /^Title note$/,
        }),
      ).toHaveFocus();

      expect(
        canvas.getByRole('textbox', {
          name: /^Content note$/,
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByRole('button', {
          name: 'Info',
        }),
      });
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

    await userEvent.pointer({
      keys: '[TouchA]',
      target: canvas.getByRole('button', {
        name: 'Info',
      }),
    });

    await waitFor(async () => {
      await expect(
        canvas.getByText('Last edited • Feb, 01 2026'),
      ).not.toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Unarchive$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Trash$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Close$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Update note$/,
        }),
      ).toBeVisible();
    });
  },
};

export const ArchivedNoteMobileLg: Story = {
  globals: ActiveNoteMobileLg.globals,
  parameters: ArchivedNoteMobile.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(() => {
      expect(
        canvas.getByRole('textbox', {
          name: /^Title note$/,
        }),
      ).toHaveFocus();

      expect(
        canvas.getByRole('textbox', {
          name: /^Content note$/,
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByRole('button', {
          name: 'Info',
        }),
      });
    });

    await waitFor(async () => {
      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[0],
      ).toBeVisible();

      await expect(canvas.getByText('Status •')).not.toBeVisible();
      await expect(canvas.getAllByText('Archived')[0]).not.toBeVisible();
      await expect(canvas.getAllByText('Archived')[1]).toBeVisible();

      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[1],
      ).not.toBeVisible();
    });

    await userEvent.pointer({
      keys: '[TouchA]',
      target: canvas.getByRole('button', {
        name: 'Info',
      }),
    });

    await waitFor(async () => {
      await expect(
        canvas.getByText('Last edited • Feb, 01 2026'),
      ).not.toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Unarchive$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Trash$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Close$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Update note$/,
        }),
      ).toBeVisible();
    });
  },
};

export const ArchivedNote: Story = {
  parameters: ArchivedNoteMobile.parameters,
  play: async ({ canvas }) => {
    await waitFor(() => {
      expect(
        canvas.getByRole('textbox', {
          name: /^Title note$/,
        }),
      ).toHaveFocus();

      expect(
        canvas.getByRole('textbox', {
          name: /^Content note$/,
        }),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(canvas.getByText(/^Archived$/)).toBeVisible();

      await expect(
        canvas.getByText(/^Last edited • Feb, 01 2026$/),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Fullscreen$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Unarchive$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Trash$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Close$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Update note$/,
        }),
      ).toBeVisible();
    });
  },
};

export const ArchivedNoteFocusTrap: Story = {
  parameters: ArchivedNote.parameters,
  play: ActiveNoteFocusTrap.play,
};

export const UnarchiveArchivedNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: {
    ...ArchivedNote.parameters,
    msw: {
      handlers: [
        mockGetNoteByIdHandler({ status: 'archived' }),
        mockPutNoteByIdHandler({ delayInfinite: true }),
      ],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await waitFor(async () => {
      if (globals?.viewport?.value === 'mobile1') {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: 'Unarchive',
          }),
        });
      } else {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Unarchive',
          }),
        );
      }
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

export const UnarchiveArchivedNote: Story = {
  parameters: UnarchiveArchivedNoteMobile.parameters,
  play: UnarchiveArchivedNoteMobile.play,
};

export const TrashingArchivedNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: UnarchiveArchivedNote.parameters,
  play: async ({ globals, canvas, userEvent }) => {
    await waitFor(async () => {
      if (globals?.viewport?.value === 'mobile1') {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: 'Trash',
          }),
        });
      } else {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Trash',
          }),
        );
      }
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
  parameters: UnarchiveArchivedNote.parameters,
  play: TrashingArchivedNoteMobile.play,
};

async function playBasicUpdateArchivedNote({
  globals,
  canvas,
  userEvent,
}: Readonly<{
  globals: Globals;
  canvas: Canvas;
  userEvent: UserEventObject;
}>) {
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

  if (globals?.viewport?.value === 'mobile1') {
    await userEvent.pointer({
      keys: '[TouchA]',
      target: canvas.getByRole('button', {
        name: 'Update note',
      }),
    });
  } else {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Update note',
      }),
    );
  }

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

  await waitFor(async () => {
    await expect(
      canvas.getByRole('button', {
        name: 'Updating note',
      }),
    ).toBeDisabled();
  });
}

export const UpdatingArchivedNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: {
    ...ArchivedNote.parameters,
    msw: {
      handlers: [
        mockGetNoteByIdHandler({ status: 'archived' }),
        mockPatchNoteByIdHandler({ delayInfinite: true }),
      ],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicUpdateArchivedNote({ globals, canvas, userEvent });
  },
};

export const UpdatingArchivedNote: Story = {
  parameters: UpdatingArchivedNoteMobile.parameters,
  play: UpdatingArchivedNoteMobile.play,
};

export const UpdateSuccessArchivedNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: ArchivedNote.parameters,
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicUpdateArchivedNote({ globals, canvas, userEvent });

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

export const UpdateSuccessArchivedNote: Story = {
  parameters: ArchivedNote.parameters,
  play: UpdateSuccessArchivedNoteMobile.play,
};

export const TrashedNoteMobile: Story = {
  globals: LoadingMobile.globals,
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
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByRole('button', {
          name: 'Info',
        }),
      });
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

    await userEvent.pointer({
      keys: '[TouchA]',
      target: canvas.getByRole('button', {
        name: 'Info',
      }),
    });

    await waitFor(async () => {
      await expect(
        canvas.getByText('Last edited • Feb, 01 2026'),
      ).not.toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Restore$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Delete/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Close$/,
        }),
      ).toBeVisible();
    });
  },
};

export const TrashedNoteMobileLg: Story = {
  globals: ActiveNoteMobileLg.globals,
  parameters: TrashedNoteMobile.parameters,
  play: async ({ canvas, userEvent }) => {
    await waitFor(async () => {
      await userEvent.pointer({
        keys: '[TouchA]',
        target: canvas.getByRole('button', {
          name: 'Info',
        }),
      });
    });

    await waitFor(async () => {
      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[0],
      ).toBeVisible();

      await expect(canvas.getByText('Status •')).not.toBeVisible();
      await expect(canvas.getAllByText('Trashed')[0]).not.toBeVisible();
      await expect(canvas.getAllByText('Trashed')[1]).toBeVisible();

      await expect(
        canvas.getAllByText('Last edited • Feb, 01 2026')[1],
      ).not.toBeVisible();
    });

    await userEvent.pointer({
      keys: '[TouchA]',
      target: canvas.getByRole('button', {
        name: 'Info',
      }),
    });

    await waitFor(async () => {
      await expect(
        canvas.getByText('Last edited • Feb, 01 2026'),
      ).not.toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Restore$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Delete$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Close$/,
        }),
      ).toBeVisible();
    });
  },
};

export const TrashedNote: Story = {
  parameters: TrashedNoteMobile.parameters,
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getByText(/^Trashed$/)).toBeVisible();

      await expect(
        canvas.getByText(/^Last edited • Feb, 01 2026$/),
      ).toBeVisible();
    });

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', {
          name: /^Fullscreen$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Restore$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Delete$/,
        }),
      ).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: /^Close$/,
        }),
      ).toBeVisible();
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

export const RestoringTrashedNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: {
    ...TrashedNote.parameters,
    msw: {
      handlers: [
        mockGetNoteByIdHandler({ status: 'trashed' }),
        mockPatchNoteByIdHandler({ delayInfinite: true }),
      ],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await waitFor(async () => {
      if (globals?.viewport?.value === 'mobile1') {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: 'Restore',
          }),
        });
      } else {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Restore',
          }),
        );
      }
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
  },
};

export const RestoringTrashedNote: Story = {
  parameters: RestoringTrashedNoteMobile.parameters,
  play: RestoringTrashedNoteMobile.play,
};

export const DeletingTrashedNoteMobile: Story = {
  globals: LoadingMobile.globals,
  parameters: {
    ...RestoringTrashedNote.parameters,
    msw: {
      handlers: [
        mockGetNoteByIdHandler({ status: 'trashed' }),
        mockDeleteNoteByIdHandler({ delayInfinite: true }),
      ],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await waitFor(async () => {
      if (globals?.viewport?.value === 'mobile1') {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: 'Delete',
          }),
        });
      } else {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Delete',
          }),
        );
      }
    });

    await waitFor(async () => {
      await expect(screen.getByText('Are you sure?')).toBeInTheDocument();

      await expect(
        screen.getByText('The note will be permanently deleted.'),
      ).toBeInTheDocument();

      if (globals?.viewport?.value === 'mobile1') {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: screen.getByRole('button', { name: 'Yes' }),
        });
      } else {
        await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
      }
    });

    await waitFor(async () => {
      await expect(screen.getByRole('button', { name: 'No' })).toBeDisabled();
      await expect(screen.getByRole('button', { name: 'Yes' })).toBeDisabled();
    });
  },
};

export const DeletingTrashedNote: Story = {
  parameters: DeletingTrashedNoteMobile.parameters,
  play: DeletingTrashedNoteMobile.play,
};

export const NotFoundErrorMobile: Story = {
  globals: LoadingMobile.globals,
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

export const NotFoundError: Story = {
  parameters: NotFoundErrorMobile.parameters,
  play: NotFoundErrorMobile.play,
};

export const ServerErrorMobile: Story = {
  globals: LoadingMobile.globals,
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

export const ServerError: Story = {
  parameters: ServerErrorMobile.parameters,
  play: ServerErrorMobile.play,
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
