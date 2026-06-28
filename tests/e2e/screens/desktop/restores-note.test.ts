import { expect, mergeTests } from '@playwright/test';
import crypto from 'node:crypto';

import activeNotesPageFxt from 'tests/e2e/fixtures/activeNotesPageFxt';
import archiveNotesPageFxt from 'tests/e2e/fixtures/archiveNotesPageFxt';
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
});

test.afterEach(async () => {
  await resetDBTables();
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

  await expect(page.getByRole('button', { name: /^Close$/ })).not.toBeVisible();

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

  await expect(page.getByRole('button', { name: /^Close$/ })).not.toBeVisible();

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

  await expect(page.getByRole('button', { name: /^Close$/ })).not.toBeVisible();

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

  await expect(page.getByRole('button', { name: /^Close$/ })).not.toBeVisible();

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

  await expect(page.getByRole('button', { name: /^Close$/ })).not.toBeVisible();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await trashNotesPageFxt.goToArchiveNotePage();

  await expect(page.getByText(/First Note/)).toBeVisible();
  await expect(page.getByText(/This is a first note./)).toBeVisible();
});
