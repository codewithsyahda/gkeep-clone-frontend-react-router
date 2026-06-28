import { test } from '@playwright/test';

import ActiveNotesPOM from '../page-object-models/activeNotesPOM';

const activeNotesPageFxt = test.extend<{
  activeNotesPageFxt: ActiveNotesPOM;
}>({
  activeNotesPageFxt: async ({ page, isMobile }, use) => {
    const activeNotesPOM = new ActiveNotesPOM(page, isMobile);
    await use(activeNotesPOM);
  },
});

export default activeNotesPageFxt;
