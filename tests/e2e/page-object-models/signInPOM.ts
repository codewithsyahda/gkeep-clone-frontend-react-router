import { type Page } from '@playwright/test';

import GeneralPOM from './generalPOM';

class SigninPOM extends GeneralPOM {
  constructor(
    public readonly page: Page,
    public readonly isMobile: boolean,
  ) {
    super(page, isMobile);
  }

  async goTo() {
    await this.page.goto('/signin');
  }

  async signIn(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page
      .getByRole('textbox', {
        name: 'password',
      })
      .fill(password);

    await this.tapOrClick(this.page.getByRole('button', { name: 'Sign in' }));

    if (this.isMobile) {
      await this.closeSnackbar();
    }
  }
}

export default SigninPOM;
