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
  await activeNotesPOM.createNote('Second Note', 'This is a second note.');
});

test.afterEach(async () => {
  await resetDBTables();
});

test('should delete all notes from the trash via the note card', async ({
  page,
  isMobile,
  tapOrClick,
  generalPageFxt,
  activeNotesPageFxt,
  archiveNotesPageFxt,
  trashNotesPageFxt,
}) => {
  await tapOrClick(
    page
      .getByRole('button', {
        name: 'Trash',
      })
      .first(),
  );

  if (isMobile) await generalPageFxt.closeSnackbar();

  await expect(
    page.getByRole('button', {
      name: 'Archive',
    }),
  ).toHaveCount(1);

  await tapOrClick(
    page.getByRole('button', {
      name: 'Archive',
    }),
  );

  if (isMobile) await generalPageFxt.closeSnackbar();

  await activeNotesPageFxt.goToArchiveNotePage();

  await tapOrClick(
    page.getByRole('button', {
      name: 'Trash',
    }),
  );

  if (isMobile) await generalPageFxt.closeSnackbar();

  await archiveNotesPageFxt.goToTrashNotePage();

  await tapOrClick(
    page.getByRole('button', {
      name: 'Empty all',
    }),
  );

  await tapOrClick(
    page.getByRole('button', {
      name: 'Yes',
    }),
  );

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await expect(page.getByText(/Second Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a second note./)).not.toBeVisible();

  await trashNotesPageFxt.goToActiveNotePage();

  await expect(page.getByText(/Second Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a second note./)).not.toBeVisible();

  await activeNotesPageFxt.goToArchiveNotePage();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await archiveNotesPageFxt.goToTrashNotePage();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await expect(page.getByText(/Second Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a second note./)).not.toBeVisible();
});
