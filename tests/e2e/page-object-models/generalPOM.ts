import { expect, type Locator, type Page } from '@playwright/test';
import { tapOrClick as tapOrClickFn } from '../helpers/interaction';

class GeneralPOM {
  constructor(
    public readonly page: Page,
    public readonly isMobile: boolean,
  ) {}

  protected async tapOrClick(locator: Locator) {
    await tapOrClickFn({ isMobile: this.isMobile, locator });
  }

  async closeSnackbar() {
    await expect(
      this.page.getByRole('button', { name: 'Close snackbar' }),
    ).toHaveCount(1);

    await expect(
      this.page.getByRole('button', { name: 'Close snackbar' }),
    ).toBeInViewport({ ratio: 1 });

    await this.tapOrClick(
      this.page.getByRole('button', { name: 'Close snackbar' }),
    );

    await expect(
      this.page.getByRole('button', { name: 'Close snackbar' }),
    ).toHaveCount(0);

    await expect(
      this.page.getByRole('button', { name: 'Close snackbar' }),
    ).not.toBeInViewport();
  }
}

export default GeneralPOM;
