import { HttpResponse, delay, http } from 'msw';

import envConfig from '~/configs/envs';
import { notes as notesDB } from '~/tests/mocks/apis/fakeDB/notes';

export const mockGetNotesHandler = ({
  emptyNotes,
  delayInfinite,
}: Readonly<{
  emptyNotes?: boolean;
  delayInfinite?: boolean;
}> = {}) =>
  http.get(`${envConfig.api.baseUrl}/notes`, async () => {
    if (delayInfinite) {
      await delay('infinite');
    }

    await delay('real');

    if (emptyNotes) {
      return HttpResponse.json({
        data: {
          notes: {
            active: [],
            archived: [],
            trash: [],
          },
        },
      });
    }

    return HttpResponse.json({
      data: {
        notes: {
          active: notesDB.slice(0, 3),
          archived: notesDB.slice(0, 3),
          trash: notesDB.slice(0, 3),
        },
      },
    });
  });

export const mockGetNoteByIdHandler = ({
  status = 'active',
  errorStatus,
  delayInfinite,
}: Readonly<{
  status?: 'active' | 'archived' | 'trashed';
  errorStatus?: '404' | '500';
  delayInfinite?: boolean;
}> = {}) =>
  http.get<{ noteId: string }>(
    `${envConfig.api.baseUrl}/notes/:noteId`,
    async () => {
      if (delayInfinite) {
        await delay('infinite');
      }

      await delay('real');

      if (errorStatus === '404') {
        return HttpResponse.json(
          {
            title: 'Resource Not Found',
            status: 404,
            detail: 'Note is not found.',
            errors: {},
          },
          { status: 404 },
        );
      }

      if (errorStatus === '500') {
        return HttpResponse.json(
          {
            title: 'Internal Server Error',
            status: 500,
            detail: 'Cannot process the request.',
            errors: {},
          },
          { status: 500 },
        );
      }

      if (status === 'active') {
        return HttpResponse.json({
          data: {
            note: {
              ...notesDB[0],
              archivedAt: null,
              trashedAt: null,
            },
          },
        });
      }

      if (status === 'archived') {
        return HttpResponse.json({
          data: {
            note: {
              ...notesDB[0],
              archivedAt: new Date(2026, 1, 2).toISOString(),
              trashedAt: null,
            },
          },
        });
      }

      return HttpResponse.json({
        data: {
          note: {
            ...notesDB[0],
            archivedAt: null,
            trashedAt: new Date(2026, 1, 2).toISOString(),
          },
        },
      });
    },
  );

export const mockPostNoteHandler = ({
  errorStatus,
  delayInfinite,
}: Readonly<{
  errorStatus?: '400' | '500';
  delayInfinite?: boolean;
}> = {}) =>
  http.post(`${envConfig.api.baseUrl}/notes`, async () => {
    if (delayInfinite) {
      await delay('infinite');
    }

    await delay('real');

    if (errorStatus === '400') {
      return HttpResponse.json(
        {
          title: 'Body Request Validation Error',
          status: 400,
          detail: 'One or more body request fields are invalid.',
          errors: {},
        },
        { status: 400 },
      );
    }

    if (errorStatus === '500') {
      return HttpResponse.json(
        {
          title: 'Internal Server Error',
          status: 500,
          detail: 'Cannot process the request.',
          errors: {},
        },
        { status: 500 },
      );
    }

    return HttpResponse.json(
      {
        data: {
          note: {
            id: `id-note-${Date.now()}`,
            title: 'Title Note',
            jsonContent: '{}',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            authorId: 'id-user-1',
          },
        },
      },
      { status: 201 },
    );
  });

export const mockPutNoteByIdHandler = ({
  delayInfinite,
}: Readonly<{
  delayInfinite?: boolean;
}> = {}) =>
  http.put<{
    noteId: string;
  }>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
    if (delayInfinite) {
      await delay('infinite');
    }

    await delay('real');

    return HttpResponse.json({
      data: {
        note: {
          id: `id-note-${Date.now()}`,
          title: 'Title Note',
          jsonContent: '{}',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authorId: 'id-user-1',
        },
      },
    });
  });

export const mockPatchNoteByIdHandler = ({
  errorStatus,
  delayInfinite,
}: Readonly<{
  errorStatus?: '500';
  delayInfinite?: boolean;
}> = {}) =>
  http.patch<{
    noteId: string;
  }>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
    if (delayInfinite) {
      await delay('infinite');
    }

    await delay('real');

    if (errorStatus === '500') {
      return HttpResponse.json(
        {
          title: 'Internal Server Error',
          status: 500,
          detail: 'Cannot process the request.',
          errors: {},
        },
        { status: 500 },
      );
    }

    return HttpResponse.json({
      data: {
        note: {
          id: `id-note-${Date.now()}`,
          title: 'Title Note',
          jsonContent: '{}',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authorId: 'id-user-1',
        },
      },
    });
  });

export const mockDeleteNotesHandler = ({
  delayInfinite,
}: Readonly<{
  delayInfinite?: boolean;
}> = {}) =>
  http.delete<{ noteId: string }>(
    `${envConfig.api.baseUrl}/notes`,
    async () => {
      if (delayInfinite) {
        await delay('infinite');
      }

      await delay('real');

      return HttpResponse.json(null, { status: 204 });
    },
  );

export const mockDeleteNoteByIdHandler = ({
  errorStatus,
  delayInfinite,
}: Readonly<{
  errorStatus?: '500';
  delayInfinite?: boolean;
}> = {}) =>
  http.delete<{ noteId: string }>(
    `${envConfig.api.baseUrl}/notes/:noteId`,
    async () => {
      if (delayInfinite) {
        await delay('infinite');
      }

      await delay('real');

      if (errorStatus === '500') {
        return HttpResponse.json(
          {
            title: 'Internal Server Error',
            status: 500,
            detail: 'Cannot process the request.',
            errors: {},
          },
          { status: 500 },
        );
      }

      return HttpResponse.json(null, { status: 204 });
    },
  );
