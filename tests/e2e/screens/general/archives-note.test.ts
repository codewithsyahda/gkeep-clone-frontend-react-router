import { expect, mergeTests } from '@playwright/test';
import crypto from 'node:crypto';

import activeNotesPageFxt from 'tests/e2e/fixtures/activeNotesPageFxt';
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

test('should archive an active note via the note card', async ({
  page,
  tapOrClick,
  activeNotesPageFxt,
}) => {
  await tapOrClick(
    page.getByRole('button', {
      name: 'Archive',
    }),
  );

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await activeNotesPageFxt.goToArchiveNotePage();

  await expect(page.getByText(/First Note/)).toBeVisible();
  await expect(page.getByText(/This is a first note./)).toBeVisible();
});

test('should undo an archiving active note', async ({
  page,
  tapOrClick,
  activeNotesPageFxt,
}) => {
  await tapOrClick(
    page.getByRole('button', {
      name: 'Archive',
    }),
  );

  await expect(
    page.getByRole('button', {
      name: 'Archive',
    }),
  ).toHaveCount(0);

  await tapOrClick(
    page.getByRole('button', {
      name: 'Undo',
    }),
  );

  await expect(page.getByText(/First Note/)).toBeVisible();
  await expect(page.getByText(/This is a first note./)).toBeVisible();

  await activeNotesPageFxt.goToArchiveNotePage();

  await expect(page.getByText(/First Note/)).not.toBeVisible();
  await expect(page.getByText(/This is a first note./)).not.toBeVisible();

  await activeNotesPageFxt.goToActiveNotePage();

  await expect(page.getByText(/First Note/)).toBeVisible();
  await expect(page.getByText(/This is a first note./)).toBeVisible();
});
