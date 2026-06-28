import { expect, mergeTests } from '@playwright/test';
import crypto from 'node:crypto';

import activeNotesPageFxt from 'tests/e2e/fixtures/activeNotesPageFxt';
import archiveNotesPageFxt from 'tests/e2e/fixtures/archiveNotesPageFxt';
import generalPageFxt from 'tests/e2e/fixtures/generalPageFxt';
import interactionFxt from 'tests/e2e/fixtures/interactionFxt';
import signInPageFxt from 'tests/e2e/fixtures/signInPageFxt';
import signUpPageFxt from 'tests/e2e/fixtures/signUpPageFxt';
import trashNotesPageFxt from 'tests/e2e/fixtures/trashNotesPageFxt';
import ActiveNotesPOM from 'tests/e2e/page-object-models/activeNotesPOM';
import { resetDBTables } from '../../helpers/database';

const test = mergeTests(
  interactionFxt,
  generalPageFxt,
  signUpPageFxt,
  signInPageFxt,
  activeNotesPageFxt,
  archiveNotesPageFxt,
  trashNotesPageFxt,
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

  test('should trash an active note via the note detail dialog', async ({
    page,
    tapOrClick,
    activeNotesPageFxt,
    trashNotesPageFxt,
  }) => {
    await tapOrClick(
      page.getByRole('link', {
        name: 'Edit',
      }),
    );

    await tapOrClick(
      page
        .locator('[data-component="dialog-note-container"]')
        .getByRole('button', { name: 'Trash' }),
    );

    await expect(
      page.getByRole('button', { name: /^Close$/ }),
    ).not.toBeVisible();

    await expect(page.getByText(/First Note/)).not.toBeVisible();
    await expect(page.getByText(/This is a first note./)).not.toBeVisible();

    await activeNotesPageFxt.goToTrashNotePage();

    await expect(page.getByText(/First Note/)).toBeVisible();
    await expect(page.getByText(/This is a first note./)).toBeVisible();

    await trashNotesPageFxt.goToActiveNotePage();

    await expect(page.getByText(/First Note/)).not.toBeVisible();
    await expect(page.getByText(/This is a first note./)).not.toBeVisible();
  });

  test('should trash an archived note via the note detail dialog', async ({
    page,
    tapOrClick,
    activeNotesPageFxt,
    archiveNotesPageFxt,
    trashNotesPageFxt,
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
        .getByRole('button', { name: 'Trash' }),
    );

    await expect(
      page.getByRole('button', { name: /^Close$/ }),
    ).not.toBeVisible();

    await expect(page.getByText(/First Note/)).not.toBeVisible();
    await expect(page.getByText(/This is a first note./)).not.toBeVisible();

    await archiveNotesPageFxt.goToTrashNotePage();

    await expect(page.getByText(/First Note/)).toBeVisible();
    await expect(page.getByText(/This is a first note./)).toBeVisible();

    await trashNotesPageFxt.goToActiveNotePage();

    await expect(page.getByText(/First Note/)).not.toBeVisible();
    await expect(page.getByText(/This is a first note./)).not.toBeVisible();
  });
});

test.describe('Trashes After Searching Notes', () => {
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

  test('should trash an active note via the note detail dialog', async ({
    page,
    tapOrClick,
    activeNotesPageFxt,
  }) => {
    await activeNotesPageFxt.appTopBar.getSearchInput().fill('title 5');

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
        .getByRole('button', { name: 'Trash' }),
    );

    await expect(
      page.getByRole('button', { name: /^Close$/ }),
    ).not.toBeVisible();

    await expect(page.getByText(/^Note Title 5$/)).not.toBeVisible();
    await expect(page.getByText(/^This is a note 5\.$/)).not.toBeVisible();

    await expect(page.getByText(/^No matching results\.$/)).toBeVisible();

    await activeNotesPageFxt.goToActiveNotePage();

    await expect(page.getByText(/^Note Title 5$/)).not.toBeVisible();
    await expect(page.getByText(/^This is a note 5\.$/)).not.toBeVisible();

    await expect(activeNotesPageFxt.appTopBar.getSearchInput()).toHaveValue('');

    await activeNotesPageFxt.goToTrashNotePage();

    await expect(page.getByText(/^Note Title 5$/)).toBeVisible();
    await expect(page.getByText(/^This is a note 5\.$/)).toBeVisible();
  });

  test('should trash an archived note via the note detail dialog', async ({
    page,
    tapOrClick,
    activeNotesPageFxt,
  }) => {
    await activeNotesPageFxt.appTopBar.getSearchInput().fill('title 3');

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
        .getByRole('button', { name: 'Trash' }),
    );

    await expect(
      page.getByRole('button', { name: /^Close$/ }),
    ).not.toBeVisible();

    await expect(page.getByText(/^Note Title 3$/)).not.toBeVisible();
    await expect(page.getByText(/^This is a note 3\.$/)).not.toBeVisible();

    await expect(page.getByText(/^No matching results\.$/)).toBeVisible();

    await activeNotesPageFxt.goToArchiveNotePage();

    await expect(page.getByText(/^Note Title 3$/)).not.toBeVisible();
    await expect(page.getByText(/^This is a note 3\.$/)).not.toBeVisible();

    await expect(activeNotesPageFxt.appTopBar.getSearchInput()).toHaveValue('');

    await activeNotesPageFxt.goToTrashNotePage();

    await expect(page.getByText(/^Note Title 3$/)).toBeVisible();
    await expect(page.getByText(/^This is a note 3\.$/)).toBeVisible();
  });
});
