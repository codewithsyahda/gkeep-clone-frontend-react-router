import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { users as usersDB } from '../../fakeDB/users';

const signInHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-in/email`,
  async ({ request }) => {
    await delay('real');

    const { email, password } = (await request.clone().json()) as {
      email: string;
      password: string;
    };

    const user = usersDB.find((a) => a.email === email.toLowerCase());

    if (user?.password === password) {
      const { password: _password, ...userResponseData } = user;

      return new HttpResponse(
        {
          redirect: false,
          token: userResponseData.id,
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

    return HttpResponse.json(
      {
        message: 'Invalid email or password',
        code: 'INVALID_EMAIL_OR_PASSWORD',
      },
      { status: 401 },
    );
  },
);

export default signInHandler;
