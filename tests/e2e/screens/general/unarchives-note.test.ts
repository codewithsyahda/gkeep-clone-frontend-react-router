import { expect, mergeTests } from '@playwright/test';
import crypto from 'node:crypto';

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

test('should unarchive an archived note via the note card', async ({
  page,
  tapOrClick,
  activeNotesPageFxt,
  archiveNotesPageFxt,
}) => {
  await tapOrClick(
    page.getByRole('button', {
      name: 'Archive',
    }),
  );

  await activeNotesPageFxt.goToArchiveNotePage();

  await tapOrClick(
    page.getByRole('button', {
      name: 'Unarchive',
    }),
  );

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await archiveNotesPageFxt.goToActiveNotePage();

  await expect(page.getByText(/First Note/)).toBeVisible();
  await expect(page.getByText(/This is a first note./)).toBeVisible();
});

test('should undo an unarchive an archived note', async ({
  page,
  tapOrClick,
  activeNotesPageFxt,
  archiveNotesPageFxt,
}) => {
  await tapOrClick(
    page.getByRole('button', {
      name: 'Archive',
    }),
  );

  await activeNotesPageFxt.goToArchiveNotePage();

  await tapOrClick(
    page.getByRole('button', {
      name: 'Unarchive',
    }),
  );

  await expect(
    page.getByRole('button', {
      name: 'Unarchive',
    }),
  ).toHaveCount(0);

  await expect(
    page.getByRole('button', {
      name: 'Undo',
    }),
  ).toHaveCount(1);

  await tapOrClick(
    page.getByRole('button', {
      name: 'Undo',
    }),
  );

  await archiveNotesPageFxt.goToActiveNotePage();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await activeNotesPageFxt.goToArchiveNotePage();

  await expect(page.getByText(/First Note/)).toBeVisible();
  await expect(page.getByText(/This is a first note./)).toBeVisible();
});
