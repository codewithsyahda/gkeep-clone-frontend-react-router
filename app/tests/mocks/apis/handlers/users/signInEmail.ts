import * as cookie from 'cookie';
import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { UsersDB } from '../../fakeDB/users';

const signInEmailHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-in/email`,
  async ({ request }) => {
    await delay('real');

    const { email, password } = (await request.clone().json()) as {
      email: string;
      password: string;
    };

    const users = UsersDB.getAll();

    const user = users.find(
      (u) => u.email === email.toLowerCase() && u.password === password,
    );

    if (user) {
      const { password: _p, ...userResponseData } = user;

      return HttpResponse.json(
        {
          data: {
            user: userResponseData,
          },
        },
        {
          headers: {
            'content-type': 'application/json',
            'set-cookie': cookie.stringifySetCookie({
              name: 'auth.user_id',
              value: userResponseData.id,
            }),
          },
        },
      );
    }

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

export default signInEmailHandler;
