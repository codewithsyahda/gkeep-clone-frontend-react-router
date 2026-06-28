import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import InputPassword from './InputPassword';

const meta = {
  title: 'Atomics/InputPassword',
  component: InputPassword,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Password',
  },
} satisfies Meta<typeof InputPassword>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HiddenPassword: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText('Password'),
      'This is my password',
    );

    await expect(canvas.getByLabelText('Password')).toHaveValue(
      'This is my password',
    );
  },
};

export const DisplayedPassword: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByLabelText('display the password'));

    await userEvent.type(
      canvas.getByLabelText('Password'),
      'This is my password',
    );

    await expect(canvas.getByLabelText('Password')).toHaveValue(
      'This is my password',
    );
  },
};
