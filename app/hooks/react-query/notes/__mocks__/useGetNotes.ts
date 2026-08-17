import { useQuery } from '@tanstack/react-query';
import { delay } from 'msw';

import ResponseError from '~/exceptions/responseError';
import { NotesDB } from '~/tests/mocks/apis/fakeDB/notes';

const useGetNotes = ({
  filters: { search, status = {} } = {},
  queryOptions = {},
}: Readonly<{
  filters?: {
    search?: string;
    status?: {
      isActive?: boolean;
      isArchived?: boolean;
      isTrashed?: boolean;
    };
  };
  queryOptions?: {
    enabled?: boolean;
    refetchOnMount?: boolean | 'always';
  };
}> = {}) => {
  const queried = useQuery({
    queryKey: [
      'notes',
      {
        search,
        isActive: status.isActive ?? false,
        isArchived: status.isArchived ?? false,
        isTrashed: status.isTrashed ?? false,
      },
    ],
    queryFn: async () => {
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

      const userNotes = search
        ? notes.filter(
            (n) =>
              n.authorId === userId &&
              (n.title.toLowerCase().includes(search) ||
                n.textContent.toLowerCase().includes(search)),
          )
        : notes.filter((n) => n.authorId === userId);

      const activeNotes = userNotes
        .filter((n) => n.archivedAt === null && n.trashedAt === null)
        .map(
          ({
            textContent: _textContent,
            archivedAt: _archivedAt,
            trashedAt: _trashedAt,
            ...restNoteResponse
          }) => restNoteResponse,
        );

      const archivedNotes = userNotes
        .filter((n) => n.archivedAt !== null && n.trashedAt === null)
        .map(
          ({
            textContent: _textContent,
            archivedAt: _archivedAt,
            trashedAt: _trashedAt,
            ...restNoteResponse
          }) => restNoteResponse,
        );

      const trashNotes = userNotes
        .filter((n) => n.trashedAt !== null)
        .map(
          ({
            textContent: _textContent,
            archivedAt: _archivedAt,
            trashedAt: _trashedAt,
            ...restNoteResponse
          }) => restNoteResponse,
        );

      if (status.isActive || status.isArchived || status.isTrashed) {
        return {
          notes: {
            active: status.isActive ? activeNotes : [],
            archived: status.isArchived ? archivedNotes : [],
            trash: status.isTrashed ? trashNotes : [],
          },
        };
      }

      return {
        notes: {
          active: activeNotes,
          archived: archivedNotes,
          trash: trashNotes,
        },
      };
    },
    enabled: queryOptions.enabled,
    refetchOnMount: queryOptions.refetchOnMount,
  });

  return queried;
};

export default useGetNotes;
