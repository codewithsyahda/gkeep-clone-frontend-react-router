import { useQuery } from '@tanstack/react-query';
import { delay } from 'msw';

import ResponseError from '~/exceptions/responseError';
import { NotesDB } from '~/tests/mocks/apis/fakeDB/notes';

const useGetNoteById = ({
  noteId,
  queryOptions = {
    retry: false,
  },
}: Readonly<{
  noteId: string;
  queryOptions?: {
    enabled?: boolean;
    retry?: boolean | number;
    refetchOnMount?: boolean | 'always';
  };
}>) => {
  const queried = useQuery({
    queryKey: ['notes', noteId],
    queryFn: async () => {
      if (noteId.trim() === '')
        throw new Error('Note ID must be valid and non empty string value');

      await delay('real');

      const userId = window.sessionStorage.getItem('auth.user_id');

      if (!userId) {
        throw new ResponseError({
          status: 401,
          message: 'Authentication is required.',
          errors: {},
        });
      }

      const notes = NotesDB.getAll();

      const targetedNote = notes.find(
        (n) => n.id === noteId && n.authorId === userId,
      );

      if (!targetedNote) {
        throw new ResponseError({
          status: 404,
          message: `Note with ID ${noteId} is not found`,
          errors: {},
        });
      }

      return {
        note: targetedNote,
      };
    },
    enabled: queryOptions.enabled,
    retry: queryOptions.retry,
    refetchOnMount: queryOptions.refetchOnMount,
  });

  return queried;
};

export default useGetNoteById;
