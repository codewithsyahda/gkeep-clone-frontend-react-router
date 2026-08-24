import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster } from 'sonner';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import type { Canvas, Globals } from 'storybook/internal/csf';
import { expect, waitFor, type UserEventObject } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import { mockSignUpHandler } from '.storybook/parameters/msw/authHandlers';
import SignupPageContentComponent from './SignupPageContent';

const meta = {
  title: 'Pages/SignupPageContent',
  component: SignupPageContentComponent,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [mockSignUpHandler()],
    },
    reactRouter: reactRouterParameters({
      routing: {
        path: '/*',
      },
    }),
  },
  decorators: [
    reactQueryDecorator,
    (Story) => (
      <>
        <Story />
        <Toaster duration={Infinity} />
      </>
    ),
    withRouter,
  ],
} satisfies Meta<typeof SignupPageContentComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultMobile: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
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

export const Default: Story = {
  play: DefaultMobile.play,
};

export const FormEmptyErrorMobile: Story = {
  globals: DefaultMobile.globals,
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

export const FormEmptyError: Story = {
  play: FormEmptyErrorMobile.play,
};

export const FullnameWhitespaceOnlyErrorMobile: Story = {
  globals: DefaultMobile.globals,
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

export const FullnameWhitespaceOnlyError: Story = {
  play: FullnameWhitespaceOnlyErrorMobile.play,
};

export const FullnameMaxLengthErrorMobile: Story = {
  globals: DefaultMobile.globals,
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

export const FullnameMaxLengthError: Story = {
  play: FullnameMaxLengthErrorMobile.play,
};

export const PasswordMinLengthErrorMobile: Story = {
  globals: DefaultMobile.globals,
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

export const PasswordMinLengthError: Story = {
  play: PasswordMinLengthErrorMobile.play,
};

async function playBasicSignup({
  globals,
  canvas,
  userEvent,
}: Readonly<{
  globals: Globals;
  canvas: Canvas;
  userEvent: UserEventObject;
}>) {
  await waitFor(
    async () => {
      await userEvent.type(canvas.getByLabelText('Fullname'), 'Foo Doe');
      await userEvent.type(canvas.getByLabelText('Email'), 'foo@doe.com');
      await userEvent.type(canvas.getByLabelText('Password'), '12345678');

      if (globals?.viewport?.value === 'mobile1') {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: 'Create account',
          }),
        });
      } else {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Create account',
          }),
        );
      }

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
    { timeout: 3000 },
  );
}

export const SigningUpMobile: Story = {
  globals: DefaultMobile.globals,
  parameters: {
    msw: {
      handlers: [mockSignUpHandler({ delayInfinite: true })],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicSignup({ globals, canvas, userEvent });
  },
};

export const SigningUp: Story = {
  parameters: SigningUpMobile.parameters,
  play: SigningUpMobile.play,
};

export const SignupSuccessMobile: Story = {
  globals: DefaultMobile.globals,
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicSignup({ globals, canvas, userEvent });

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

export const SignupSuccess: Story = {
  play: SignupSuccessMobile.play,
};

async function playBasicSignupError({
  canvas,
}: Readonly<{
  canvas: Canvas;
}>) {
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
}

export const SignupClientErrorMobile: Story = {
  globals: DefaultMobile.globals,
  parameters: {
    msw: {
      handlers: [mockSignUpHandler({ errorStatus: '422' })],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicSignup({ globals, canvas, userEvent });

    await playBasicSignupError({ canvas });

    await waitFor(async () => {
      await expect(canvas.getByText('User is already exist')).toBeVisible();
    });
  },
};

export const SignupClientError: Story = {
  parameters: SignupClientErrorMobile.parameters,
  play: SignupClientErrorMobile.play,
};

export const SignupServerErrorMobile: Story = {
  globals: DefaultMobile.globals,
  parameters: {
    msw: {
      handlers: [mockSignUpHandler({ errorStatus: '500' })],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicSignup({ globals, canvas, userEvent });

    await playBasicSignupError({ canvas });

    await waitFor(async () => {
      await expect(canvas.getByText('Failed to create user')).toBeVisible();
    });
  },
};

export const SignupServerError: Story = {
  parameters: SignupServerErrorMobile.parameters,
  play: SignupServerErrorMobile.play,
};
