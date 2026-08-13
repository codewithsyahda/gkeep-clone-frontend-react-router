import * as cookie from 'cookie';
import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';

export const getSessionHandler = http.get(
  `${envConfig.api.baseUrl}/auth/get-session`,
  async () => {
    await delay('real');
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
  },
);

export const getInvalidSessionHandler = http.get(
  `${envConfig.api.baseUrl}/auth/get-session`,
  async () => {
    await delay('real');
    return HttpResponse.json(
      {
        error: {
          message: 'Please sign in first',
        },
      },
      { status: 401 },
    );
  },
);

export const signUpLoadingHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-up/email`,
  async () => {
    await delay('infinite');
  },
);

export const signUpHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-up/email`,
  async () => {
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
      { status: 201 },
    );
  },
);

export const signUpClientErrorHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-up/email`,
  async () => {
    await delay('real');
    return HttpResponse.json(
      {
        error: {
          message: 'User is already exist',
        },
      },
      { status: 422 },
    );
  },
);

export const signUpServerErrorHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-up/email`,
  async () => {
    await delay('real');
    return HttpResponse.json(
      {
        error: {
          message: 'Failed to create user',
        },
      },
      { status: 500 },
    );
  },
);

export const signInLoadingHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-in/email`,
  async () => {
    await delay('infinite');
  },
);

export const signInClientErrorHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-in/email`,
  async () => {
    await delay('real');
    return HttpResponse.json(
      {
        error: {
          message: 'Invalid email or password',
        },
      },
      { status: 401 },
    );
  },
);

export const signInServerErrorHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-in/email`,
  async () => {
    await delay('real');
    return HttpResponse.json(
      {
        error: {
          message: 'Something went wrong',
        },
      },
      { status: 500 },
    );
  },
);

export const signOutLoadingHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-out`,
  async () => {
    await delay('infinite');
  },
);
