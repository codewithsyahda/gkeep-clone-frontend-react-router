import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';

import ButtonOverlayComponent from './ButtonOverlay';

const meta = {
  title: 'Atomics/ButtonOverlay',
  component: ButtonOverlayComponent,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ButtonOverlayComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ButtonOverlay: Story = {
  args: {
    children: <span className="sr-only">Button overlay</span>,
    onClick: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Button overlay',
      }),
    );

    await expect(args.onClick).toHaveBeenCalled();
  },
};
