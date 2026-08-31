import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster } from 'sonner';
import type { Canvas, Globals } from 'storybook/internal/csf';
import { expect, fn, waitFor, type UserEventObject } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import { mockPostNoteHandler } from '.storybook/parameters/msw/notesHandlers';
import DialogCreateNoteComponent from './DialogCreateNote';

const meta = {
  title: 'Composites/DialogCreateNote',
  component: DialogCreateNoteComponent,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [mockPostNoteHandler()],
    },
  },
  args: {
    onClose: fn(),
  },
  decorators: [
    reactQueryDecorator,
    (Story) => (
      <>
        <Story />
        <Toaster duration={Infinity} />
      </>
    ),
  ],
} satisfies Meta<typeof DialogCreateNoteComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultMobile: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
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

export const Default: Story = {
  play: DefaultMobile.play,
};

export const FocusTrap: Story = {
  play: async ({ canvas, userEvent }) => {
    await waitFor(() => {
      expect(
        canvas.getByRole('textbox', {
          name: /^Title note$/,
        }),
      ).toHaveFocus();
    });

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
            name: /^Save$/,
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
            name: /^Save$/,
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

async function playBasicCreateNote({
  globals,
  canvas,
  userEvent,
}: Readonly<{
  globals: Globals;
  canvas: Canvas;
  userEvent: UserEventObject;
}>) {
  await userEvent.type(
    canvas.getByRole('textbox', { name: 'Title note' }),
    'Title by Storybook',
  );

  await userEvent.type(
    canvas.getByRole('textbox', { name: 'Content note' }),
    'Content by Storybook',
  );

  if (globals?.viewport?.value === 'mobile1') {
    await userEvent.pointer({
      keys: '[TouchA]',
      target: canvas.getByRole('button', {
        name: 'Save',
      }),
    });
  } else {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Save',
      }),
    );
  }

  await expect(
    canvas.getByRole('button', {
      name: 'Save',
    }),
  ).toBeDisabled();
}

export const CreatingMobile: Story = {
  globals: DefaultMobile.globals,
  parameters: {
    msw: {
      handlers: [mockPostNoteHandler({ delayInfinite: true })],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicCreateNote({ globals, canvas, userEvent });
  },
};

export const Creating: Story = {
  parameters: CreatingMobile.parameters,
  play: CreatingMobile.play,
};

export const CreateNoteSuccessMobile: Story = {
  globals: DefaultMobile.globals,
  play: async ({ args, globals, canvas, userEvent }) => {
    await playBasicCreateNote({ globals, canvas, userEvent });

    await waitFor(async () => {
      await expect(canvas.getByText('Note created')).toBeVisible();
    });

    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const CreateNoteSuccess: Story = {
  play: CreateNoteSuccessMobile.play,
};

export const CreateNote400ErrorMobile: Story = {
  globals: DefaultMobile.globals,
  parameters: {
    msw: {
      handlers: [mockPostNoteHandler({ errorStatus: '400' })],
    },
  },
  play: async ({ args, globals, canvas, userEvent }) => {
    await playBasicCreateNote({ globals, canvas, userEvent });

    await waitFor(async () => {
      await expect(
        canvas.getByText('One or more body request fields are invalid.'),
      ).toBeVisible();
    });

    await expect(args.onClose).not.toHaveBeenCalledOnce();
  },
};

export const CreateNote400Error: Story = {
  parameters: CreateNote400ErrorMobile.parameters,
  play: CreateNote400ErrorMobile.play,
};

export const CreateNote500ErrorMobile: Story = {
  globals: DefaultMobile.globals,
  parameters: {
    msw: {
      handlers: [mockPostNoteHandler({ errorStatus: '500' })],
    },
  },
  play: async ({ args, globals, canvas, userEvent }) => {
    await playBasicCreateNote({ globals, canvas, userEvent });

    await waitFor(async () => {
      await expect(
        canvas.getByText('Cannot process the request.'),
      ).toBeVisible();
    });

    await expect(args.onClose).not.toHaveBeenCalledOnce();
  },
};

export const CreateNote500Error: Story = {
  parameters: CreateNote500ErrorMobile.parameters,
  play: CreateNote500ErrorMobile.play,
};
