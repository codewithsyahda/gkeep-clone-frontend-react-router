import type { Locator } from '@playwright/test';

export async function tapOrClick(
  isMobile: boolean,
  locator: Locator,
  options?: {
    tapOptions?: Parameters<Locator['tap']>[0];
    clickOptions?: Parameters<Locator['click']>[0];
  },
) {
  if (isMobile) {
    await locator.tap(options?.tapOptions);
  } else {
    await locator.click(options?.clickOptions);
  }
}
