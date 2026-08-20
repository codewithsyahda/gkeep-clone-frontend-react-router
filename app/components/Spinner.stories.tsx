import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import SpinnerComponent from './Spinner';

const meta = {
  title: 'Atomics/Spinner',
  component: SpinnerComponent,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SpinnerComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Spinner: Story = {
  args: {
    size: 36,
    label: 'Please wait',
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getByText(/^Please wait$/)).toBeVisible();
    });
  },
};
