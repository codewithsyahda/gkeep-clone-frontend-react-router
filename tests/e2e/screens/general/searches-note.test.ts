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

[
  {
    search: 'n',
    expected: [
      {
        title: /^Note Title 6$/,
        content: /^This is a note 6\.$/,
      },
      {
        title: /^Note Title 5$/,
        content: /^This is a note 5\.$/,
      },
      {
        title: /^Note Title 4$/,
        content: /^This is a note 4\.$/,
      },
      {
        title: /^Note Title 3$/,
        content: /^This is a note 3\.$/,
      },
    ],
  },
  {
    search: 'nOTe 4',
    expected: [
      {
        title: /^Note Title 4$/,
        content: /^This is a note 4\.$/,
      },
    ],
  },
].forEach(({ search, expected }) => {
  test(`should search notes with the "${search}" search keywords`, async ({
    page,
    activeNotesPageFxt,
  }) => {
    await activeNotesPageFxt.appTopBar.getSearchInput().fill(search);

    for (const each of expected) {
      await expect(page.getByText(each.title)).toBeVisible();
      await expect(page.getByText(each.content)).toBeVisible();
    }
  });
});

['Title 1', 'NoTE 2', 'Unknown NOTE'].forEach((search) => {
  test(`should show "No matching results." with the "${search}" search keywords`, async ({
    page,
    activeNotesPageFxt,
  }) => {
    await activeNotesPageFxt.appTopBar.getSearchInput().fill(search);

    await expect(page.getByText(/^No matching results\.$/)).toBeVisible();
  });
});
