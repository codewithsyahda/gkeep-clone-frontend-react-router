import { HttpResponse, delay, http } from 'msw';

import envConfig from '~/configs/envs';
import { notes as notesDB } from '~/tests/mocks/apis/fakeDB/notes';

export const getNotesHandler = http.get(
  `${envConfig.api.baseUrl}/notes`,
  async () => {
    await delay('real');
    return HttpResponse.json({
      data: {
        notes: {
          active: notesDB.slice(0, 3),
          archived: notesDB.slice(0, 3),
          trash: notesDB.slice(0, 3),
        },
      },
    });
  },
);

export const getNotesLoadingHandler = http.get(
  `${envConfig.api.baseUrl}/notes`,
  async () => {
    await delay('infinite');
  },
);

export const getEmptyNotesHandler = http.get(
  `${envConfig.api.baseUrl}/notes`,
  async () => {
    await delay('real');
    return HttpResponse.json({
      data: {
        notes: {
          active: [],
          archived: [],
          trash: [],
        },
      },
    });
  },
);

export const getActiveNoteByIdHandler = http.get<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('real');
    return HttpResponse.json({
      data: {
        note: {
          ...notesDB[0],
          archivedAt: null,
          trashedAt: null,
        },
      },
    });
  },
);

export const getArchivedNoteByIdHandler = http.get<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('real');
    return HttpResponse.json({
      data: {
        note: {
          ...notesDB[0],
          archivedAt: new Date(2026, 1, 2).toISOString(),
          trashedAt: null,
        },
      },
    });
  },
);

export const getTrashedNoteByIdHandler = http.get<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('real');
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

export const getNoteByIdLoadingHandler = http.get<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('infinite');
  },
);

export const getNoteByIdClientErrorHandler = http.get<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('real');
    return HttpResponse.json(
      {
        title: 'Resource Not Found',
        status: 404,
        detail: 'Note is not found.',
        errors: {},
      },
      { status: 404 },
    );
  },
);

export const getNoteByIdServerErrorHandler = http.get<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('real');
    return HttpResponse.json(
      {
        title: 'Internal Server Error',
        status: 500,
        detail: 'Cannot process the request.',
        errors: {},
      },
      { status: 500 },
    );
  },
);

export const postNoteHandler = http.post(
  `${envConfig.api.baseUrl}/notes`,
  async () => {
    await delay('real');
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
  },
);

export const postNoteLoadingHandler = http.post(
  `${envConfig.api.baseUrl}/notes`,
  async () => {
    await delay('infinite');
  },
);

export const putNoteByIdHandler = http.put<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
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

export const putNoteByIdLoadingHandler = http.put<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
  await delay('infinite');
});

export const patchNoteByIdHandler = http.patch<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
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

export const patchNoteByIdLoadingHandler = http.patch<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
  await delay('infinite');
});

export const patchNoteByIdServerErrorHandler = http.patch<{
  noteId: string;
}>(`${envConfig.api.baseUrl}/notes/:noteId`, async () => {
  await delay('real');
  return HttpResponse.json(
    {
      title: 'Internal Server Error',
      status: 500,
      detail: 'Cannot process the request.',
      errors: {},
    },
    { status: 500 },
  );
});

export const deleteNotesHandler = http.delete<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes`,
  async () => {
    await delay('real');
    return HttpResponse.json(null, { status: 204 });
  },
);

export const deleteNotesLoadingHandler = http.delete(
  `${envConfig.api.baseUrl}/notes`,
  async () => {
    await delay('infinite');
  },
);

export const deleteNoteByIdHandler = http.delete<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('real');
    return HttpResponse.json(null, { status: 204 });
  },
);

export const deleteNoteByIdLoadingHandler = http.delete(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('infinite');
  },
);

export const deleteNoteByIdServerErrorHandler = http.delete<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async () => {
    await delay('real');
    return HttpResponse.json(null, { status: 500 });
  },
);
