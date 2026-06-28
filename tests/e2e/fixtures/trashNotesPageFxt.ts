import { test } from '@playwright/test';

import TrashNotesPOM from '../page-object-models/trashNotesPOM';

const trashNotesPageFxt = test.extend<{
  trashNotesPageFxt: TrashNotesPOM;
}>({
  trashNotesPageFxt: async ({ page, isMobile }, use) => {
    const trashNotesPOM = new TrashNotesPOM(page, isMobile);
    await use(trashNotesPOM);
  },
});

export default trashNotesPageFxt;
