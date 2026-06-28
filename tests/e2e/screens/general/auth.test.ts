import { expect, mergeTests } from '@playwright/test';

import activeNotesPageFxt from 'tests/e2e/fixtures/activeNotesPageFxt';
import interactionFxt from 'tests/e2e/fixtures/interactionFxt';
import signInPageFxt from 'tests/e2e/fixtures/signInPageFxt';
import signUpPageFxt from 'tests/e2e/fixtures/signUpPageFxt';
import { resetDBTables } from '../../helpers/database';

const test = mergeTests(
  interactionFxt,
  signUpPageFxt,
  signInPageFxt,
  activeNotesPageFxt,
);

test.afterEach(async () => {
  await resetDBTables();
});

test('should fail when signing in with an invalid user credentials', async ({
  page,
  signInPageFxt,
}) => {
  await signInPageFxt.goTo();

  await signInPageFxt.signIn('wrong@doe.com', 'wrongpass');

  await expect(page).not.toHaveURL('/');

  await expect(page).toHaveURL('/signin');
});

test('should sign up, sign in, and sign out correctly', async ({
  page,
  signUpPageFxt,
  signInPageFxt,
  activeNotesPageFxt,
  tapOrClick,
}) => {
  await signUpPageFxt.goTo();

  await signUpPageFxt.signUp({
    fullname: 'Fiz Doe',
    email: 'fiz@doe.com',
    password: '12345678',
  });

  await signInPageFxt.signIn('fiz@doe.com', '12345678');

  await expect(page).toHaveURL('/');

  await tapOrClick(activeNotesPageFxt.userMenu.getOpenButton());
  await tapOrClick(activeNotesPageFxt.userMenu.getSignOutButton());

  await expect(page).toHaveURL('/signin');
});

test('should redirect to the dashboard page from the auth pages after signing in', async ({
  page,
  signUpPageFxt,
  signInPageFxt,
}) => {
  await signUpPageFxt.goTo();

  await signUpPageFxt.signUp({
    fullname: 'Foo Doe',
    email: 'foo@doe.com',
    password: '12345678',
  });

  await signInPageFxt.signIn('foo@doe.com', '12345678');

  await expect(page).toHaveURL('/');

  await signUpPageFxt.goTo();

  await expect(page).toHaveURL('/');

  await signInPageFxt.goTo();

  await expect(page).toHaveURL('/');
});
