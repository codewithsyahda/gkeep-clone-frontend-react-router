import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster } from 'sonner';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import type { Canvas, Globals } from 'storybook/internal/csf';
import { expect, waitFor, type UserEventObject } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import { mockSignInHandler } from '.storybook/parameters/msw/authHandlers';
import SigninPageContentComponent from './SigninPageContent';

const meta = {
  title: 'Pages/SigninPageContent',
  component: SigninPageContentComponent,
  parameters: {
    layout: 'fullscreen',
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
} satisfies Meta<typeof SigninPageContentComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultMobile: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getByText('Welcome back')).toBeVisible();

      await expect(
        canvas.getByText('Enter your email below to sign in to your account'),
      ).toBeVisible();

      await expect(canvas.getByLabelText('Email')).toBeVisible();
      await expect(canvas.getByLabelText('Password')).toBeVisible();

      await expect(
        canvas.getByRole('button', {
          name: 'Sign in',
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
            name: 'Sign in',
          }),
        );
      },
      { timeout: 3000 },
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Email format must be valid.'),
      ).toBeVisible();

      await expect(
        canvas.getByText('Password must not be empty.'),
      ).toBeVisible();
    });
  },
};

export const FormEmptyError: Story = {
  play: FormEmptyErrorMobile.play,
};

async function playBasicSignin({
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
      await userEvent.type(canvas.getByLabelText('Email'), 'foo@doe.com');
      await userEvent.type(canvas.getByLabelText('Password'), '12345678');

      if (globals?.viewport?.value === 'mobile1') {
        await userEvent.pointer({
          keys: '[TouchA]',
          target: canvas.getByRole('button', {
            name: 'Sign in',
          }),
        });
      } else {
        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Sign in',
          }),
        );
      }
    },
    { timeout: 3000 },
  );

  await waitFor(async () => {
    await expect(canvas.getByLabelText('Email')).toBeDisabled();
    await expect(canvas.getByLabelText('Password')).toBeDisabled();

    await expect(
      canvas.getByRole('button', {
        name: 'Signing in',
      }),
    ).toBeDisabled();
  });
}

export const SigningInMobile: Story = {
  globals: DefaultMobile.globals,
  parameters: {
    msw: {
      handlers: [mockSignInHandler({ delayInfinite: true })],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicSignin({ globals, canvas, userEvent });
  },
};

export const SigningIn: Story = {
  parameters: SigningInMobile.parameters,
  play: SigningInMobile.play,
};

export const SigninSuccessMobile: Story = {
  globals: DefaultMobile.globals,
  parameters: {
    msw: {
      handlers: [mockSignInHandler()],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicSignin({ globals, canvas, userEvent });

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Email')).toBeDisabled();
      await expect(canvas.getByLabelText('Password')).toBeDisabled();

      await expect(
        canvas.getByRole('button', {
          name: 'Signed in',
        }),
      ).toBeDisabled();
    });
  },
};

export const SigninSuccess: Story = {
  parameters: SigninSuccessMobile.parameters,
  play: SigninSuccessMobile.play,
};

async function playBasicSigninError({
  canvas,
}: Readonly<{
  canvas: Canvas;
}>) {
  await waitFor(async () => {
    await expect(canvas.getByLabelText('Email')).not.toBeDisabled();
    await expect(canvas.getByLabelText('Password')).not.toBeDisabled();

    await expect(canvas.getByLabelText('Email')).toHaveValue('foo@doe.com');
    await expect(canvas.getByLabelText('Password')).toHaveValue('12345678');

    await expect(
      canvas.getByRole('button', {
        name: 'Sign in',
      }),
    ).not.toBeDisabled();
  });
}

export const SigninClientErrorMobile: Story = {
  globals: DefaultMobile.globals,
  parameters: {
    msw: {
      handlers: [mockSignInHandler({ errorStatus: '401' })],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicSignin({ globals, canvas, userEvent });

    await playBasicSigninError({ canvas });

    await waitFor(async () => {
      await expect(canvas.getByText('Invalid email or password')).toBeVisible();
    });
  },
};

export const SigninClientError: Story = {
  parameters: SigninClientErrorMobile.parameters,
  play: SigninClientErrorMobile.play,
};

export const SigninServerErrorMobile: Story = {
  globals: DefaultMobile.globals,
  parameters: {
    msw: {
      handlers: [mockSignInHandler({ errorStatus: '500' })],
    },
  },
  play: async ({ globals, canvas, userEvent }) => {
    await playBasicSignin({ globals, canvas, userEvent });

    await playBasicSigninError({ canvas });

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Email')).not.toBeDisabled();
      await expect(canvas.getByLabelText('Password')).not.toBeDisabled();

      await expect(canvas.getByLabelText('Email')).toHaveValue('foo@doe.com');

      await expect(canvas.getByLabelText('Password')).toHaveValue('12345678');

      await expect(
        canvas.getByRole('button', {
          name: 'Sign in',
        }),
      ).not.toBeDisabled();
    });

    await waitFor(async () => {
      await expect(canvas.getByText('Something went wrong')).toBeVisible();
    });
  },
};

export const SigninServerError: Story = {
  parameters: SigninServerErrorMobile.parameters,
  play: SigninServerErrorMobile.play,
};
