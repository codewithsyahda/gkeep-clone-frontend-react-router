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

test('should create a new note', async ({ page, activeNotesPageFxt }) => {
  await expect(page).toHaveURL('/');

  await activeNotesPageFxt.createNote(
    'Create Note by Playwright',
    'This note is created by the Playwright E2E testing tool',
  );

  await expect(page.getByText('Create Note by Playwright')).toBeVisible();

  await expect(
    page.getByText('This note is created by the Playwright E2E testing tool'),
  ).toBeVisible();
});

test('should close the create note dialog', async ({
  page,
  tapOrClick,
  activeNotesPageFxt,
}) => {
  await expect(page).toHaveURL('/');

  await tapOrClick(activeNotesPageFxt.getCreateNoteLink());

  await expect(page).toHaveURL('/#create');

  await tapOrClick(
    page.getByRole('button', {
      name: /^Close$/,
    }),
  );

  await expect(
    activeNotesPageFxt.createNoteDialog.getCloseButton(),
  ).not.toBeVisible();

  await expect(page).toHaveURL('/');
});
