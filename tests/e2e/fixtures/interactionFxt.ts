import { test, type Locator } from '@playwright/test';

import { tapOrClick as tapOrClickFn } from '../helpers/interaction';

const interactionFxt = test.extend<{
  tapOrClick: (locator: Locator) => Promise<void>;
}>({
  tapOrClick: async ({ isMobile }, use) => {
    await use(async (locator) => {
      await tapOrClickFn(isMobile, locator);
    });
  },
});

export default interactionFxt;
