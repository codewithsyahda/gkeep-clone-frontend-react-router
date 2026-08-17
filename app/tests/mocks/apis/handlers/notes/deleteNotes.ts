import { delay, http, HttpResponse } from 'msw';

import envConfig from '~/configs/envs';
import { NotesDB } from '../../fakeDB/notes';

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

    NotesDB.update(
      NotesDB.getAll().filter(
        (n) =>
          n.authorId !== userId ||
          (n.authorId === userId && n.trashedAt === null),
      ),
    );

    return HttpResponse.json(null, { status: 204 });
  },
);

export default deleteNotesHandler;
