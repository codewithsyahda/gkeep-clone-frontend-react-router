import { expect, mergeTests } from '@playwright/test';

import activeNotesPageFxt from 'tests/e2e/fixtures/activeNotesPageFxt';
import archiveNotesPageFxt from 'tests/e2e/fixtures/archiveNotesPageFxt';
import interactionFxt from 'tests/e2e/fixtures/interactionFxt';
import signInPageFxt from 'tests/e2e/fixtures/signInPageFxt';
import signUpPageFxt from 'tests/e2e/fixtures/signUpPageFxt';
import ActiveNotesPOM from 'tests/e2e/page-object-models/activeNotesPOM';
import { resetDBTables } from '../../helpers/database';

const test = mergeTests(
  interactionFxt,
  signUpPageFxt,
  signInPageFxt,
  activeNotesPageFxt,
  archiveNotesPageFxt,
);

test.afterEach(async () => {
  await resetDBTables();
});

test.describe(() => {
  test.beforeEach(async ({ page, isMobile, signUpPageFxt, signInPageFxt }) => {
    await signUpPageFxt.goTo();

    const uuid = crypto.randomUUID();

    const user = {
      fullname: uuid,
      email: `${uuid}@email.com`,
    };

    await signUpPageFxt.signUp({
      ...user,
      password: '12345678',
    });

    await signInPageFxt.signIn(user.email, '12345678');

    const activeNotesPOM = new ActiveNotesPOM(page, isMobile);

    await activeNotesPOM.createNote('First Note', 'This is a first note.');
  });

  test.describe('Archives First Via Note Detail Dialog', () => {
    test('should update an archived note content via the note detail dialog', async ({
      page,
      tapOrClick,
      activeNotesPageFxt,
    }) => {
      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await tapOrClick(
        page
          .locator('[data-component="dialog-note-container"]')
          .getByRole('button', { name: 'Archive' }),
      );

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await activeNotesPageFxt.goToArchiveNotePage();

      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await page
        .locator('div[data-placeholder="Title note"]')
        .fill('Updated First Archived Note');

      await page
        .locator('.tiptap[contenteditable="true"]')
        .fill('This is an updated first archived note.');

      await tapOrClick(
        page.getByRole('button', {
          name: 'Update note',
        }),
      );

      await expect(
        page.getByRole('button', {
          name: 'Note updated',
        }),
      ).toBeVisible();

      await tapOrClick(page.getByRole('button', { name: /^Close$/ }));

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await expect(
        page.getByText(/^Updated First Archived Note$/),
      ).toBeVisible();

      await expect(
        page.getByText(/^This is an updated first archived note\.$/),
      ).toBeVisible();

      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await page
        .locator('div[data-placeholder="Title note"]')
        .fill('Second Updated First Archived Note');

      await page
        .locator('.tiptap[contenteditable="true"]')
        .fill('This is a second updated first archived note.');

      await tapOrClick(
        page.getByRole('button', {
          name: 'Update note',
        }),
      );

      await expect(
        page.getByRole('button', {
          name: 'Note updated',
        }),
      ).toBeVisible();

      await tapOrClick(page.getByRole('button', { name: /^Close$/ }));

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await expect(
        page.getByText(/^Second Updated First Archived Note$/),
      ).toBeVisible();

      await expect(
        page.getByText(/^This is a second updated first archived note\.$/),
      ).toBeVisible();
    });
  });

  test.describe('Unarchives First Via Note Detail Dialog', () => {
    test('should update an unarchived archived note content via the note detail dialog', async ({
      page,
      tapOrClick,
      activeNotesPageFxt,
      archiveNotesPageFxt,
    }) => {
      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await tapOrClick(
        page
          .locator('[data-component="dialog-note-container"]')
          .getByRole('button', { name: 'Archive' }),
      );

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await activeNotesPageFxt.goToArchiveNotePage();

      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await tapOrClick(
        page
          .locator('[data-component="dialog-note-container"]')
          .getByRole('button', { name: 'Unarchive' }),
      );

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await archiveNotesPageFxt.goToActiveNotePage();

      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await page
        .locator('div[data-placeholder="Title note"]')
        .fill('Updated First Archived Note');

      await page
        .locator('.tiptap[contenteditable="true"]')
        .fill('This is an updated first archived note.');

      await tapOrClick(
        page.getByRole('button', {
          name: 'Update note',
        }),
      );

      await expect(
        page.getByRole('button', {
          name: 'Note updated',
        }),
      ).toBeVisible();

      await tapOrClick(page.getByRole('button', { name: /^Close$/ }));

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await expect(
        page.getByText(/^Updated First Archived Note$/),
      ).toBeVisible();

      await expect(
        page.getByText(/^This is an updated first archived note\.$/),
      ).toBeVisible();

      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await page
        .locator('div[data-placeholder="Title note"]')
        .fill('Second Updated First Archived Note');

      await page
        .locator('.tiptap[contenteditable="true"]')
        .fill('This is a second updated first archived note.');

      await tapOrClick(
        page.getByRole('button', {
          name: 'Update note',
        }),
      );

      await expect(
        page.getByRole('button', {
          name: 'Note updated',
        }),
      ).toBeVisible();

      await tapOrClick(page.getByRole('button', { name: /^Close$/ }));

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await expect(
        page.getByText(/^Second Updated First Archived Note$/),
      ).toBeVisible();

      await expect(
        page.getByText(/^This is a second updated first archived note\.$/),
      ).toBeVisible();
    });
  });
});

