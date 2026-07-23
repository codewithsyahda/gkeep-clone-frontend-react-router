import { expect, mergeTests } from '@playwright/test';
import crypto from 'node:crypto';

import activeNotesPageFxt from 'tests/e2e/fixtures/activeNotesPageFxt';
import archiveNotesPageFxt from 'tests/e2e/fixtures/archiveNotesPageFxt';
import generalPageFxt from 'tests/e2e/fixtures/generalPageFxt';
import interactionFxt from 'tests/e2e/fixtures/interactionFxt';
import signInPageFxt from 'tests/e2e/fixtures/signInPageFxt';
import signUpPageFxt from 'tests/e2e/fixtures/signUpPageFxt';
import trashNotesPageFxt from 'tests/e2e/fixtures/trashNotesPageFxt';
import ActiveNotesPOM from 'tests/e2e/page-object-models/activeNotesPOM';
import { resetDBTables } from '../../helpers/database';

const test = mergeTests(
  interactionFxt,
  generalPageFxt,
  signUpPageFxt,
  signInPageFxt,
  activeNotesPageFxt,
  archiveNotesPageFxt,
  trashNotesPageFxt,
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

  test('should trash an active note via the note detail dialog', async ({
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

    await expect(
      page.getByRole('button', { name: /^Close$/ }),
    ).not.toBeVisible();

    await expect(page.getByText(/First Note/)).not.toBeVisible();
    await expect(page.getByText(/This is a first note./)).not.toBeVisible();

    await activeNotesPageFxt.goToTrashNotePage();

    await expect(page.getByText(/First Note/)).toBeVisible();
    await expect(page.getByText(/This is a first note./)).toBeVisible();

    await trashNotesPageFxt.goToActiveNotePage();

    await expect(page.getByText(/First Note/)).not.toBeVisible();
    await expect(page.getByText(/This is a first note./)).not.toBeVisible();
  });

  test('should trash an archived note via the note detail dialog', async ({
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

    await expect(
      page.getByRole('button', { name: /^Close$/ }),
    ).not.toBeVisible();

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

    await expect(
      page.getByRole('button', { name: /^Close$/ }),
    ).not.toBeVisible();

    await expect(page.getByText(/First Note/)).not.toBeVisible();
    await expect(page.getByText(/This is a first note./)).not.toBeVisible();

    await archiveNotesPageFxt.goToTrashNotePage();

    await expect(page.getByText(/First Note/)).toBeVisible();
    await expect(page.getByText(/This is a first note./)).toBeVisible();

    await trashNotesPageFxt.goToActiveNotePage();

    await expect(page.getByText(/First Note/)).not.toBeVisible();
    await expect(page.getByText(/This is a first note./)).not.toBeVisible();
  });
});

test.describe(() => {
  test.beforeEach(
    async ({
      page,
      tapOrClick,
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

      await expect(page.getByRole('button', { name: /^Trash$/ })).toHaveCount(
        1,
      );

      await tapOrClick(page.getByRole('button', { name: /^Trash$/ }));

      await activeNotesPageFxt.createNote('Note Title 3', 'This is a note 3.');
      await activeNotesPageFxt.createNote('Note Title 4', 'This is a note 4.');

      await tapOrClick(page.getByRole('button', { name: /^Archive/ }).first());

      await expect(page.getByRole('button', { name: /^Archive$/ })).toHaveCount(
        1,
      );

      await tapOrClick(page.getByRole('button', { name: /^Archive$/ }));

      await activeNotesPageFxt.createNote('Note Title 5', 'This is a note 5.');
      await activeNotesPageFxt.createNote('Note Title 6', 'This is a note 6.');
    },
  );

  test.describe('Trashes After Searching Notes', () => {
    test('should trash an active note via the note detail dialog', async ({
      page,
      tapOrClick,
      activeNotesPageFxt,
    }) => {
      await activeNotesPageFxt.appTopBar.getSearchInput().fill('title 5');

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
          .getByRole('button', { name: 'Trash' }),
      );

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await expect(page.getByText(/^Note Title 5$/)).not.toBeVisible();
      await expect(page.getByText(/^This is a note 5\.$/)).not.toBeVisible();

      await expect(page.getByText(/^No matching results\.$/)).toBeVisible();

      await activeNotesPageFxt.goToActiveNotePage();

      await expect(page.getByText(/^Note Title 5$/)).not.toBeVisible();
      await expect(page.getByText(/^This is a note 5\.$/)).not.toBeVisible();

      await expect(activeNotesPageFxt.appTopBar.getSearchInput()).toHaveValue(
        '',
      );

      await activeNotesPageFxt.goToTrashNotePage();

      await expect(page.getByText(/^Note Title 5$/)).toBeVisible();
      await expect(page.getByText(/^This is a note 5\.$/)).toBeVisible();
    });

    test('should trash an archived note via the note detail dialog', async ({
      page,
      tapOrClick,
      activeNotesPageFxt,
    }) => {
      await activeNotesPageFxt.appTopBar.getSearchInput().fill('title 3');

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
          .getByRole('button', { name: 'Trash' }),
      );

      await expect(
        page.getByRole('button', { name: /^Close$/ }),
      ).not.toBeVisible();

      await expect(page.getByText(/^Note Title 3$/)).not.toBeVisible();
      await expect(page.getByText(/^This is a note 3\.$/)).not.toBeVisible();

      await expect(page.getByText(/^No matching results\.$/)).toBeVisible();

      await activeNotesPageFxt.goToArchiveNotePage();

      await expect(page.getByText(/^Note Title 3$/)).not.toBeVisible();
      await expect(page.getByText(/^This is a note 3\.$/)).not.toBeVisible();

      await expect(activeNotesPageFxt.appTopBar.getSearchInput()).toHaveValue(
        '',
      );

      await activeNotesPageFxt.goToTrashNotePage();

      await expect(page.getByText(/^Note Title 3$/)).toBeVisible();
      await expect(page.getByText(/^This is a note 3\.$/)).toBeVisible();
    });

    [
      {
        subsequentSelect: 'checkbox' as const,
      },
      {
        subsequentSelect: 'button' as const,
      },
    ].forEach(({ subsequentSelect }) => {
      [
        {
          otherSelection: [],
          toastMessage: /^Note trashed$/,
          finalTrashPage: [
            {
              title: /^Note Title 6$/,
              content: /^This is a note 6\.$/,
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
          finalArchivePage: {
            visible: [
              {
                title: /^Note Title 4$/,
                content: /^This is a note 4\.$/,
              },
              {
                title: /^Note Title 3$/,
                content: /^This is a note 3\.$/,
              },
            ],
            notVisible: [],
          },
        },
        {
          otherSelection: [1],
          toastMessage: /^2 notes trashed$/,
          finalTrashPage: [
            {
              title: /^Note Title 6$/,
              content: /^This is a note 6\.$/,
            },
            {
              title: /^Note Title 5$/,
              content: /^This is a note 5\.$/,
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
          finalArchivePage: {
            visible: [
              {
                title: /^Note Title 4$/,
                content: /^This is a note 4\.$/,
              },
              {
                title: /^Note Title 3$/,
                content: /^This is a note 3\.$/,
              },
            ],
            notVisible: [],
          },
        },
        {
          otherSelection: [1, 2],
          toastMessage: /^3 notes trashed$/,
          finalTrashPage: [
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
          finalArchivePage: {
            visible: [
              {
                title: /^Note Title 3$/,
                content: /^This is a note 3\.$/,
              },
            ],
            notVisible: [
              {
                title: /^Note Title 4$/,
                content: /^This is a note 4\.$/,
              },
            ],
          },
        },
        {
          otherSelection: [1, 2, 3],
          toastMessage: /^4 notes trashed$/,
          finalTrashPage: [
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
          finalArchivePage: {
            visible: [],
            notVisible: [
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
        },
      ].forEach(
        ({
          otherSelection,
          toastMessage,
          finalActivePage,
          finalArchivePage,
          finalTrashPage,
        }) => {
          test(`should trash ${otherSelection.length + 1} searched selected ${otherSelection.length ? 'notes' : 'note'} with ${subsequentSelect} subsequent select`, async ({
            page,
            tapOrClick,
            activeNotesPageFxt,
            trashNotesPageFxt,
          }) => {
            await activeNotesPageFxt.appTopBar.getSearchInput().fill('note');

            await expect(page.getByText(/^Active Notes$/)).toBeVisible();
            await expect(page.getByText(/^Archived Notes$/)).toBeVisible();

            await tapOrClick(
              page
                .getByRole('checkbox', {
                  name: 'Select note',
                })
                .nth(0),
            );

            await expect(page.getByText(/^1 selected$/)).toBeVisible();

            for (const otherSelectionNth of otherSelection) {
              await tapOrClick(
                page
                  .getByRole(subsequentSelect, {
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
                name: /^Trash$/,
              }),
            );

            await expect(page.getByText(toastMessage)).toBeVisible();

            await activeNotesPageFxt.goToTrashNotePage();

            for (const { title, content } of finalTrashPage) {
              await expect(page.getByText(title)).toBeVisible();
              await expect(page.getByText(content)).toBeVisible();
            }

            await trashNotesPageFxt.goToActiveNotePage();

            for (const { title, content } of finalActivePage.notVisible) {
              await expect(page.getByText(title)).not.toBeVisible();
              await expect(page.getByText(content)).not.toBeVisible();
            }

            for (const { title, content } of finalActivePage.visible) {
              await expect(page.getByText(title)).toBeVisible();
              await expect(page.getByText(content)).toBeVisible();
            }

            await activeNotesPageFxt.goToArchiveNotePage();

            for (const { title, content } of finalArchivePage.notVisible) {
              await expect(page.getByText(title)).not.toBeVisible();
              await expect(page.getByText(content)).not.toBeVisible();
            }

            for (const { title, content } of finalArchivePage.visible) {
              await expect(page.getByText(title)).toBeVisible();
              await expect(page.getByText(content)).toBeVisible();
            }
          });
        },
      );
    });
  });

  [
    {
      subsequentSelect: 'checkbox' as const,
    },
    {
      subsequentSelect: 'button' as const,
    },
  ].forEach(({ subsequentSelect }) => {
    test(`should trash selected active notes with ${subsequentSelect} subsequent select`, async ({
      page,
      tapOrClick,
      activeNotesPageFxt,
      trashNotesPageFxt,
    }) => {
      await tapOrClick(
        page
          .getByRole('checkbox', {
            name: 'Select note',
          })
          .nth(0),
      );

      await expect(page.getByText(/^1 selected$/)).toBeVisible();

      await tapOrClick(
        page
          .getByRole(subsequentSelect, {
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
          name: /^Trash$/,
        }),
      );

      await expect(page.getByText(/^2 notes trashed$/)).toBeVisible();

      await activeNotesPageFxt.goToTrashNotePage();

      await expect(page.getByText(/^Note Title 6$/)).toBeVisible();
      await expect(page.getByText(/^This is a note 6\.$/)).toBeVisible();

      await expect(page.getByText(/^Note Title 5$/)).toBeVisible();
      await expect(page.getByText(/^This is a note 5\.$/)).toBeVisible();

      await trashNotesPageFxt.goToActiveNotePage();

      await expect(page.getByText(/^Note Title 6$/)).not.toBeVisible();
      await expect(page.getByText(/^This is a note 6\.$/)).not.toBeVisible();

      await expect(page.getByText(/^Note Title 5$/)).not.toBeVisible();
      await expect(page.getByText(/^This is a note 5\.$/)).not.toBeVisible();
    });

    test(`should trash selected archived notes ${subsequentSelect} subsequent select`, async ({
      page,
      tapOrClick,
      activeNotesPageFxt,
      archiveNotesPageFxt,
      trashNotesPageFxt,
    }) => {
      await activeNotesPageFxt.goToArchiveNotePage();

      await tapOrClick(
        page
          .getByRole('checkbox', {
            name: 'Select note',
          })
          .nth(0),
      );

      await expect(page.getByText(/^1 selected$/)).toBeVisible();

      await tapOrClick(
        page
          .getByRole(subsequentSelect, {
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
          name: /^Trash$/,
        }),
      );

      await expect(page.getByText(/^2 notes trashed$/)).toBeVisible();

      await archiveNotesPageFxt.goToTrashNotePage();

      await expect(page.getByText(/^Note Title 4$/)).toBeVisible();
      await expect(page.getByText(/^This is a note 4\.$/)).toBeVisible();

      await expect(page.getByText(/^Note Title 3$/)).toBeVisible();
      await expect(page.getByText(/^This is a note 3\.$/)).toBeVisible();

      await trashNotesPageFxt.goToArchiveNotePage();

      await expect(page.getByText(/^Note Title 4$/)).not.toBeVisible();
      await expect(page.getByText(/^This is a note 4\.$/)).not.toBeVisible();

      await expect(page.getByText(/^Note Title 3$/)).not.toBeVisible();
      await expect(page.getByText(/^This is a note 3\.$/)).not.toBeVisible();
    });
  });
});
