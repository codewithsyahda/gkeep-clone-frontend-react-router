import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { Toaster } from 'sonner';
import { withRouter } from 'storybook-addon-remix-react-router';
import { expect, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import envConfig from '~/configs/envs';
import DialogCreateNoteComponent from './DialogCreateNote';

const meta = {
  title: 'Composites/DialogCreateNote',
  component: DialogCreateNoteComponent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    reactQueryDecorator,
    (Story) => (
      <>
        <Story />
        <Toaster duration={Infinity} />
      </>
    ),
    withRouter,
    (Story) => (
      <div className="min-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DialogCreateNoteComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
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

export const Creating: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(`${envConfig.api.baseUrl}/notes`, async () => {
          await delay('infinite');
        }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Title note' }),
      'Title by Storybook',
    );

    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Content note' }),
      'Content by Storybook',
    );

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Save',
      }),
    );

    await expect(
      canvas.getByRole('button', {
        name: 'Save',
      }),
    ).toBeDisabled();
  },
};

export const CreateNoteSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(`${envConfig.api.baseUrl}/notes`, async () => {
          await delay('real');
          return HttpResponse.json(
            {
              data: {
                note: {
                  id: `id-note-${Date.now()}`,
                  title: 'Title Note',
                  jsonContent: '{}',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  authorId: 'id-user-1',
                },
              },
            },
            { status: 201 },
          );
        }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Title note' }),
      'Title by Storybook',
    );

    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Content note' }),
      'Content by Storybook',
    );

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Save',
      }),
    );

    await expect(
      canvas.getByRole('button', {
        name: 'Save',
      }),
    ).toBeDisabled();

    await waitFor(async () => {
      await expect(canvas.getByText('Note created')).toBeVisible();
    });
  },
};
