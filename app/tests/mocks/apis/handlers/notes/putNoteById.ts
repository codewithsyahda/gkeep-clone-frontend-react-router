import { generateText } from '@tiptap/core';
import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import tiptapConfig from '~/configs/tiptap';
import type { TMutateNoteRequest } from '~/types/models/notes';
import { NotesDB } from '../../fakeDB/notes';

const putNoteByIdHandler = http.put<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async ({ request, params, cookies }) => {
    await delay('real');

    const userId = cookies['auth.user_id'];

    if (!userId) {
      return HttpResponse.json(
        {
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication is required.',
          errors: {},
        },
        { status: 401 },
      );
    }

    const { noteId } = params;

    const { title, jsonContent, status, isTrashed } = (await request
      .clone()
      .json()) as TMutateNoteRequest;

    const notes = NotesDB.getAll();

    const targetedNoteIdx = notes.findIndex(
      (n) => n.id === noteId && n.authorId === userId,
    );

    if (targetedNoteIdx === -1) {
      return HttpResponse.json(
        {
          title: 'Resource Not Found',
          status: 404,
          detail: `Note with ID ${noteId} is not found`,
          errors: {},
        },
        { status: 404 },
      );
    }

    const targetedNote = notes[targetedNoteIdx];
    const sanitizedTitle = title.trim().replaceAll(/\s+/g, ' ');

    if (sanitizedTitle.toLowerCase() === '[test 500]') {
      return HttpResponse.json(
        {
          title: 'Internal Server Error',
          status: 500,
          detail: 'Cannot process the client request.',
          errors: {},
        },
        { status: 500 },
      );
    }

    targetedNote.title = sanitizedTitle || 'Untitled';
    targetedNote.jsonContent = jsonContent;

    targetedNote.textContent = generateText(
      JSON.parse(jsonContent),
      tiptapConfig.extensions,
    )
      .trim()
      .replaceAll(/\s+/g, ' ');

    targetedNote.updatedAt =
      sanitizedTitle === targetedNote.title ||
      jsonContent === targetedNote.jsonContent
        ? targetedNote.updatedAt
        : new Date().toISOString();

    if (status === 'active') {
      targetedNote.archivedAt = null;
    }

    if (status === 'archived') {
      targetedNote.archivedAt =
        targetedNote.archivedAt ?? new Date().toISOString();
    }

    if (isTrashed) {
      targetedNote.trashedAt =
        targetedNote.trashedAt ?? new Date().toISOString();
    } else {
      targetedNote.trashedAt = null;
    }

    NotesDB.update(notes);

    const {
      textContent: _tC,
      archivedAt: _aT,
      trashedAt: _tA,
      ...restNoteResponse
    } = targetedNote;

    return HttpResponse.json({
      data: {
        note: restNoteResponse,
      },
    });
  },
);

export default putNoteByIdHandler;
