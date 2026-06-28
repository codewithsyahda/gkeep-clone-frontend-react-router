import { expect, mergeTests } from '@playwright/test';
import crypto from 'node:crypto';

import activeNotesPageFxt from 'tests/e2e/fixtures/activeNotesPageFxt';
import interactionFxt from 'tests/e2e/fixtures/interactionFxt';
import signInPageFxt from 'tests/e2e/fixtures/signInPageFxt';
import signUpPageFxt from 'tests/e2e/fixtures/signUpPageFxt';
import trashNotesPageFxt from 'tests/e2e/fixtures/trashNotesPageFxt';
import ActiveNotesPOM from 'tests/e2e/page-object-models/activeNotesPOM';
import { resetDBTables } from '../../helpers/database';

const test = mergeTests(
  interactionFxt,
  signUpPageFxt,
  signInPageFxt,
  activeNotesPageFxt,
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
});

test.afterEach(async () => {
  await resetDBTables();
});

test('should delete an active note from the trash via the note detail dialog', async ({
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

  await tapOrClick(
    page
      .locator('[data-component="dialog-note-container"]')
      .getByRole('button', {
        name: 'Delete',
      }),
  );

  await tapOrClick(
    page.getByRole('button', {
      name: 'Yes',
    }),
  );

  await expect(page.getByText(/^Are you sure\?$/)).not.toBeVisible();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await activeNotesPageFxt.goToTrashNotePage();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await trashNotesPageFxt.goToActiveNotePage();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();
});

test('should delete an archived note from the trash via the note detail dialog', async ({
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
      .getByRole('button', { name: 'Archive' }),
  );

  await tapOrClick(
    page
      .locator('[data-component="dialog-note-container"]')
      .getByRole('button', { name: 'Trash' }),
  );

  await tapOrClick(
    page
      .locator('[data-component="dialog-note-container"]')
      .getByRole('button', {
        name: 'Delete',
      }),
  );

  await tapOrClick(
    page.getByRole('button', {
      name: 'Yes',
    }),
  );

  await expect(page.getByText(/^Are you sure\?$/)).not.toBeVisible();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await activeNotesPageFxt.goToTrashNotePage();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await trashNotesPageFxt.goToActiveNotePage();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();
});
