import type { Meta, StoryObj } from '@storybook/react-vite';

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
  },
};
