import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Spinner from '~/components/Spinner';
import envConfig from '~/configs/envs';
import SidebarContentAlertContainer from '~/routes/_components/SidebarContentAlertContainer';
import ArchivedNoteCard from '../../_components/NoteCard/ArchivedNoteCard';

const isLocalDev =
  import.meta.env.DEV &&
  !envConfig.dev.mock.msw &&
  import.meta.env.STORYBOOK !== true &&
  import.meta.env.MODE === 'development';

const useGetNotes = (
  await (isLocalDev
    ? import('~/hooks/react-query/notes/__mocks__/useGetNotes')
    : import('~/hooks/react-query/notes/useGetNotes'))
).default;

export default function ArchivedNotesPageContent() {
  const { isFetchedAfterMount, data } = useGetNotes({
    filters: {
      status: {
        isArchived: true,
      },
    },
    queryOptions: {
      refetchOnMount: true,
    },
  });

  const notes = data?.notes.archived ?? [];

  return (
    <>
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
                Archived notes appear here.
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
                    <ArchivedNoteCard
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
    </>
  );
}
