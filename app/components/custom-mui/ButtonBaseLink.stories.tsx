import type { Meta, StoryObj } from '@storybook/react-vite';
import { withRouter } from 'storybook-addon-remix-react-router';

import ButtonBaseLinkComponent from './ButtonBaseLink';

const meta = {
  title: 'Atomics/ButtonBaseLink',
  component: ButtonBaseLinkComponent,
  parameters: {
    layout: 'centered',
  },
  decorators: [withRouter],
} satisfies Meta<typeof ButtonBaseLinkComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ButtonBaseLink: Story = {
  args: {
    to: '/',
    children: 'Button link',
  },
};
