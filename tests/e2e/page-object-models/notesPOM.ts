import { expect, type Locator, type Page } from '@playwright/test';

import GeneralPOM from './generalPOM';

abstract class NotesPOM extends GeneralPOM {
  public readonly appTopBar: {
    getSearchInput: () => Locator;
    sidebarButtons: {
      mobile: {
        getShowButton: () => Locator;
      };
    };
  };

  public readonly userMenu: {
    getOpenButton: () => Locator;
    getSignOutButton: () => Locator;
  };

  constructor(
    public readonly page: Page,
    public readonly isMobile: boolean,
  ) {
    super(page, isMobile);

    this.appTopBar = {
      getSearchInput: () => this.page.getByPlaceholder('Search'),
      sidebarButtons: {
        mobile: {
          getShowButton: () =>
            this.page.getByRole('button', {
              name: 'Show the sidebar',
            }),
        },
      },
    };

    this.userMenu = {
      getOpenButton: () =>
        this.page.getByRole('button', { name: 'Open user menu' }),
      getSignOutButton: () =>
        this.page.getByRole('button', { name: 'Sign out' }),
    };
  }

  async goToActiveNotePage() {
    if (this.isMobile) {
      await this.appTopBar.sidebarButtons.mobile.getShowButton().tap();
    }

    await this.tapOrClick(this.page.getByRole('link', { name: 'Active' }));

    await expect(this.page).toHaveURL('/');
  }

  async goToArchiveNotePage() {
    if (this.isMobile) {
      await this.appTopBar.sidebarButtons.mobile.getShowButton().tap();
    }

    await this.tapOrClick(this.page.getByRole('link', { name: 'Archive' }));

    await expect(this.page).toHaveURL('/archive');
  }

  async goToTrashNotePage() {
    if (this.isMobile) {
      await this.appTopBar.sidebarButtons.mobile.getShowButton().tap();
    }

    await this.tapOrClick(this.page.getByRole('link', { name: 'Trash' }));

    await expect(this.page).toHaveURL('/trash');
  }
}

export default NotesPOM;
