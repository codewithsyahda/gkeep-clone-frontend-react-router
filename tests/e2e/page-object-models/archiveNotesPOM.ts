import { type Page } from '@playwright/test';

import NotesPOM from './notesPOM';

class ArchiveNotesPOM extends NotesPOM {
  constructor(
    public readonly page: Page,
    public readonly isMobile: boolean,
  ) {
    super(page, isMobile);
  }

  async goTo() {
    await this.page.goto('/archive');
  }
}

export default ArchiveNotesPOM;
