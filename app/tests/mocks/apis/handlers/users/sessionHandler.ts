import * as cookie from 'cookie';
import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { UsersDB } from '../../fakeDB/users';

const sessionHandler = http.get(
  `${envConfig.api.baseUrl}/auth/get-session`,
  async ({ cookies }) => {
    await delay('real');

    const users = UsersDB.getAll();

    if (envConfig.dev.mock.auth.signedIn) {
      const { password: _p, ...userSession } = users[0];

      return HttpResponse.json(
        {
          data: {
            session: userSession,
          },
        },
        {
          headers: {
            'content-type': 'application/json',
            'set-cookie': cookie.stringifySetCookie({
              name: 'auth.user_id',
              value: userSession.id,
            }),
          },
        },
      );
    }

    const userId = cookies['auth.user_id'];

    const user = users.find((u) => u.id === userId);

    if (user) {
      const { password: _p, ...userSession } = user;

      return HttpResponse.json({
        data: {
          session: userSession,
        },
      });
    }

    return HttpResponse.json(
      {
        error: {
          message: 'Please sign in first',
        },
      },
      {
        headers: {
          'content-type': 'application/json',
          'set-cookie': cookie.stringifySetCookie({
            name: 'auth.user_id',
            value: '',
            maxAge: 0,
          }),
        },
        status: 401,
      },
    );
  },
);

export default sessionHandler;
