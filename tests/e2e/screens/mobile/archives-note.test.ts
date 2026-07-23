import { expect, mergeTests } from '@playwright/test';
import crypto from 'node:crypto';

import activeNotesPageFxt from 'tests/e2e/fixtures/activeNotesPageFxt';
import archiveNotesPageFxt from 'tests/e2e/fixtures/archiveNotesPageFxt';
import generalPageFxt from 'tests/e2e/fixtures/generalPageFxt';
import interactionFxt from 'tests/e2e/fixtures/interactionFxt';
import signInPageFxt from 'tests/e2e/fixtures/signInPageFxt';
import signUpPageFxt from 'tests/e2e/fixtures/signUpPageFxt';
import ActiveNotesPOM from 'tests/e2e/page-object-models/activeNotesPOM';
import { resetDBTables } from '../../helpers/database';

const test = mergeTests(
  interactionFxt,
  generalPageFxt,
  signUpPageFxt,
  signInPageFxt,
  activeNotesPageFxt,
  archiveNotesPageFxt,
);

test.afterEach(async () => {
  await resetDBTables();
});

test.describe(() => {
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

  test('should archive an active note via the note detail dialog', async ({
    page,
    tapOrClick,
    activeNotesPageFxt,
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

    await expect(
      page
        .locator('[data-component="dialog-note-container"]')
        .getByRole('button', { name: 'Unarchive' }),
    ).toBeVisible();

    await tapOrClick(page.getByRole('button', { name: /^Close$/ }));

    await expect(page.getByText(/^First Note$/)).not.toBeVisible();
    await expect(page.getByText(/^This is a first note\.$/)).not.toBeVisible();

    await activeNotesPageFxt.goToArchiveNotePage();

    await expect(page.getByText(/^First Note$/)).toBeVisible();
    await expect(page.getByText(/^This is a first note\.$/)).toBeVisible();
  });
});

test.describe(() => {
  test.beforeEach(
    async ({
      page,
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

      await generalPageFxt.closeSnackbar();

      await expect(page.getByRole('button', { name: /^Trash$/ })).toHaveCount(
        1,
      );

      await tapOrClick(page.getByRole('button', { name: /^Trash$/ }));

      await generalPageFxt.closeSnackbar();

      await activeNotesPageFxt.createNote('Note Title 3', 'This is a note 3.');
      await activeNotesPageFxt.createNote('Note Title 4', 'This is a note 4.');

      await tapOrClick(page.getByRole('button', { name: /^Archive/ }).first());

      await generalPageFxt.closeSnackbar();

      await expect(page.getByRole('button', { name: /^Archive$/ })).toHaveCount(
        1,
      );

      await tapOrClick(page.getByRole('button', { name: /^Archive$/ }));

      await generalPageFxt.closeSnackbar();

      await activeNotesPageFxt.createNote('Note Title 5', 'This is a note 5.');
      await activeNotesPageFxt.createNote('Note Title 6', 'This is a note 6.');
    },
  );

  test.describe('Archives After Searching Notes', () => {
    test('should archive an active note via the note detail dialog', async ({
      page,
      tapOrClick,
      activeNotesPageFxt,
    }) => {
      await activeNotesPageFxt.appTopBar.getSearchInput().fill('title 6');

      await expect(
        page.getByRole('link', {
          name: 'Edit',
        }),
      ).toHaveCount(1);

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

      await expect(
        page
          .locator('[data-component="dialog-note-container"]')
          .getByRole('button', { name: 'Unarchive' }),
      ).toBeVisible();

      await tapOrClick(page.getByRole('button', { name: /^Close$/ }));

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await expect(page.getByText(/^Note Title 6$/)).toBeVisible();
      await expect(page.getByText(/^This is a note 6\.$/)).toBeVisible();

      await activeNotesPageFxt.goToArchiveNotePage();

      await expect(page.getByText(/^Note Title 6$/)).toBeVisible();
      await expect(page.getByText(/^This is a note 6\.$/)).toBeVisible();

      await expect(activeNotesPageFxt.appTopBar.getSearchInput()).toHaveValue(
        '',
      );
    });

    [
      {
        otherSelection: [],
        toastMessage: /^Note archived$/,
        finalArchivePage: [
          {
            title: /^Note Title 6$/,
            content: /^This is a note 6\.$/,
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
        finalActivePage: {
          visible: [
            {
              title: /^Note Title 5$/,
              content: /^This is a note 5\.$/,
            },
          ],
          notVisible: [
            {
              title: /^Note Title 6$/,
              content: /^This is a note 6\.$/,
            },
          ],
        },
      },
      {
        otherSelection: [1],
        toastMessage: /^2 notes archived$/,
        finalArchivePage: [
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
        finalActivePage: {
          visible: [],
          notVisible: [
            {
              title: /^Note Title 6$/,
              content: /^This is a note 6\.$/,
            },
            {
              title: /^Note Title 5$/,
              content: /^This is a note 5\.$/,
            },
          ],
        },
      },
      {
        otherSelection: [1, 2],
        toastMessage: /^3 notes archived$/,
        finalArchivePage: [
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
        finalActivePage: {
          visible: [],
          notVisible: [
            {
              title: /^Note Title 6$/,
              content: /^This is a note 6\.$/,
            },
            {
              title: /^Note Title 5$/,
              content: /^This is a note 5\.$/,
            },
          ],
        },
      },
      {
        otherSelection: [1, 2, 3],
        toastMessage: /^4 notes archived$/,
        finalArchivePage: [
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
        finalActivePage: {
          visible: [],
          notVisible: [
            {
              title: /^Note Title 6$/,
              content: /^This is a note 6\.$/,
            },
            {
              title: /^Note Title 5$/,
              content: /^This is a note 5\.$/,
            },
          ],
        },
      },
    ].forEach(
      ({ otherSelection, toastMessage, finalArchivePage, finalActivePage }) => {
        test(`should archive ${otherSelection.length + 1} searched selected ${otherSelection.length ? 'notes' : 'note'}`, async ({
          page,
          tapOrClick,
          activeNotesPageFxt,
          archiveNotesPageFxt,
        }) => {
          await activeNotesPageFxt.appTopBar.getSearchInput().fill('note');

          await expect(page.getByText(/^Active Notes$/)).toBeVisible();
          await expect(page.getByText(/^Archived Notes$/)).toBeVisible();

          await page.getByText(/^Note Title 6$/).click({
            delay: 750,
          });

          await expect(page.getByText(/^1 selected$/)).toBeVisible();

          for (const otherSelectionNth of otherSelection) {
            await tapOrClick(
              page
                .getByRole('button', {
                  name: 'Select note',
                })
                .nth(otherSelectionNth),
            );
          }

          await expect(
            page.getByText(
              new RegExp(`^${otherSelection.length + 1} selected$`),
            ),
          ).toBeVisible();

          await tapOrClick(
            page.getByRole('button', {
              name: /^Selection menu$/,
            }),
          );

          await tapOrClick(
            page.getByRole('menuitem', {
              name: /^Archive$/,
            }),
          );

          await expect(page.getByText(toastMessage)).toBeVisible();

          await activeNotesPageFxt.goToArchiveNotePage();

          for (const { title, content } of finalArchivePage) {
            await expect(page.getByText(title)).toBeVisible();
            await expect(page.getByText(content)).toBeVisible();
          }

          await archiveNotesPageFxt.goToActiveNotePage();

          for (const { title, content } of finalActivePage.notVisible) {
            await expect(page.getByText(title)).not.toBeVisible();
            await expect(page.getByText(content)).not.toBeVisible();
          }

          for (const { title, content } of finalActivePage.visible) {
            await expect(page.getByText(title)).toBeVisible();
            await expect(page.getByText(content)).toBeVisible();
          }
        });
      },
    );
  });

  test('should archive selected active notes', async ({
    page,
    tapOrClick,
    activeNotesPageFxt,
    archiveNotesPageFxt,
  }) => {
    await page.getByText(/^Note Title 6$/).click({
      delay: 750,
    });

    await expect(page.getByText(/^1 selected$/)).toBeVisible();

    await tapOrClick(
      page
        .getByRole('button', {
          name: 'Select note',
        })
        .nth(1),
    );

    await expect(page.getByText(/^2 selected$/)).toBeVisible();

    await tapOrClick(
      page.getByRole('button', {
        name: /^Selection menu$/,
      }),
    );

    await tapOrClick(
      page.getByRole('menuitem', {
        name: /^Archive$/,
      }),
    );

    await expect(page.getByText(/^2 notes archived$/)).toBeVisible();

    await activeNotesPageFxt.goToArchiveNotePage();

    await expect(page.getByText(/^Note Title 6$/)).toBeVisible();
    await expect(page.getByText(/^This is a note 6\.$/)).toBeVisible();

    await expect(page.getByText(/^Note Title 5$/)).toBeVisible();
    await expect(page.getByText(/^This is a note 5\.$/)).toBeVisible();

    await archiveNotesPageFxt.goToActiveNotePage();

    await expect(page.getByText(/^Note Title 6$/)).not.toBeVisible();
    await expect(page.getByText(/^This is a note 6\.$/)).not.toBeVisible();

    await expect(page.getByText(/^Note Title 5$/)).not.toBeVisible();
    await expect(page.getByText(/^This is a note 5\.$/)).not.toBeVisible();
  });
});
