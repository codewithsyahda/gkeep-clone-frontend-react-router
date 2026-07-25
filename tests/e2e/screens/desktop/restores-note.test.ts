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

  test('should restore an active note from the trash via the note detail dialog', async ({
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

    await activeNotesPageFxt.goToTrashNotePage();

    await tapOrClick(
      page.getByRole('link', {
        name: 'Note detail',
      }),
    );

    await tapOrClick(
      page
        .locator('[data-component="dialog-note-container"]')
        .getByRole('button', { name: 'Restore' }),
    );

    await expect(
      page.getByRole('button', { name: /^Close$/ }),
    ).not.toBeVisible();

    await expect(page.getByText(/First Note/)).not.toBeVisible();
    await expect(page.getByText(/This is a first note./)).not.toBeVisible();

    await trashNotesPageFxt.goToActiveNotePage();

    await expect(page.getByText(/First Note/)).toBeVisible();
    await expect(page.getByText(/This is a first note./)).toBeVisible();
  });

  test('should restore an archived note from the trash via the note detail dialog', async ({
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

    await archiveNotesPageFxt.goToTrashNotePage();

    await tapOrClick(
      page.getByRole('link', {
        name: 'Note detail',
      }),
    );

    await tapOrClick(
      page
        .locator('[data-component="dialog-note-container"]')
        .getByRole('button', { name: 'Restore' }),
    );

    await expect(
      page.getByRole('button', { name: /^Close$/ }),
    ).not.toBeVisible();

    await expect(page.getByText(/First Note/)).not.toBeVisible();
    await expect(page.getByText(/This is a first note./)).not.toBeVisible();

    await trashNotesPageFxt.goToArchiveNotePage();

    await expect(page.getByText(/First Note/)).toBeVisible();
    await expect(page.getByText(/This is a first note./)).toBeVisible();
  });
});

test.describe(() => {
  test.beforeEach(
    async ({
      page,
      tapOrClick,
      generalPageFxt,
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

      await generalPageFxt.closeSnackbar();

      await expect(page.getByRole('button', { name: /^Trash$/ })).toHaveCount(
        1,
      );

      await tapOrClick(page.getByRole('button', { name: /^Trash$/ }));

      await generalPageFxt.closeSnackbar();

      await activeNotesPageFxt.createNote('Note Title 3', 'This is a note 3.');
      await activeNotesPageFxt.createNote('Note Title 4', 'This is a note 4.');

      await tapOrClick(page.getByRole('button', { name: /^Archive/ }).first());

      await generalPageFxt.closeSnackbar();

      await expect(page.getByRole('button', { name: /^Archive$/ })).toHaveCount(
        1,
      );

      await tapOrClick(page.getByRole('button', { name: /^Archive$/ }));

      await generalPageFxt.closeSnackbar();

      await activeNotesPageFxt.createNote('Note Title 5', 'This is a note 5.');
      await activeNotesPageFxt.createNote('Note Title 6', 'This is a note 6.');
    },
  );

  [
    {
      subsequentSelect: 'checkbox' as const,
    },
    {
      subsequentSelect: 'button' as const,
    },
  ].forEach(({ subsequentSelect }) => {
    test(`should restore selected trashed notes with ${subsequentSelect} subsequent select`, async ({
      page,
      tapOrClick,
      activeNotesPageFxt,
      trashNotesPageFxt,
    }) => {
      await activeNotesPageFxt.goToTrashNotePage();

      await tapOrClick(
        page
          .getByRole('checkbox', {
            name: 'Select note',
          })
          .nth(0),
      );

      await expect(page.getByText(/^1 selected$/)).toBeVisible();

      await tapOrClick(
        page
          .getByRole(subsequentSelect, {
            name: 'Select note',
          })
          .nth(1),
      );

      await expect(page.getByText(/^2 selected$/)).toBeVisible();

      await tapOrClick(
        page.getByRole('button', {
          name: /^Selection menu$/,
        }),
      );

      await tapOrClick(
        page.getByRole('menuitem', {
          name: /^Restore$/,
        }),
      );

      await expect(page.getByText(/^2 notes restored$/)).toBeVisible();

      await trashNotesPageFxt.goToActiveNotePage();

      await expect(page.getByText(/^Note Title 2$/)).toBeVisible();
      await expect(page.getByText(/^This is a note 2\.$/)).toBeVisible();

      await expect(page.getByText(/^Note Title 1$/)).toBeVisible();
      await expect(page.getByText(/^This is a note 1\.$/)).toBeVisible();

      await activeNotesPageFxt.goToTrashNotePage();

      await expect(page.getByText(/^Note Title 2$/)).not.toBeVisible();
      await expect(page.getByText(/^This is a note 2\.$/)).not.toBeVisible();

      await expect(page.getByText(/^Note Title 1$/)).not.toBeVisible();
      await expect(page.getByText(/^This is a note 1\.$/)).not.toBeVisible();
    });
  });
});
