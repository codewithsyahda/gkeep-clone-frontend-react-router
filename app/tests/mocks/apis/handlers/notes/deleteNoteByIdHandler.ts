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

    const targetedNoteIdx = notes.findIndex(
      (n) =>
        n.id === params.noteId && n.authorId === userId && n.trashedAt !== null,
    );

    if (targetedNoteIdx) {
      notes.splice(targetedNoteIdx, 1);
      NotesDB.update(notes);
    }

    return HttpResponse.json(null, { status: 204 });
  },
);

export default deleteNoteByIdHandler;
