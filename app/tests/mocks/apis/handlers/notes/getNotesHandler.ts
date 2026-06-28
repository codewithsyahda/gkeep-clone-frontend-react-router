import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { notes as notesDB } from '../../fakeDB/notes';

const getNotesHandler = http.get(
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

    const url = new URL(request.url);

    const searchQuery = url.searchParams.get('search')?.trim().toLowerCase();

    const userNotes = searchQuery
      ? notesDB.filter(
          (n) =>
            n.authorId === userId &&
            (n.title.toLowerCase().includes(searchQuery) ||
              n.textContent.toLowerCase().includes(searchQuery)),
        )
      : notesDB.filter((n) => n.authorId === userId);

    const isActiveQuery = url.searchParams.get('is_active') === 'true';
    const isArchivedQuery = url.searchParams.get('is_archived') === 'true';
    const isTrashedQuery = url.searchParams.get('is_trashed') === 'true';

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

    if (isActiveQuery || isArchivedQuery || isTrashedQuery) {
      return HttpResponse.json({
        data: {
          notes: {
            active: isActiveQuery ? activeNotes : [],
            archived: isArchivedQuery ? archivedNotes : [],
            trash: isTrashedQuery ? trashNotes : [],
          },
        },
      });
    }

    return HttpResponse.json({
      data: {
        notes: {
          active: activeNotes,
          archived: archivedNotes,
          trash: trashNotes,
        },
      },
    });
  },
);

export default getNotesHandler;
