import deleteNoteByIdHandler from './notes/deleteNoteByIdHandler';
import deleteNotesHandler from './notes/deleteNotesHandler';
import getNoteByIdHandler from './notes/getNoteByIdHandler';
import getNotesHandler from './notes/getNotesHandler';
import patchNoteById from './notes/patchNoteById';
import postNoteHandler from './notes/postNoteHandler';
import putNoteById from './notes/putNoteById';
import sessionHandler from './users/sessionHandler';
import signInHandler from './users/signInHandler';
import signOutHandler from './users/signOutHandler';
import signUpHandler from './users/signUpHandler';

export const mswNotesHandlers = [
  sessionHandler,
  signInHandler,
  signUpHandler,
  signOutHandler,
  getNotesHandler,
  postNoteHandler,
  deleteNotesHandler,
  getNoteByIdHandler,
  putNoteById,
  patchNoteById,
  deleteNoteByIdHandler,
];
