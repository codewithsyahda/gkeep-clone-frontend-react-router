import { generateText } from '@tiptap/core';
import { delay } from 'msw';

import tiptapConfig from '~/configs/tiptap';
import ResponseError from '~/exceptions/responseError';
import { NotesDB } from '~/tests/mocks/apis/fakeDB/notes';
import type { TMutateNoteRequest } from '~/types/models/notes';

export default async function patchNoteById({
  noteId,
  payload,
}: Readonly<{
  noteId: string;
  payload: Partial<TMutateNoteRequest>;
}>) {
  await delay('real');

  const userId = window.sessionStorage.getItem('auth.user_id');

  if (!userId) {
    throw new ResponseError({
      status: 401,
      message: 'Authentication is required.',
      errors: {},
    });
  }

  const title = payload.title ?? null;
  const jsonContent = payload.jsonContent ?? null;
  const status = payload.status ?? null;
  const isTrashed = payload.isTrashed ?? null;

  const allBodyRequestNull =
    title === null &&
    jsonContent === null &&
    status === null &&
    isTrashed === null;

  if (allBodyRequestNull) {
    throw new ResponseError({
      status: 400,
      message: 'Body request must have at least one field.',
      errors: {},
    });
  }

  const notes = NotesDB.getAll();

  const targetedNoteIdx = notes.findIndex(
    (n) => n.id === noteId && n.authorId === userId,
  );

  if (targetedNoteIdx === -1) {
    throw new ResponseError({
      status: 404,
      message: `Note with ID ${noteId} is not found`,
      errors: {},
    });
  }

  const targetedNote = notes[targetedNoteIdx];

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

  if (
    (title !== null &&
      title.trim().replaceAll(/\s+/g, ' ') !== targetedNote.title) ||
    (jsonContent !== null && jsonContent !== targetedNote.jsonContent)
  ) {
    targetedNote.updatedAt = new Date().toISOString();
  }

  if (status === 'active') {
    targetedNote.archivedAt = null;
  }

  if (status === 'archived') {
    targetedNote.archivedAt =
      targetedNote.archivedAt ?? new Date().toISOString();
  }

  if (isTrashed) {
    targetedNote.trashedAt = targetedNote.trashedAt ?? new Date().toISOString();
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

  return {
    note: restNoteResponse,
  };
}
