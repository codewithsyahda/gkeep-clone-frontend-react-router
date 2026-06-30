import { MenuIcon } from 'lucide-react';
import type { ChangeEventHandler, MouseEventHandler, RefObject } from 'react';
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation } from 'react-router';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Typography from '@mui/material/Typography';
import AppBrandLogo from '~/routes/_components/AppBrandLogo';
import UserMenu from './UserMenu';

export default function AppTopBar({
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
      data-component="app-top-bar"
      direction="row"
      alignItems="center"
      spacing={{
        xs: 1,
        sm: 2,
      }}
      sx={{
        borderBottom: 1,
        borderBottomColor: 'grey.300',
        p: 1,
        px: {
          sm: 2,
        },
        height: 75,
        position: 'relative',
      }}
    >
      <div>
        <ButtonBase
          data-component="sidebar-toggler"
          onClick={handleToggleSidebar}
          sx={{
            borderRadius: '100%',
            p: 2,
            transition: 'background-color 150ms ease',
            '&:hover, &.Mui-focusVisible': {
              backgroundColor: 'grey.200',
            },
          }}
        >
          <MenuIcon />{' '}
          <Typography
            className="sr-only"
            sx={(theme) => ({
              [theme.breakpoints.down('md')]: {
                display: 'none',
              },
            })}
          >
            {isShowSidebar ? 'Minimize the sidebar' : 'Expand the sidebar'}
          </Typography>
          <Typography
            className="sr-only"
            sx={(theme) => ({
              [theme.breakpoints.up('md')]: {
                display: 'none',
              },
            })}
          >
            {isShowSidebar ? 'Hide the sidebar' : 'Show the sidebar'}
          </Typography>
        </ButtonBase>
      </div>
      <Box
        sx={{
          display: {
            xs: 'none',
            sm: 'block',
          },
        }}
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
          onChange={handleSearchNotes}
          sx={{
            maxWidth: '75ch',
          }}
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
