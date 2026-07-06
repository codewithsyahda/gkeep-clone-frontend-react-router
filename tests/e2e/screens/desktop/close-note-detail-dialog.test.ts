import { expect, mergeTests } from '@playwright/test';
import crypto from 'node:crypto';

import signInPageFxt from 'tests/e2e/fixtures/signInPageFxt';
import signUpPageFxt from 'tests/e2e/fixtures/signUpPageFxt';
import { resetDBTables } from '../../helpers/database';

const test = mergeTests(signUpPageFxt, signInPageFxt);

test.beforeEach(async ({ page, signUpPageFxt, signInPageFxt }) => {
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

  await expect(page).toHaveURL('/');
});

test.afterEach(async () => {
  await resetDBTables();
});

test(`should retain the search notes param if it exists`, async ({ page }) => {
  for (const { initialUrl, expected } of [
    {
      initialUrl: `/?search-notes=${encodeURIComponent('title 3')}#notes/id-note-unknown`,
      expected: `/?search-notes=${encodeURIComponent('title 3')}`,
    },
    {
      initialUrl: `/archive?search-notes=${encodeURIComponent('title 3')}#notes/id-note-unknown`,
      expected: `/archive?search-notes=${encodeURIComponent('title 3')}`,
    },
    {
      initialUrl: `/trash?search-notes=${encodeURIComponent('title 3')}#notes/id-note-unknown`,
      expected: `/trash?search-notes=${encodeURIComponent('title 3')}`,
    },
  ]) {
    await page.goto(initialUrl);

    await expect(
      page.getByRole('button', {
        name: /^Dismiss$/,
      }),
    ).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(
      page.getByRole('button', {
        name: /^Dismiss$/,
      }),
    ).not.toBeVisible();

    await expect(page).toHaveURL(expected);
  }
});
