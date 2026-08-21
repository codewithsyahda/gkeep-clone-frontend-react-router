import { useTheme } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, type ChangeEventHandler } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useDebounce } from 'use-debounce';

import DialogNoteDetail from '../DialogNote/DialogNoteDetail/DialogNoteDetail';
import AppSidebarContainer from './_internal-components/AppSidebarContainer';
import AppTopBar from './_internal-components/AppTopBar/AppTopBar';

import useBoolean from '~/hooks/useBoolean';
import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';

const useSession = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/auth/__mocks__/useSession')
    : import('~/hooks/react-query/auth/useSession'))
).default;

const useSignout = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/auth/__mocks__/useSignout')
    : import('~/hooks/react-query/auth/useSignout'))
).default;

export default function NotesPageLayoutContent() {
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const searchNotesQuery = searchParams.get('search-notes')?.trim() || '';

  const [debouncedSearchNotes] = useDebounce(searchNotesQuery, 750);

  const handleSearchNotes: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const searchNotesValue = ev.target.value;

    setSearchParams(
      (searchParams) => {
        if (searchNotesValue) {
          searchParams.set('search-notes', searchNotesValue);
        } else {
          searchParams.delete('search-notes');
        }

        return searchParams;
      },
      { replace: true },
    );
  };

  const muiTheme = useTheme();

  const {
    value: isShowSidebar,
    setTrue: openSidebar,
    setFalse: closeSidebar,
    toggleValue: toggleSidebar,
  } = useBoolean(() => {
    if (typeof window === 'undefined') return false;

    const htmlWidth = document.documentElement.clientWidth;

    if (htmlWidth <= muiTheme.breakpoints.values.md) return false;

    const showSidebarLocalStorage = localStorage.getItem('showSidebar');

    if (showSidebarLocalStorage === '0') return false;

    return true;
  });

  const handleToggleSidebar = () => {
    const htmlWidth = document.documentElement.clientWidth;

    if (htmlWidth >= muiTheme.breakpoints.values.md) {
      localStorage.setItem('showSidebar', isShowSidebar ? '0' : '1');
    }

    toggleSidebar();
  };

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const mutSignout = useSignout();

  const handleSignOut = async () => {
    try {
      await mutSignout.mutateAsync();

      queryClient.removeQueries({
        queryKey: ['session'],
      });

      await navigate('/signin', { replace: true });

      emitSnackbarAlert({
        alertText: 'Signing out is successful',
      });
    } catch {
      emitSnackbarAlert({
        alertText: 'Sign-out is failed',
        alertSeverity: 'error',
      });
    }
  };

  useEffect(() => {
    const closeSidebarWhenResize = () => {
      if (
        document.documentElement.clientWidth <= muiTheme.breakpoints.values.md
      ) {
        closeSidebar();
      } else {
        const showSidebar = localStorage.getItem('showSidebar');

        if (showSidebar === '0') {
          closeSidebar();
        } else {
          openSidebar();
        }
      }
    };

    window.addEventListener('resize', closeSidebarWhenResize);

    return () => {
      window.removeEventListener('resize', closeSidebarWhenResize);
    };
  }, [closeSidebar, muiTheme.breakpoints.values.md, openSidebar]);

  const searchNotesInputRootRef = useRef<HTMLDivElement>(null);

  const session = useSession();

  const sessionData = session.data?.session;

  useEffect(() => {
    if (mutSignout.isPending || mutSignout.isSuccess) return;

    if (!session.isPending && !sessionData) {
      const redirect = async () => {
        await navigate('/signin', { replace: true });

        emitSnackbarAlert({
          alertText: 'Please sign-in first',
          alertSeverity: 'error',
        });
      };

      void redirect();
    }
  }, [
    mutSignout.isPending,
    mutSignout.isSuccess,
    navigate,
    session.isPending,
    sessionData,
  ]);

  const handleCloseDialog = () =>
    navigate({
      hash: '',
      search: searchNotesQuery
        ? `?search-notes=${encodeURIComponent(searchNotesQuery)}`
        : '',
    });

  if (session.isPending || mutSignout.isSuccess || !sessionData) return null;

  const dialogName = location.hash.slice(1).split('/')[0].toLowerCase();
  const isOpenDialogNoteDetail = dialogName === 'notes';

  return (
    <>
      {isOpenDialogNoteDetail && (
        <DialogNoteDetail onClose={handleCloseDialog} />
      )}
      <AppTopBar
        isShowSidebar={isShowSidebar}
        isSigningOut={mutSignout.isPending}
        isSignedOut={mutSignout.isSuccess}
        searchNotesQuery={searchNotesQuery}
        session={{
          name: sessionData.name,
          email: sessionData.email,
        }}
        searchNotesInputRootRef={searchNotesInputRootRef}
        handleToggleSidebar={handleToggleSidebar}
        handleSearchNotes={handleSearchNotes}
        handleSignOut={handleSignOut}
      />
      <AppSidebarContainer
        isShowSidebar={isShowSidebar}
        searchNotesQuery={searchNotesQuery}
        debouncedSearchNotes={debouncedSearchNotes}
        closeSidebar={closeSidebar}
      />
    </>
  );
}
