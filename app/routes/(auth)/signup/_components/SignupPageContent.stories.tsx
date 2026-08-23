import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster } from 'sonner';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import {
  mockGetSessionHandler,
  mockSignUpHandler,
} from '.storybook/parameters/msw/authHandlers';
import SignupPageContentComponent from './SignupPageContent';

const meta = {
  title: 'Pages/SignupPageContent',
  component: SignupPageContentComponent,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [mockGetSessionHandler({ errorStatus: '401' })],
    },
    reactRouter: reactRouterParameters({
      location: {
        path: '/signup',
      },
      routing: {
        path: '/*',
      },
    }),
  },
  decorators: [
    reactQueryDecorator,
    (Story) => (
      <>
        <div className="-m-4 w-screen">
          <Story />
        </div>
        <Toaster duration={Infinity} />
      </>
    ),
    withRouter,
  ],
} satisfies Meta<typeof SignupPageContentComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getByText('Create your account')).toBeVisible();

      await expect(
        canvas.getByText('Enter your email below to create your account'),
      ).toBeVisible();

      await expect(canvas.getByLabelText('Fullname')).toBeVisible();
      await expect(canvas.getByLabelText('Email')).toBeVisible();
      await expect(canvas.getByLabelText('Password')).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: 'Create account',
        }),
      ).toBeVisible();
    });
  },
};

export const FormEmptyError: Story = {
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Create account',
          }),
        );
      },
      { timeout: 3000 },
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Fullname must not be empty.'),
      ).toBeVisible();

      await expect(
        canvas.getByText('Email format must be valid.'),
      ).toBeVisible();

      await expect(
        canvas.getByText('Password must be at least 8 chars.'),
      ).toBeVisible();
    });
  },
};

export const FullnameWhitespaceOnlyError: Story = {
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByLabelText('Fullname'), '      ');
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Create account',
      }),
    );

    await expect(canvas.getByText('Fullname must not be empty.')).toBeVisible();
  },
};

export const FullnameMaxLengthError: Story = {
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(
          canvas.getByLabelText('Fullname'),
          [...new Array(129)].map(() => 'A').join(''),
        );
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Create account',
      }),
    );

    await expect(
      canvas.getByText('Fullname must not more than 128 chars.'),
    ).toBeVisible();
  },
};

export const PasswordMinLengthError: Story = {
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByLabelText('Password'), '1234567');
      },
      { timeout: 3000 },
    );

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Create account',
      }),
    );

    await expect(
      canvas.getByText('Password must be at least 8 chars.'),
    ).toBeVisible();
  },
};

export const SigningUp: Story = {
  parameters: {
    ...meta.parameters,
    msw: {
      handlers: [
        mockGetSessionHandler({ errorStatus: '401' }),
        mockSignUpHandler({ delayInfinite: true }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByLabelText('Fullname'), 'Foo Doe');
        await userEvent.type(canvas.getByLabelText('Email'), 'foo@doe.com');
        await userEvent.type(canvas.getByLabelText('Password'), '12345678');

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Create account',
          }),
        );
      },
      { timeout: 3000 },
    );

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Fullname')).toBeDisabled();
      await expect(canvas.getByLabelText('Email')).toBeDisabled();
      await expect(canvas.getByLabelText('Password')).toBeDisabled();

      await expect(
        canvas.getByRole('button', {
          name: 'Creating',
        }),
      ).toBeDisabled();
    });
  },
};

