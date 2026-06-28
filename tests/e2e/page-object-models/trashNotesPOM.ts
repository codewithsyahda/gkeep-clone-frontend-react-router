import { type Page } from '@playwright/test';

import NotesPOM from './notesPOM';

class TrashNotesPOM extends NotesPOM {
  constructor(
    public readonly page: Page,
    public readonly isMobile: boolean,
  ) {
    super(page, isMobile);
  }

  async goTo() {
    await this.page.goto('/trash');
  }
}

export default TrashNotesPOM;
