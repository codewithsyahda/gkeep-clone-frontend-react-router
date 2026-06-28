import { test } from '@playwright/test';

import SigninPOM from '../page-object-models/signInPOM';

const signInPageFxt = test.extend<{
  signInPageFxt: SigninPOM;
}>({
  signInPageFxt: async ({ page, isMobile }, use) => {
    const signInPOM = new SigninPOM(page, isMobile);
    await use(signInPOM);
  },
});

export default signInPageFxt;
