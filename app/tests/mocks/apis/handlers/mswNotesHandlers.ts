import deleteNoteByIdHandler from './notes/deleteNoteById';
import deleteNotesHandler from './notes/deleteNotes';
import getNoteByIdHandler from './notes/getNoteById';
import getNotesHandler from './notes/getNotes';
import patchNoteByIdHandler from './notes/patchNoteById';
import postNoteHandler from './notes/postNote';
import putNoteByIdHandler from './notes/putNoteById';
import getSessionHandler from './users/getSession';
import signInEmailHandler from './users/signInEmail';
import signOutHandler from './users/signOut';
import signUpEmailHandler from './users/signUpEmail';

export const mswNotesHandlers = [
  getSessionHandler,
  signInEmailHandler,
  signUpEmailHandler,
  signOutHandler,
  getNotesHandler,
  postNoteHandler,
  deleteNotesHandler,
  getNoteByIdHandler,
  putNoteByIdHandler,
  patchNoteByIdHandler,
  deleteNoteByIdHandler,
];
