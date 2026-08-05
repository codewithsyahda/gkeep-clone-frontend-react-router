import {
  useEffect,
  type ChangeEventHandler,
  type MouseEventHandler,
  type RefObject,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation } from 'react-router';

import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { MenuIcon } from 'lucide-react';

import AppBrandLogo from '~/routes/_components/AppBrandLogo';
import AppTopIconButtonBase from './AppTopIconButtonBase';
import UserMenu from './UserMenu';

export default function AppTopMainBar({
  isShowSidebar,
  isSigningOut,
  isSignedOut,
  searchNotesQuery,
  session,
  searchNotesInputRootRef,
  handleToggleSidebar,
  handleSearchNotes,
  handleSignOut,
}: Readonly<{
  isShowSidebar: boolean;
  isSigningOut: boolean;
  isSignedOut: boolean;
  searchNotesQuery: string;
  session: {
    name: string;
    email: string;
  };
  searchNotesInputRootRef: RefObject<HTMLDivElement | null>;
  handleToggleSidebar: MouseEventHandler<HTMLButtonElement>;
  handleSearchNotes: ChangeEventHandler<HTMLInputElement>;
  handleSignOut: MouseEventHandler<HTMLButtonElement>;
}>) {
  const location = useLocation();

  /**
   * The useEffect code below synchronizes the search notes
   * input element value to the search-notes query param.
   *
   * Specific edge case:
   * Removes the search notes input element value when
   * navigating to other page note (active, archived, or
   * trashed note page.)
   */
  useEffect(() => {
    const searchNotesInputRoot = searchNotesInputRootRef.current;

    if (!searchNotesInputRoot) return;

    const searchNotesInput = searchNotesInputRoot.querySelector(
      '.MuiOutlinedInput-input',
    ) as HTMLInputElement;

    if (!new URLSearchParams(location.search).get('search-notes')) {
      searchNotesInput.value = '';
    }
  }, [location.search, searchNotesInputRootRef]);

  const theme = useTheme();

  const isMdUpBreakpoint = useMediaQuery(theme.breakpoints.up('md'));

  useHotkeys(
    'Slash',
    () => {
      const searchNotesInputRoot = searchNotesInputRootRef.current;

      if (isMdUpBreakpoint && searchNotesInputRoot && location.hash === '') {
        (
          searchNotesInputRoot.querySelector(
            '.MuiOutlinedInput-input',
          ) as HTMLInputElement
        ).focus();
      }
    },
    { preventDefault: true },
    [location.hash, isMdUpBreakpoint],
  );

  useHotkeys(
    'escape',
    () => {
      const searchNotesInputRoot = searchNotesInputRootRef.current;

      if (isMdUpBreakpoint && searchNotesInputRoot && location.hash === '') {
        (
          searchNotesInputRoot.querySelector(
            '.MuiOutlinedInput-input',
          ) as HTMLInputElement
        ).blur();
      }
    },
    { enableOnFormTags: ['input'] },
    [location.hash, isMdUpBreakpoint],
  );

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={{
        xs: 1,
        sm: 2,
      }}
      sx={{
        height: '100%',
        width: '100%',
      }}
    >
      <div>
        <AppTopIconButtonBase
          data-component="sidebar-toggler"
          onClick={handleToggleSidebar}
          sx={{
            p: 2,
          }}
          disableRipple
        >
          <MenuIcon aria-hidden="true" />{' '}
          <Typography className="sr-only">
            <Typography
              component={'span'}
              sx={(theme) => ({
                [theme.breakpoints.down('md')]: {
                  display: 'none',
                },
              })}
            >
              {isShowSidebar ? 'Minimize the sidebar' : 'Expand the sidebar'}
            </Typography>
            <Typography
              component={'span'}
              sx={(theme) => ({
                [theme.breakpoints.up('md')]: {
                  display: 'none',
                },
              })}
            >
              {isShowSidebar ? 'Hide the sidebar' : 'Show the sidebar'}
            </Typography>
          </Typography>
        </AppTopIconButtonBase>
      </div>
      <Box
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            display: 'none',
          },
        })}
      >
        <AppBrandLogo />
      </Box>
      <Box
        sx={{
          flex: 1,
        }}
      >
        <OutlinedInput
          placeholder={isMdUpBreakpoint ? 'Search [ / ]' : 'Search'}
          ref={searchNotesInputRootRef}
          defaultValue={searchNotesQuery}
          sx={{
            maxWidth: '75ch',
          }}
          onChange={handleSearchNotes}
          fullWidth
        />
      </Box>
      <UserMenu
        isSigningOut={isSigningOut}
        isSignedOut={isSignedOut}
        session={session}
        handleSignOut={handleSignOut}
      />
    </Stack>
  );
}
