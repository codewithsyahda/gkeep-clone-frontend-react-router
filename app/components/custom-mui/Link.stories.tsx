import type { Meta, StoryObj } from '@storybook/react-vite';
import { withRouter } from 'storybook-addon-remix-react-router';

import LinkComponent from './Link';

const meta = {
  title: 'Atomics/Link',
  component: LinkComponent,
  parameters: {
    layout: 'centered',
  },
  decorators: [withRouter],
} satisfies Meta<typeof LinkComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Link: Story = {
  args: {
    to: '/',
    children: 'Link',
  },
};
