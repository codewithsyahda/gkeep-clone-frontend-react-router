import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { notes as notesDB } from '../../fakeDB/notes';

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

    const targetedNoteIdx = notesDB.findIndex(
      (n) => n.id === params.noteId && n.authorId === userId,
    );

    if (targetedNoteIdx === -1) {
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

    notesDB.splice(targetedNoteIdx, 1);

    return HttpResponse.json(null, { status: 204 });
  },
);

export default deleteNoteByIdHandler;
