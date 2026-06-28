import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { notes as notesDB } from '../../fakeDB/notes';

const getNoteByIdHandler = http.get<{ noteId: string }>(
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

    const { noteId } = params;

    const targetedNote = notesDB.find(
      (n) => n.id === noteId && n.authorId === userId,
    );

    if (!targetedNote) {
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

    return HttpResponse.json({
      data: {
        note: targetedNote,
      },
    });
  },
);

export default getNoteByIdHandler;
