import { generateText } from '@tiptap/core';
import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import tiptapConfig from '~/configs/tiptap';
import type { TCreateNoteRequest } from '~/types/models/notes';
import { NotesDB, type TNoteEntity } from '../../fakeDB/notes';

const postNoteHandler = http.post(
  `${envConfig.api.baseUrl}/notes`,
  async ({ request, cookies }) => {
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

    const { title, jsonContent } = (await request
      .clone()
      .json()) as TCreateNoteRequest;

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

    const newNote: TNoteEntity = {
      id: `id-note-${Date.now()}`,
      title: sanitizedTitle || 'Untitled',
      jsonContent,
      textContent: generateText(
        JSON.parse(jsonContent),
        tiptapConfig.extensions,
      )
        .trim()
        .replaceAll(/\s+/g, ' '),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
      trashedAt: null,
      authorId: userId,
    };

    NotesDB.update([...NotesDB.getAll(), newNote]);

    const {
      textContent: _textContent,
      archivedAt: _archivedAt,
      trashedAt: _trashedAt,
      ...restNoteResponse
    } = newNote;

    return HttpResponse.json(
      {
        data: {
          note: restNoteResponse,
        },
      },
      { status: 201 },
    );
  },
);

export default postNoteHandler;
