import { test } from '@playwright/test';

import GeneralPOM from '../page-object-models/generalPOM';

const generalPageFxt = test.extend<{
  generalPageFxt: GeneralPOM;
}>({
  generalPageFxt: async ({ page, isMobile }, use) => {
    const generalPOM = new GeneralPOM(page, isMobile);
    await use(generalPOM);
  },
});

export default generalPageFxt;
