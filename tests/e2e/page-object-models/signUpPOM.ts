import { type Page } from '@playwright/test';

import GeneralPOM from './generalPOM';

class SignupPOM extends GeneralPOM {
  constructor(
    public readonly page: Page,
    public readonly isMobile: boolean,
  ) {
    super(page, isMobile);
  }

  async goTo() {
    await this.page.goto('/signup');
  }

  async signUp({
    fullname,
    email,
    password,
  }: Readonly<{
    fullname: string;
    email: string;
    password: string;
  }>) {
    await this.page.getByLabel('Fullname').fill(fullname);
    await this.page.getByLabel('Email').fill(email);

    await this.page
      .getByRole('textbox', {
        name: 'password',
      })
      .fill(password);

    await this.tapOrClick(
      this.page.getByRole('button', {
        name: 'Create account',
      }),
    );

    if (this.isMobile) {
      await this.closeSnackbar();
    }
  }
}

export default SignupPOM;
