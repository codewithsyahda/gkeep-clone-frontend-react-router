import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { users as usersDB } from '../../fakeDB/users';

const sessionHandler = http.get(
  `${envConfig.api.baseUrl}/auth/get-session`,
  async ({ cookies }) => {
    await delay('real');

    const isSignedInByENV = envConfig.dev.mock.auth.signedIn;

    if (isSignedInByENV) {
      const { password: _password, ...userResponseData } = usersDB[0];

      return HttpResponse.json(
        {
          session: {
            id: 'session-uuid',
            token: 'session-token-xyz',
            userId: userResponseData.id,
            expiresAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0...',
          },
          user: userResponseData,
        },
        {
          headers: {
            'content-type': 'application/json',
            'set-cookie': `auth.user_id=${userResponseData.id}; Path=/; HttpOnly; Secure; SameSite=Lax`,
          },
        },
      );
    }

    const userId = cookies['auth.user_id'];

    const userData = usersDB.find((u) => u.id === userId);

    if (userId && userData) {
      const { password: _password, ...userResponseData } = userData;

      await delay('real');

      return HttpResponse.json({
        session: {
          id: 'session-uuid',
          token: 'session-token-xyz',
          userId: userResponseData.id,
          expiresAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0...',
        },
        user: userResponseData,
      });
    }

    return new HttpResponse(null, {
      headers: {
        'content-type': 'application/json',
        'set-cookie':
          'auth.user_id=; Max-Age=0 ;Path=/; HttpOnly; Secure; SameSite=Lax',
      },
    });
  },
);

export default sessionHandler;
