import { generateText } from '@tiptap/core';
import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import tiptapConfig from '~/configs/tiptap';
import type { TMutateNoteRequest } from '~/types/models/notes';
import { NotesDB } from '../../fakeDB/notes';

const patchNoteByIdHandler = http.patch<{ noteId: string }>(
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

    const bodyRequest = (await request
      .clone()
      .json()) as Partial<TMutateNoteRequest>;

    const title = bodyRequest.title ?? null;
    const jsonContent = bodyRequest.jsonContent ?? null;
    const status = bodyRequest.status ?? null;
    const isTrashed = bodyRequest.isTrashed ?? null;

    const allBodyRequestNull =
      title === null &&
      jsonContent === null &&
      status === null &&
      isTrashed === null;

    if (allBodyRequestNull) {
      return HttpResponse.json(
        {
          title: 'Body Request Validation Error',
          status: 400,
          detail: 'Body request must have at least one field.',
          errors: {},
        },
        { status: 400 },
      );
    }

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

    if (
      (title !== null &&
        title.trim().replaceAll(/\s+/g, ' ') !== targetedNote.title) ||
      (jsonContent !== null && jsonContent !== targetedNote.jsonContent)
    ) {
      targetedNote.updatedAt = new Date().toISOString();
    }

    if (title !== null) {
      targetedNote.title = title.trim().replaceAll(/\s+/g, ' ') || 'Untitled';
    }

    if (jsonContent !== null) {
      targetedNote.jsonContent = jsonContent;

      targetedNote.textContent = generateText(
        JSON.parse(jsonContent),
        tiptapConfig.extensions,
      )
        .trim()
        .replaceAll(/\s+/g, ' ');
    }

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

export default patchNoteByIdHandler;
