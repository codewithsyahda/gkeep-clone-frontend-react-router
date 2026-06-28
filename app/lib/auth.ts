import { createAuthClient } from 'better-auth/react';

import envConfig from '~/configs/envs';

export const authClient = createAuthClient({
  baseURL: `${envConfig.api.baseUrl}/auth`,
});
