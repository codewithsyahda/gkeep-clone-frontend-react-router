import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { notes as notesDB } from '../../fakeDB/notes';

const deleteNotesHandler = http.delete(
  `${envConfig.api.baseUrl}/notes`,
  async ({ cookies }) => {
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

    notesDB
      .filter((n) => n.trashedAt !== null && n.authorId === userId)
      .forEach(() => {
        notesDB.splice(
          notesDB.findIndex(
            (n) => n.trashedAt !== null && n.authorId === userId,
          ),
          1,
        );
      });

    return HttpResponse.json(null, { status: 204 });
  },
);

export default deleteNotesHandler;
