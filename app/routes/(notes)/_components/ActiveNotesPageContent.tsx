import { PlusIcon } from 'lucide-react';
import { useLocation } from 'react-router';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ButtonLink from '~/components/custom-mui/ButtonLink';
import Spinner from '~/components/Spinner';
import SidebarContentAlertContainer from '../../_components/SidebarContentAlertContainer';
import DialogCreateNote from './../_components/DialogNote/DialogCreateNote';
import ActiveNoteCard from './../_components/NoteCard/ActiveNoteCard';

import useSelectionNotesCtx from '~/hooks/useSelectionNotesCtx';

const useGetNotes = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/notes/__mocks__/useGetNotes')
    : import('~/hooks/react-query/notes/useGetNotes'))
).default;

export default function ActiveNotesPageContent() {
  const { isFetchedAfterMount, data } = useGetNotes({
    filters: {
      status: {
        isActive: true,
      },
    },
    queryOptions: {
      refetchOnMount: true,
    },
  });

  const location = useLocation();

  const dialogName = location.hash.slice(1).split('/')[0].toLowerCase();

  const isOpenDialogCreateNote = dialogName === 'create';

  const notes = data?.notes.active ?? [];

  const selectionNotesCtx = useSelectionNotesCtx();

  return (
    <>
      {isOpenDialogCreateNote && <DialogCreateNote />}
      {!isFetchedAfterMount && (
        <SidebarContentAlertContainer>
          <Spinner size={36} />
        </SidebarContentAlertContainer>
      )}
      {isFetchedAfterMount && (
        <>
          {notes.length === 0 && (
            <SidebarContentAlertContainer>
              <Typography
                sx={{
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  py: 1,
                  px: 2,
                }}
              >
                Notes clear. Enjoy and take a break.
              </Typography>
            </SidebarContentAlertContainer>
          )}
          {notes.length !== 0 && (
            <Grid
              spacing={2}
              sx={{
                pb: 12,
                minHeight: '100%',
                width: '100%',
              }}
              container
            >
              {[...notes]
                .sort(
                  (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
                )
                .map((n) => (
                  <Grid
                    key={n.id}
                    size={{
                      xs: 12,
                      lg: 6,
                    }}
                  >
                    <ActiveNoteCard
                      noteId={n.id}
                      noteTitle={n.title}
                      jsonContent={n.jsonContent}
                      updatedAt={n.updatedAt}
                    />
                  </Grid>
                ))}
            </Grid>
          )}
        </>
      )}
      {selectionNotesCtx.notes.length === 0 && (
        <ButtonLink
          variant="contained"
          to={{
            hash: '#create',
          }}
          startIcon={
            <Box
              component={PlusIcon}
              sx={{
                width: 16,
                height: 16,
              }}
            />
          }
          style={{
            display: isOpenDialogCreateNote ? 'none' : undefined,
          }}
          sx={{
            position: 'fixed',
            bottom: {
              xs: 16,
              md: 20,
            },
            right: {
              xs: 16,
              md: 24,
            },
          }}
        >
          Create
        </ButtonLink>
      )}
    </>
  );
}
