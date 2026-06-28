import type { Meta, StoryObj } from '@storybook/react-vite';
import { withRouter } from 'storybook-addon-remix-react-router';

import ButtonLinkComponent from './ButtonLink';

const meta = {
  title: 'Atomics/ButtonLink',
  component: ButtonLinkComponent,
  parameters: {
    layout: 'centered',
  },
  decorators: [withRouter],
} satisfies Meta<typeof ButtonLinkComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ButtonLink: Story = {
  args: {
    to: '/',
    variant: 'contained',
    children: 'Button link',
  },
};
