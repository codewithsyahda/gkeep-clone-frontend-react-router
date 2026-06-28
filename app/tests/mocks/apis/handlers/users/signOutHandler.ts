import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';

const signOutHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-out`,
  async () => {
    await delay('real');

    return new HttpResponse(
      { success: true },
      {
        headers: {
          'content-type': 'application/json',
          'set-cookie':
            'auth.user_id=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax',
        },
      },
    );
  },
);

export default signOutHandler;
