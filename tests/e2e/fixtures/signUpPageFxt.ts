import { test } from '@playwright/test';

import SignupPOM from '../page-object-models/signUpPOM';

const signUpPageFxt = test.extend<{
  signUpPageFxt: SignupPOM;
}>({
  signUpPageFxt: async ({ page, isMobile }, use) => {
    const signUpPOM = new SignupPOM(page, isMobile);
    await use(signUpPOM);
  },
});

export default signUpPageFxt;
