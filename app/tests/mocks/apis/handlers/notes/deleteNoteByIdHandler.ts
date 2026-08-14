import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { NotesDB } from '../../fakeDB/notes';

const deleteNoteByIdHandler = http.delete<{ noteId: string }>(
  `${envConfig.api.baseUrl}/notes/:noteId`,
  async ({ params, cookies }) => {
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

    const notes = NotesDB.getAll();

    if (!notes.some((n) => n.authorId === userId && n.id === params.noteId)) {
      return HttpResponse.json(
        {
          title: 'Resource Not Found',
          status: 404,
          detail: `Note with ID ${params.noteId} is not found`,
          errors: {},
        },
        { status: 404 },
      );
    }

    NotesDB.update(
      notes.filter(
        (n) =>
          n.authorId !== userId ||
          (n.authorId === userId && n.id !== params.noteId),
      ),
    );

    return HttpResponse.json(null, { status: 204 });
  },
);

export default deleteNoteByIdHandler;
