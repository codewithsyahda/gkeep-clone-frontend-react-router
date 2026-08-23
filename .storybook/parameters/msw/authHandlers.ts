import * as cookie from 'cookie';
import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';

export const mockGetSessionHandler = ({
  errorStatus,
}: Readonly<{
  errorStatus?: '401';
}> = {}) =>
  http.get(`${envConfig.api.baseUrl}/auth/get-session`, async () => {
    await delay('real');

    if (errorStatus === '401') {
      return HttpResponse.json(
        {
          error: {
            message: 'Please sign in first',
          },
        },
        { status: 401 },
      );
    }

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
            name: 'auth.user_id',
            value: 'id-user-1',
          }),
        },
      },
    );
  });

export const mockSignUpHandler = ({
  errorStatus,
  delayInfinite,
}: Readonly<{
  errorStatus?: '422' | '500';
  delayInfinite?: boolean;
}> = {}) =>
  http.post(`${envConfig.api.baseUrl}/auth/sign-up/email`, async () => {
    if (delayInfinite) {
      await delay('infinite');
    }

    await delay('real');

    if (errorStatus === '422') {
      return HttpResponse.json(
        {
          error: {
            message: 'User is already exist',
          },
        },
        { status: 422 },
      );
    }

    if (errorStatus === '500') {
      return HttpResponse.json(
        {
          error: {
            message: 'Failed to create user',
          },
        },
        { status: 500 },
      );
    }

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
      { status: 201 },
    );
  });

export const mockSignInHandler = ({
  errorStatus,
  delayInfinite,
}: Readonly<{
  errorStatus?: '401' | '500';
  delayInfinite?: boolean;
}> = {}) =>
  http.post(`${envConfig.api.baseUrl}/auth/sign-in/email`, async () => {
    if (delayInfinite) {
      await delay('infinite');
    }

    await delay('real');

    if (errorStatus === '401') {
      return HttpResponse.json(
        {
          error: {
            message: 'Invalid email or password',
          },
        },
        { status: 401 },
      );
    }

    if (errorStatus === '500') {
      return HttpResponse.json(
        {
          error: {
            message: 'Something went wrong',
          },
        },
        { status: 500 },
      );
    }

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
      { status: 201 },
    );
  });

export const signOutLoadingHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-out`,
  async () => {
    await delay('infinite');
  },
);