export const SignupSuccess: Story = {
  parameters: {
    ...meta.parameters,
    msw: {
      handlers: [
        mockGetSessionHandler({ errorStatus: '401' }),
        mockSignUpHandler(),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByLabelText('Fullname'), 'Foo Doe');
        await userEvent.type(canvas.getByLabelText('Email'), 'foo@doe.com');
        await userEvent.type(canvas.getByLabelText('Password'), '12345678');

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Create account',
          }),
        );
      },
      { timeout: 3000 },
    );

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Fullname')).toBeDisabled();
      await expect(canvas.getByLabelText('Email')).toBeDisabled();
      await expect(canvas.getByLabelText('Password')).toBeDisabled();

      await expect(
        canvas.getByRole('button', {
          name: 'Creating',
        }),
      ).toBeDisabled();
    });

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Fullname')).toBeDisabled();
      await expect(canvas.getByLabelText('Email')).toBeDisabled();
      await expect(canvas.getByLabelText('Password')).toBeDisabled();

      await expect(
        canvas.getByRole('button', {
          name: 'Created',
        }),
      ).toBeDisabled();
    });

    await waitFor(async () => {
      await expect(canvas.getByText('Signing up is successful')).toBeVisible();
    });
  },
};

export const SignupClientError: Story = {
  parameters: {
    ...meta.parameters,
    msw: {
      handlers: [
        mockGetSessionHandler({ errorStatus: '401' }),
        mockSignUpHandler({ errorStatus: '422' }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByLabelText('Fullname'), 'Foo Doe');
        await userEvent.type(canvas.getByLabelText('Email'), 'foo@doe.com');
        await userEvent.type(canvas.getByLabelText('Password'), '12345678');

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Create account',
          }),
        );
      },
      { timeout: 3000 },
    );

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Fullname')).toBeDisabled();
      await expect(canvas.getByLabelText('Email')).toBeDisabled();
      await expect(canvas.getByLabelText('Password')).toBeDisabled();

      await expect(
        canvas.getByRole('button', {
          name: 'Creating',
        }),
      ).toBeDisabled();
    });

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Fullname')).not.toBeDisabled();
      await expect(canvas.getByLabelText('Email')).not.toBeDisabled();
      await expect(canvas.getByLabelText('Password')).not.toBeDisabled();

      await expect(canvas.getByLabelText('Fullname')).toHaveValue('Foo Doe');
      await expect(canvas.getByLabelText('Email')).toHaveValue('foo@doe.com');
      await expect(canvas.getByLabelText('Password')).toHaveValue('12345678');

      await expect(
        canvas.getByRole('button', {
          name: 'Create account',
        }),
      ).not.toBeDisabled();
    });

    await waitFor(async () => {
      await expect(canvas.getByText('User is already exist')).toBeVisible();
    });
  },
};

export const SignupServerError: Story = {
  parameters: {
    ...meta.parameters,
    msw: {
      handlers: [
        mockGetSessionHandler({ errorStatus: '401' }),
        mockSignUpHandler({ errorStatus: '500' }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByLabelText('Fullname'), 'Foo Doe');
        await userEvent.type(canvas.getByLabelText('Email'), 'foo@doe.com');
        await userEvent.type(canvas.getByLabelText('Password'), '12345678');

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Create account',
          }),
        );
      },
      { timeout: 3000 },
    );

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Fullname')).toBeDisabled();
      await expect(canvas.getByLabelText('Email')).toBeDisabled();
      await expect(canvas.getByLabelText('Password')).toBeDisabled();

      await expect(
        canvas.getByRole('button', {
          name: 'Creating',
        }),
      ).toBeDisabled();
    });

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Fullname')).not.toBeDisabled();
      await expect(canvas.getByLabelText('Email')).not.toBeDisabled();
      await expect(canvas.getByLabelText('Password')).not.toBeDisabled();

      await expect(canvas.getByLabelText('Fullname')).toHaveValue('Foo Doe');
      await expect(canvas.getByLabelText('Email')).toHaveValue('foo@doe.com');
      await expect(canvas.getByLabelText('Password')).toHaveValue('12345678');

      await expect(
        canvas.getByRole('button', {
          name: 'Create account',
        }),
      ).not.toBeDisabled();
    });

    await waitFor(async () => {
      await expect(canvas.getByText('Failed to create user')).toBeVisible();
    });
  },
};
