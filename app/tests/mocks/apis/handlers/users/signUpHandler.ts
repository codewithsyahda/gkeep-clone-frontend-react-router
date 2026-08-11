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
          error: {
            message: 'Failed to create user',
          },
        },
        { status: 500 },
      );
    }

    if (usersDB.some((u) => u.email === sanitizedEmail)) {
      return HttpResponse.json(
        {
          error: {
            message: 'User is already exist',
          },
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

    const { password: _p, ...userResponseData } = newUser;

    return HttpResponse.json(
      {
        data: {
          user: userResponseData,
        },
      },
      { status: 201 },
    );
  },
);

export default signUpHandler;
