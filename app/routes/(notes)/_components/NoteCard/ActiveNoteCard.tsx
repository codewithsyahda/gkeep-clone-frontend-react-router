import { ArchiveIcon, InfoIcon, PenSquare, Trash2Icon } from 'lucide-react';
import { useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import Spinner from '~/components/Spinner';
import ButtonCardNoteAction from './_internal-components/ButtonCardNoteAction';
import ButtonLinkCardNoteAction from './_internal-components/ButtonLinkCardNoteAction';
import NoteCardContainer from './_internal-components/NoteCardContainer';

import NoteInfo from './_internal-components/NoteInfo';
import useNoteInfo from './_internal-hooks/useNoteInfo';
import useUpdateNoteByIdMut from './_internal-hooks/useUpdateNoteStatusByIdMut';

export default function ActiveNoteCard({
  noteId,
  noteTitle,
  jsonContent,
  updatedAt,
}: Readonly<{
  noteId: string;
  noteTitle: string;
  jsonContent: string;
  updatedAt: string;
}>) {
  const [searchParams] = useSearchParams();

  const searchNotesQuery = searchParams.get('search-notes') || '';

  const { openInfo, handleToggleOpenInfo } = useNoteInfo(noteId);

  const { patchNoteMut, handleUpdateNote } = useUpdateNoteByIdMut(noteId);

  return (
    <NoteCardContainer
      noteTitle={noteTitle}
      jsonContent={jsonContent}
      actionSection={
        <Stack
          direction="row"
          sx={{
            borderTop: 1,
            borderColor: 'grey.300',
            justifyContent: 'space-between',
            p: 1,
          }}
        >
          <Stack direction="row" spacing={1}>
            <Box
              sx={{
                position: 'relative',
              }}
            >
              <Tooltip title="Info">
                <ButtonCardNoteAction
                  data-component={`note-${noteId}-info-btn`}
                  onClick={handleToggleOpenInfo}
                >
                  <InfoIcon className="size-4" />
                </ButtonCardNoteAction>
              </Tooltip>
              {openInfo && <NoteInfo updatedAt={updatedAt} />}
            </Box>
            <Tooltip title="Archive">
              <ButtonCardNoteAction
                data-action="archive"
                disabled={patchNoteMut.isPending || patchNoteMut.isSuccess}
                onClick={handleUpdateNote}
              >
                {patchNoteMut.isPending &&
                patchNoteMut.variables.data.status ? (
                  <Spinner />
                ) : (
                  <ArchiveIcon className="size-4" />
                )}
              </ButtonCardNoteAction>
            </Tooltip>
            <Tooltip title="Trash">
              <ButtonCardNoteAction
                data-action="trash"
                disabled={patchNoteMut.isPending || patchNoteMut.isSuccess}
                onClick={handleUpdateNote}
              >
                {patchNoteMut.isPending &&
                patchNoteMut.variables.data.isTrashed ? (
                  <Spinner />
                ) : (
                  <Trash2Icon className="size-4" />
                )}
              </ButtonCardNoteAction>
            </Tooltip>
          </Stack>
          <Tooltip title="Edit">
            <ButtonLinkCardNoteAction
              to={{
                pathname: searchNotesQuery ? undefined : '/',
                hash: `#notes/${noteId}`,
                search: searchNotesQuery
                  ? `?search-notes=${encodeURIComponent(searchNotesQuery)}`
                  : '',
              }}
            >
              <PenSquare className="size-4" />
            </ButtonLinkCardNoteAction>
          </Tooltip>
        </Stack>
      }
    />
  );
}
