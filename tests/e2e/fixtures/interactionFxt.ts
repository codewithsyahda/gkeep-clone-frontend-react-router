import { test, type Locator } from '@playwright/test';

import { tapOrClick as tapOrClickFn } from '../helpers/interaction';

const interactionFxt = test.extend<{
  tapOrClick: (
    locator: Locator,
    options?: {
      tapOptions?: Parameters<Locator['tap']>[0];
      clickOptions?: Parameters<Locator['click']>[0];
    },
  ) => Promise<void>;
}>({
  tapOrClick: async ({ isMobile }, use) => {
    await use(async (locator, options) => {
      if (isMobile) {
        await tapOrClickFn({
          isMobile: true,
          locator,
          options: {
            tapOptions: options?.tapOptions,
          },
        });
      } else {
        await tapOrClickFn({
          isMobile: false,
          locator,
          options: {
            clickOptions: options?.clickOptions,
          },
        });
      }
    });
  },
});

export default interactionFxt;
