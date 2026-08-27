import Stack from '@mui/material/Stack';

import AppSidebarContentContainer from './AppSidebarContentContainer';
import AppSidebarMenuContainer from './AppSidebarMenuContainer';

export default function AppSidebarContainer({
  isShowSidebar,
  searchNotesQuery,
  debouncedSearchNotes,
  closeSidebar,
}: Readonly<{
  isShowSidebar: boolean;
  searchNotesQuery: string;
  debouncedSearchNotes: string;
  closeSidebar: () => void;
}>) {
  return (
    <Stack
      data-component="app-sidebar-container"
      direction="row"
      sx={{
        height: 'calc(100dvh - 75px)',
        overflowY: 'clip',
      }}
    >
      <AppSidebarMenuContainer
        isShowSidebar={isShowSidebar}
        closeSidebar={closeSidebar}
      />
      <AppSidebarContentContainer
        searchNotesQuery={searchNotesQuery}
        debouncedSearchNotes={debouncedSearchNotes}
      />
    </Stack>
  );
}
