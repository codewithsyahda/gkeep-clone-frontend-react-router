import { expect, type Locator, type Page } from '@playwright/test';

import NotesPOM from './notesPOM';

class ActiveNotesPOM extends NotesPOM {
  readonly getCreateNoteLink: () => Locator;

  readonly createNoteDialog: {
    getCloseButton: () => Locator;
  };

  constructor(
    public readonly page: Page,
    public readonly isMobile: boolean,
  ) {
    super(page, isMobile);

    this.getCreateNoteLink = () =>
      this.page.getByRole('link', { name: 'Create' });

    this.createNoteDialog = {
      getCloseButton: () =>
        this.page.getByRole('button', {
          name: 'Close',
          exact: true,
        }),
    };
  }

  async goTo() {
    await this.page.goto('/');
  }

  async createNote(title: string, content: string) {
    await this.tapOrClick(this.getCreateNoteLink());

    await expect(this.page).toHaveURL('/#create');

    await this.page.locator('div[data-placeholder="Title note"]').fill(title);
    await this.page.locator('.tiptap[contenteditable="true"]').fill(content);

    await this.tapOrClick(this.page.getByRole('button', { name: 'Save' }));

    if (this.isMobile) {
      await this.closeSnackbar();
    }

    await expect(this.createNoteDialog.getCloseButton()).not.toBeVisible();

    await expect(this.page).toHaveURL('/');
  }
}

export default ActiveNotesPOM;
