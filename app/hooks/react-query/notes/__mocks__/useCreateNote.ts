import { useMutation } from '@tanstack/react-query';
import { generateText } from '@tiptap/core';
import { delay } from 'msw';

import tiptapConfig from '~/configs/tiptap';
import ResponseError from '~/exceptions/responseError';
import { NotesDB, type TNoteEntity } from '~/tests/mocks/apis/fakeDB/notes';
import type { TCreateNoteRequest } from '~/types/models/notes';

const useCreateNote = () => {
  const mutation = useMutation({
    mutationFn: async (payload: TCreateNoteRequest) => {
      await delay('real');

      const userId = window.sessionStorage.getItem('auth.user_id');

      if (!userId) {
        throw new ResponseError({
          status: 401,
          message: 'Authentication is required.',
          errors: {},
        });
      }

      const { title, jsonContent } = payload;

      const sanitizedTitle = title.trim().replaceAll(/\s+/g, ' ');

      if (sanitizedTitle.toLowerCase() === '[test 500]') {
        throw new ResponseError({
          status: 500,
          message: 'Cannot process the client request.',
          errors: {},
        });
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

      return {
        note: restNoteResponse,
      };
    },
  });

  return mutation;
};

export default useCreateNote;
