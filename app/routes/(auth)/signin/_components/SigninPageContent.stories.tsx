import type { Meta, StoryObj } from '@storybook/react-vite';
import * as cookie from 'cookie';
import { delay, http, HttpResponse } from 'msw';
import { Toaster } from 'sonner';
import {
  reactRouterParameters,
  withRouter,
} from 'storybook-addon-remix-react-router';
import { expect, waitFor } from 'storybook/test';

import reactQueryDecorator from '.storybook/decorators/reactQuery';
import envConfig from '~/configs/envs';
import { getSessionHandler } from '../../signup/_components/SignupPageContent.stories';
import SigninPageContentComponent from './SigninPageContent';

const meta = {
  title: 'Pages/SigninPageContent',
  component: SigninPageContentComponent,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [getSessionHandler],
    },
    reactRouter: reactRouterParameters({
      location: {
        path: '/signin',
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
} satisfies Meta<typeof SigninPageContentComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
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

export const FormEmptyError: Story = {
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

export const SigningIn: Story = {
  parameters: {
    ...meta.parameters,
    msw: {
      handlers: [
        getSessionHandler,
        http.post(`${envConfig.api.baseUrl}/auth/sign-in/email`, async () => {
          await delay('infinite');
        }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByLabelText('Email'), 'foo@doe.com');
        await userEvent.type(canvas.getByLabelText('Password'), '12345678');

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Sign in',
          }),
        );
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
  },
};

export const SigninSuccess: Story = {
  parameters: {
    ...meta.parameters,
    msw: {
      handlers: [
        http.get(
          `${envConfig.api.baseUrl}/auth/get-session`,
          async ({ cookies }) => {
            await delay('real');

            const session = cookies['auth.is_signed_in'];

            if (session) {
              return HttpResponse.json(
                {
                  data: {
                    session: {
                      id: 'id-user-1',
                      name: 'Foo Doe',
                      email: 'foo@doe.com',
                      emailVerified: false,
                      image: null,
                      createdAt: new Date(2026, 0, 1),
                      updatedAt: new Date(2026, 0, 1),
                    },
                  },
                },
                {
                  headers: {
                    'content-type': 'application/json',
                    'set-cookie': cookie.stringifySetCookie({
                      name: 'auth.is_signed_in',
                      value: '',
                      maxAge: 0,
                    }),
                  },
                },
              );
            }

            return HttpResponse.json(
              {
                error: {
                  message: 'Please sign in first',
                },
              },
              {
                status: 401,
              },
            );
          },
        ),
        http.post(`${envConfig.api.baseUrl}/auth/sign-in/email`, async () => {
          await delay('real');
          return HttpResponse.json(
            {
              data: {
                user: {
                  id: 'id-user-1',
                  name: 'Foo Doe',
                  email: 'foo@doe.com',
                  emailVerified: false,
                  image: null,
                  createdAt: new Date(2026, 0, 1),
                  updatedAt: new Date(2026, 0, 1),
                },
              },
            },
            {
              headers: {
                'content-type': 'application/json',
                'set-cookie': cookie.stringifySetCookie({
                  name: 'auth.is_signed_in',
                  value: 'true',
                }),
              },
            },
          );
        }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByLabelText('Email'), 'foo@doe.com');
        await userEvent.type(canvas.getByLabelText('Password'), '12345678');

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Sign in',
          }),
        );
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

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Email')).toBeDisabled();
      await expect(canvas.getByLabelText('Password')).toBeDisabled();

      await expect(
        canvas.getByRole('button', {
          name: 'Signed in',
        }),
      ).toBeDisabled();
    });

    await waitFor(async () => {
      await expect(canvas.getByText('Welcome back, Foo!')).toBeVisible();
    });
  },
};

export const SigninClientError: Story = {
  parameters: {
    ...meta.parameters,
    msw: {
      handlers: [
        getSessionHandler,
        http.post(`${envConfig.api.baseUrl}/auth/sign-in/email`, async () => {
          await delay('real');
          return HttpResponse.json(
            {
              error: {
                message: 'Invalid email or password',
              },
            },
            { status: 401 },
          );
        }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByLabelText('Email'), 'foo@doe.com');
        await userEvent.type(canvas.getByLabelText('Password'), '12345678');

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Sign in',
          }),
        );
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
      await expect(canvas.getByText('Invalid email or password')).toBeVisible();
    });
  },
};

export const SigninServerError: Story = {
  parameters: {
    ...meta.parameters,
    msw: {
      handlers: [
        getSessionHandler,
        http.post(`${envConfig.api.baseUrl}/auth/sign-in/email`, async () => {
          await delay('real');
          return HttpResponse.json(
            {
              error: {
                message: 'Something went wrong',
              },
            },
            { status: 500 },
          );
        }),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      async () => {
        await userEvent.type(canvas.getByLabelText('Email'), 'foo@doe.com');
        await userEvent.type(canvas.getByLabelText('Password'), '12345678');

        await userEvent.click(
          canvas.getByRole('button', {
            name: 'Sign in',
          }),
        );
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
