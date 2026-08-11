import * as cookie from 'cookie';
import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';

const signOutHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-out`,
  async () => {
    await delay('real');

    return HttpResponse.json(
      { success: true },
      {
        headers: {
          'content-type': 'application/json',
          'set-cookie': cookie.stringifySetCookie({
            name: 'auth.user_id',
            value: '',
            maxAge: 0,
          }),
        },
      },
    );
  },
);

export default signOutHandler;
