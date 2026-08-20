import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Spinner from '~/components/Spinner';
import SidebarContentAlertContainer from '~/routes/_components/SidebarContentAlertContainer';
import ActiveNoteCard from '../../NoteCard/ActiveNoteCard';
import ArchivedNoteCard from '../../NoteCard/ArchivedNoteCard';

import useGetNotes from '~/hooks/react-query/notes/useGetNotes';
import useNotesSelectionCtx from '~/hooks/useNotesSelectionCtx';

export default function AppSidebarContentContainer({
  searchNotesQuery,
  debouncedSearchNotes,
}: Readonly<{
  searchNotesQuery: string;
  debouncedSearchNotes: string;
}>) {
  const { data: searchedNotes } = useGetNotes({
    filters: {
      search: debouncedSearchNotes,
      status: {
        isActive: true,
        isArchived: true,
      },
    },
    queryOptions: {
      enabled: !!debouncedSearchNotes,
    },
  });

  const searchedActiveNotes = searchedNotes?.notes.active;
  const searchedArchivedNotes = searchedNotes?.notes.archived;

  const searchedNotesEmpty =
    searchedActiveNotes?.length === 0 && searchedArchivedNotes?.length === 0;

  const notesSelectionCtx = useNotesSelectionCtx();

  const appSidebarContentContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const appSidebarContentContainer = appSidebarContentContainerRef.current;

    if (!appSidebarContentContainer) return;

    const handlePointerUp = (ev: PointerEvent) => {
      const evTarget = ev.target as HTMLElement;

      if (
        evTarget.closest('[data-component="app-sidebar-content-container"]') &&
        !evTarget.closest('[data-component="note-card-container"]')
      ) {
        setTimeout(() => notesSelectionCtx.unselectAll(), 100);
      }
    };

    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [notesSelectionCtx]);

  return (
    <Box
      ref={appSidebarContentContainerRef}
      data-component="app-sidebar-content-container"
      sx={{
        flexBasis: '100%',
        position: 'relative',
        py: 4,
        px: {
          xs: 2,
          md: 4,
        },
        minHeight: '100%',
        maxHeight: '100%',
        overflowY: 'auto',
      }}
    >
      {searchNotesQuery && !searchedNotes && (
        <SidebarContentAlertContainer>
          <Spinner size={36} />
        </SidebarContentAlertContainer>
      )}
      {searchNotesQuery && searchedNotesEmpty && (
        <SidebarContentAlertContainer>
          <Typography
            sx={{
              backgroundColor: 'grey.100',
              borderRadius: 1,
              py: 1,
              px: 2,
            }}
          >
            No matching results.
          </Typography>
        </SidebarContentAlertContainer>
      )}
      {searchNotesQuery && !searchedNotesEmpty && (
        <Stack spacing={6}>
          {searchedActiveNotes && searchedActiveNotes.length !== 0 && (
            <Stack spacing={2}>
              <Typography variant="h6" component="h2">
                Active Notes
              </Typography>

              <Grid
                spacing={2}
                sx={{
                  minHeight: '100%',
                  width: '100%',
                }}
                container
              >
                {[...searchedActiveNotes]
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
            </Stack>
          )}
          {searchedArchivedNotes && searchedArchivedNotes.length !== 0 && (
            <Stack spacing={2}>
              <Typography variant="h6" component="h2">
                Archived Notes
              </Typography>

              <Grid
                spacing={2}
                sx={{
                  minHeight: '100%',
                  width: '100%',
                }}
                container
              >
                {[...searchedArchivedNotes]
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
                      <ArchivedNoteCard
                        noteId={n.id}
                        noteTitle={n.title}
                        jsonContent={n.jsonContent}
                        updatedAt={n.updatedAt}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Stack>
          )}
        </Stack>
      )}
      {!searchNotesQuery && <Outlet />}
    </Box>
  );
}
