import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import AppBrandLogoComponent from './AppBrandLogo';

const meta = {
  title: 'Atomics/AppBrandLogo',
  component: AppBrandLogoComponent,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof AppBrandLogoComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AppBrandLogo: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Notes App')).toBeInTheDocument();
  },
};
