import type { Locator } from '@playwright/test';

export type TapOrClickArgs =
  | Readonly<{
      isMobile: true;
      locator: Locator;
      options?: { tapOptions?: Parameters<Locator['tap']>[0] };
    }>
  | Readonly<{
      isMobile: false;
      locator: Locator;
      options?: { clickOptions?: Parameters<Locator['click']>[0] };
    }>;

export async function tapOrClick({
  isMobile,
  locator,
  options,
}: TapOrClickArgs) {
  if (isMobile) {
    await locator.tap(options?.tapOptions);
  } else {
    await locator.click(options?.clickOptions);
  }
}
