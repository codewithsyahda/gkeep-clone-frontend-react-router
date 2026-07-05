import { expect, mergeTests } from '@playwright/test';
import crypto from 'node:crypto';

import activeNotesPageFxt from 'tests/e2e/fixtures/activeNotesPageFxt';
import generalPageFxt from 'tests/e2e/fixtures/generalPageFxt';
import interactionFxt from 'tests/e2e/fixtures/interactionFxt';
import signInPageFxt from 'tests/e2e/fixtures/signInPageFxt';
import signUpPageFxt from 'tests/e2e/fixtures/signUpPageFxt';
import { resetDBTables } from '../../helpers/database';

const test = mergeTests(
  interactionFxt,
  generalPageFxt,
  signUpPageFxt,
  signInPageFxt,
  activeNotesPageFxt,
);

test.beforeEach(
  async ({
    page,
    isMobile,
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

    if (isMobile) await generalPageFxt.closeSnackbar();

    await expect(page.getByRole('button', { name: /^Trash$/ })).toHaveCount(1);

    await tapOrClick(page.getByRole('button', { name: /^Trash$/ }));

    if (isMobile) await generalPageFxt.closeSnackbar();

    await activeNotesPageFxt.createNote('Note Title 3', 'This is a note 3.');
    await activeNotesPageFxt.createNote('Note Title 4', 'This is a note 4.');

    await tapOrClick(page.getByRole('button', { name: /^Archive/ }).first());

    if (isMobile) await generalPageFxt.closeSnackbar();

    await expect(page.getByRole('button', { name: /^Archive$/ })).toHaveCount(
      1,
    );

    await tapOrClick(page.getByRole('button', { name: /^Archive$/ }));

    if (isMobile) await generalPageFxt.closeSnackbar();

    await activeNotesPageFxt.createNote('Note Title 5', 'This is a note 5.');
    await activeNotesPageFxt.createNote('Note Title 6', 'This is a note 6.');
  },
);

test.afterEach(async () => {
  await resetDBTables();
});

test(`should retain the search notes param if it exists`, async ({
  page,
  isMobile,
  tapOrClick,
}) => {
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

    await tapOrClick(
      page.getByRole('button', {
        name: /^Dismiss$/,
      }),
    );

    expect(page).toHaveURL(expected);

    await page.goto(initialUrl);

    if (isMobile) {
      await page
        .getByRole('button', {
          name: /^Close dialog$/,
        })
        .tap({
          position: { x: 24, y: 24 },
        });
    } else {
      await page
        .getByRole('button', {
          name: /^Close dialog$/,
        })
        .click({
          position: { x: 24, y: 24 },
        });
    }

    expect(page).toHaveURL(expected);
  }
});
