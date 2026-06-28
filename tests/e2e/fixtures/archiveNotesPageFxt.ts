import { test } from '@playwright/test';

import ArchiveNotesPOM from '../page-object-models/archiveNotesPOM';

const archiveNotesPageFxt = test.extend<{
  archiveNotesPageFxt: ArchiveNotesPOM;
}>({
  archiveNotesPageFxt: async ({ page, isMobile }, use) => {
    const archiveNotesPOM = new ArchiveNotesPOM(page, isMobile);
    await use(archiveNotesPOM);
  },
});

export default archiveNotesPageFxt;
