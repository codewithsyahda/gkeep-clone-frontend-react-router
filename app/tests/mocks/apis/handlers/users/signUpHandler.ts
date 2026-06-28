import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { users as usersDB, type TUserEntity } from '../../fakeDB/users';

const signUpHandler = http.post(
  `${envConfig.api.baseUrl}/auth/sign-up/email`,
  async ({ request }) => {
    await delay('real');

    const { name, email, password } = (await request.clone().json()) as {
      name: string;
      email: string;
      password: string;
    };

    const sanitizedName = name.trim().replaceAll(/\s+/g, ' ');
    const sanitizedEmail = email.trim().replaceAll(/\s+/g, ' ');

    if (sanitizedName.toLowerCase() === '[test 500]') {
      return HttpResponse.json(
        {
          message: 'Failed to create user',
          code: 'FAILED_TO_CREATE_USER',
        },
        { status: 422 },
      );
    }

    if (usersDB.some((a) => a.email === email.toLowerCase())) {
      return HttpResponse.json(
        {
          message: 'User is already exist',
          code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
        },
        { status: 422 },
      );
    }

    const newUser: TUserEntity = {
      id: `id-user-${Date.now()}`,
      name: sanitizedName,
      email: sanitizedEmail,
      password,
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usersDB.push(newUser);

    const { password: _password, ...userResponseData } = newUser;

    return HttpResponse.json({
      token: null,
      user: userResponseData,
    });
  },
);

export default signUpHandler;
