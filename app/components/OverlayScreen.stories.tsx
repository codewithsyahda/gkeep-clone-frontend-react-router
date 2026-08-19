import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';

import OverlayScreenComponent from './OverlayScreen';

const meta = {
  title: 'Atomics/OverlayScreen',
  component: OverlayScreenComponent,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof OverlayScreenComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OverlayScreenMobile: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  args: {
    children: <span className="sr-only">Overlay mobile screen</span>,
    onPointerDown: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.pointer({
      keys: '[TouchA]',
      target: canvas.getByRole('button', {
        name: 'Overlay mobile screen',
      }),
    });

    await expect(args.onPointerDown).toHaveBeenCalled();
  },
};

export const OverlayScreen: Story = {
  args: {
    children: <span className="sr-only">Overlay screen</span>,
    onPointerDown: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Overlay screen',
      }),
    );

    await expect(args.onPointerDown).toHaveBeenCalled();
  },
};