test.describe('Updates Note Content After Searching Notes', () => {
  test.beforeEach(
    async ({
      page,
      tapOrClick,
      signUpPageFxt,
      signInPageFxt,
      activeNotesPageFxt,
    }) => {
      await signUpPageFxt.goTo();

      const uuid = crypto.randomUUID();

      const user = {
        fullname: uuid,
        email: `${uuid}@email.com`,
      };

      await signUpPageFxt.signUp({
        ...user,
        password: '12345678',
      });

      await signInPageFxt.signIn(user.email, '12345678');

      await activeNotesPageFxt.createNote('Note Title 1', 'This is a note 1.');
      await activeNotesPageFxt.createNote('Note Title 2', 'This is a note 2.');

      await tapOrClick(page.getByRole('button', { name: /^Trash$/ }).first());

      await expect(page.getByRole('button', { name: /^Trash$/ })).toHaveCount(
        1,
      );

      await tapOrClick(page.getByRole('button', { name: /^Trash$/ }));

      await activeNotesPageFxt.createNote('Note Title 3', 'This is a note 3.');
      await activeNotesPageFxt.createNote('Note Title 4', 'This is a note 4.');

      await tapOrClick(page.getByRole('button', { name: /^Archive/ }).first());

      await expect(page.getByRole('button', { name: /^Archive$/ })).toHaveCount(
        1,
      );

      await tapOrClick(page.getByRole('button', { name: /^Archive$/ }));

      await activeNotesPageFxt.createNote('Note Title 5', 'This is a note 5.');
      await activeNotesPageFxt.createNote('Note Title 6', 'This is a note 6.');
    },
  );

  test.describe('Archives First Via Note Detail Dialog', () => {
    test('should update an archived note content', async ({
      page,
      tapOrClick,
      activeNotesPageFxt,
    }) => {
      await activeNotesPageFxt.appTopBar.getSearchInput().fill('title 6');

      await expect(
        page.getByRole('link', {
          name: 'Edit',
        }),
      ).toHaveCount(1);

      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await tapOrClick(
        page
          .locator('[data-component="dialog-note-container"]')
          .getByRole('button', { name: 'Archive' }),
      );

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await page
        .locator('div[data-placeholder="Title note"]')
        .fill('Updated Note Title 6');

      await page
        .locator('.tiptap[contenteditable="true"]')
        .fill('This is an updated note 6.');

      await tapOrClick(
        page.getByRole('button', {
          name: 'Update note',
        }),
      );

      await expect(
        page.getByRole('button', {
          name: 'Note updated',
        }),
      ).toBeVisible();

      await tapOrClick(page.getByRole('button', { name: /^Close$/ }));

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await expect(page.getByText(/^Updated Note Title 6$/)).toBeVisible();

      await expect(
        page.getByText(/^This is an updated note 6\.$/),
      ).toBeVisible();
    });
  });

  test.describe('Unarchives First Via Note Detail Dialog', () => {
    test('should update an unarchived archived note content', async ({
      page,
      tapOrClick,
      activeNotesPageFxt,
    }) => {
      await activeNotesPageFxt.appTopBar.getSearchInput().fill('title 4');

      await expect(
        page.getByRole('link', {
          name: 'Edit',
        }),
      ).toHaveCount(1);

      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await tapOrClick(
        page
          .locator('[data-component="dialog-note-container"]')
          .getByRole('button', { name: 'Unarchive' }),
      );

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await tapOrClick(
        page.getByRole('link', {
          name: 'Edit',
        }),
      );

      await page
        .locator('div[data-placeholder="Title note"]')
        .fill('Updated Note Title 4');

      await page
        .locator('.tiptap[contenteditable="true"]')
        .fill('This is an updated note 4.');

      await tapOrClick(
        page.getByRole('button', {
          name: 'Update note',
        }),
      );

      await expect(
        page.getByRole('button', {
          name: 'Note updated',
        }),
      ).toBeVisible();

      await tapOrClick(page.getByRole('button', { name: /^Close$/ }));

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await expect(page.getByText(/^Updated Note Title 4$/)).toBeVisible();

      await expect(
        page.getByText(/^This is an updated note 4\.$/),
      ).toBeVisible();
    });
  });
});
