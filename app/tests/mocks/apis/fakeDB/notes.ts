import { generateText } from '@tiptap/core';

import tiptapConfig from '~/configs/tiptap';

export type TNoteEntity = {
  id: string;
  title: string;
  jsonContent: string;
  textContent: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  trashedAt: string | null;
  authorId: string;
};

type TNotesFakeDB = TNoteEntity[];

export const notes: TNotesFakeDB = [
  {
    id: 'id-note-1',
    title: 'Note Title 1',
    jsonContent:
      '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Note 1 Heading 1"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Note 1 Heading 2"}]},{"type":"paragraph","content":[{"type":"text","text":"Note 1 "},{"type":"text","marks":[{"type":"bold"}],"text":"paragraph"},{"type":"text","text":" 1."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list bullet 1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list bullet 2"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Note 1 "},{"type":"text","marks":[{"type":"italic"}],"text":"paragraph"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"2"},{"type":"text","text":"."}]},{"type":"orderedList","attrs":{"start":1,"type":null},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list #1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 1 list #2"}]}]}]},{"type":"paragraph"}]}',
    createdAt: new Date(2026, 1, 1).toISOString(),
    updatedAt: new Date(2026, 1, 1).toISOString(),
    archivedAt: null,
    trashedAt: null,
    authorId: 'id-user-1',
  },
  {
    id: 'id-note-2',
    title: 'Note Title 2',
    jsonContent:
      '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Note 2 Heading 1"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Note 2 Heading 2"}]},{"type":"paragraph","content":[{"type":"text","text":"Note 2 "},{"type":"text","marks":[{"type":"bold"}],"text":"paragraph"},{"type":"text","text":" 1."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 2 list bullet 1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 2 list bullet 2"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Note 2 "},{"type":"text","marks":[{"type":"italic"}],"text":"paragraph"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"2"},{"type":"text","text":"."}]},{"type":"orderedList","attrs":{"start":1,"type":null},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 2 list #1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 2 list #2"}]}]}]},{"type":"paragraph"}]}',
    createdAt: new Date(2026, 1, 2).toISOString(),
    updatedAt: new Date(2026, 1, 2).toISOString(),
    archivedAt: null,
    trashedAt: null,
    authorId: 'id-user-1',
  },
  {
    id: 'id-note-3',
    title: 'Note Title 3',
    jsonContent:
      '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Note 3 Heading 1"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Note 3 Heading 2"}]},{"type":"paragraph","content":[{"type":"text","text":"Note 3 "},{"type":"text","marks":[{"type":"bold"}],"text":"paragraph"},{"type":"text","text":" 1."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 3 list bullet 1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 3 list bullet 2"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Note 3 "},{"type":"text","marks":[{"type":"italic"}],"text":"paragraph"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"2"},{"type":"text","text":"."}]},{"type":"orderedList","attrs":{"start":1,"type":null},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 3 list #1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 3 list #2"}]}]}]},{"type":"paragraph"}]}',
    createdAt: new Date(2026, 1, 3).toISOString(),
    updatedAt: new Date(2026, 1, 3).toISOString(),
    archivedAt: null,
    trashedAt: null,
    authorId: 'id-user-1',
  },
  {
    id: 'id-note-4',
    title: 'Note Title 4',
    jsonContent:
      '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Note 4 Heading 1"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Note 4 Heading 2"}]},{"type":"paragraph","content":[{"type":"text","text":"Note 4 "},{"type":"text","marks":[{"type":"bold"}],"text":"paragraph"},{"type":"text","text":" 1."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 4 list bullet 1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 4 list bullet 2"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Note 4 "},{"type":"text","marks":[{"type":"italic"}],"text":"paragraph"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"2"},{"type":"text","text":"."}]},{"type":"orderedList","attrs":{"start":1,"type":null},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 4 list #1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 4 list #2"}]}]}]},{"type":"paragraph"}]}',
    createdAt: new Date(2026, 1, 4).toISOString(),
    updatedAt: new Date(2026, 1, 4).toISOString(),
    archivedAt: new Date(2026, 1, 4).toISOString(),
    trashedAt: null,
    authorId: 'id-user-1',
  },
  {
    id: 'id-note-5',
    title: 'Note Titleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee 5',
    jsonContent:
      '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Note 5 Heading 1"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Note 5 Heading 2"}]},{"type":"paragraph","content":[{"type":"text","text":"Note 5 "},{"type":"text","marks":[{"type":"bold"}],"text":"paragraph"},{"type":"text","text":" 1."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 5 list bullet 1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 5 list bullet 2"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Note 5 "},{"type":"text","marks":[{"type":"italic"}],"text":"paragraph"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"2"},{"type":"text","text":"."}]},{"type":"orderedList","attrs":{"start":1,"type":null},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 5 list #1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 5 list #2"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3Note5paragraph3."}]}]}',
    createdAt: new Date(2026, 1, 5).toISOString(),
    updatedAt: new Date(2026, 1, 5).toISOString(),
    archivedAt: new Date(2026, 1, 5).toISOString(),
    trashedAt: null,
    authorId: 'id-user-1',
  },
  {
    id: 'id-note-6',
    title: 'Note Title 6',
    jsonContent:
      '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Note 6 Heading 1"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Note 6 Heading 2"}]},{"type":"paragraph","content":[{"type":"text","text":"Note 6 "},{"type":"text","marks":[{"type":"bold"}],"text":"paragraph"},{"type":"text","text":" 1."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 6 list bullet 1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 6 list bullet 2"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Note 6 "},{"type":"text","marks":[{"type":"italic"}],"text":"paragraph"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"underline"}],"text":"2"},{"type":"text","text":"."}]},{"type":"orderedList","attrs":{"start":1,"type":null},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 6 list #1"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Note 6 list #2"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3Note6paragraph3."}]}]}',
    createdAt: new Date(2026, 1, 6).toISOString(),
    updatedAt: new Date(2026, 1, 6).toISOString(),
    archivedAt: null,
    trashedAt: new Date(2026, 1, 6).toISOString(),
    authorId: 'id-user-1',
  },
  {
    id: 'id-note-7',
    title: 'Untitled',
    jsonContent: '{"type":"doc","content":[{"type":"paragraph"}]}',
    createdAt: new Date(2026, 1, 7).toISOString(),
    updatedAt: new Date(2026, 1, 7).toISOString(),
    archivedAt: new Date(2026, 1, 7).toISOString(),
    trashedAt: new Date(2026, 1, 7).toISOString(),
    authorId: 'id-user-1',
  },
].map((n) => ({
  ...n,
  textContent: generateText(JSON.parse(n.jsonContent), tiptapConfig.extensions)
    .trim()
    .replaceAll(/\s+/g, ' '),
}));
