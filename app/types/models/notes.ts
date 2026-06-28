export type TNoteStatus = 'active' | 'archived';

export type TNoteSimpleResponse = {
  id: string;
  title: string;
  jsonContent: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
};

export type TNoteDetailResponse = TNoteSimpleResponse & {
  archivedAt: string | null;
  trashedAt: string | null;
};

export type TCreateNoteRequest = {
  title: string;
  jsonContent: string;
};

export type TMutateNoteRequest = {
  title: string;
  jsonContent: string;
  status: TNoteStatus;
  isTrashed: boolean;
};

export type TMutateNoteActions =
  | 'update-data'
  | 'archive'
  | 'unarchive'
  | 'trash'
  | 'restore';
