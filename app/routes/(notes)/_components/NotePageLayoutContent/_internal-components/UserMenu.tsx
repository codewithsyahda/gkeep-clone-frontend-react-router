import { LogOutIcon } from 'lucide-react';
import type { MouseEventHandler } from 'react';
import { useEffect } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import useBoolean from '~/hooks/useBoolean';

export default function UserMenu({
  isSigningOut,
  isSignedOut,
  session,
  handleSignOut,
}: Readonly<{
  isSigningOut: boolean;
  isSignedOut: boolean;
  session: {
    name: string;
    email: string;
  };
  handleSignOut: MouseEventHandler<HTMLButtonElement>;
}>) {
  const {
    value: isShowUserMenu,
    setFalse: closeUserMenu,
    toggleValue: toggleUserMenu,
  } = useBoolean(false);

  useEffect(() => {
    const closeUserMenuCard = (ev: PointerEvent) => {
      const evTarget = ev.target as HTMLElement;

      if (
        !evTarget.closest('[data-component="user-menu-toggler"]') &&
        !evTarget.closest('[data-component="user-menu-card"]')
      )
        closeUserMenu();
    };

    document.addEventListener('click', closeUserMenuCard);

    return () => {
      document.removeEventListener('click', closeUserMenuCard);
    };
  }, [closeUserMenu]);

  const firstName = session.name.split(' ')[0];

  const avatarName = session.name
    .split(' ')
    .map((chunkName) => chunkName.slice(0, 1).toUpperCase())
    .join('');

  return (
    <div>
      <ButtonBase
        data-component="user-menu-toggler"
        onClick={() => toggleUserMenu()}
        sx={{
          borderRadius: '100%',
          p: 0.5,
          transition: 'background-color 150ms ease',
          '&:hover, &.Mui-focusVisible': {
            backgroundColor: 'grey.200',
          },
        }}
      >
        <Avatar
          sx={{
            backgroundColor: 'primary.main',
            typography: 'body1',
            width: 36,
            height: 36,
          }}
        >
          <span aria-hidden>{avatarName}</span>
        </Avatar>
        <Typography className="sr-only">
          {isShowUserMenu ? 'Hide user menu' : 'Open user menu'}
        </Typography>
      </ButtonBase>
      <Card
        data-component="user-menu-card"
        style={{
          display: isShowUserMenu ? 'block' : 'none',
        }}
        sx={{
          backgroundColor: 'grey.100',
          position: 'absolute',
          top: {
            xs: 'calc(100% + 0.5rem)',
            md: 'calc(100% + 0.5rem)',
          },
          right: {
            xs: 8,
            md: 16,
          },
          minWidth: 224,
          zIndex: 15,
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <div>
              <Typography
                variant="body1"
                sx={{
                  backgroundColor: 'grey.200',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  textAlign: 'center',
                }}
              >
                {session.email}
              </Typography>
            </div>
            <div>
              <Stack alignItems="center" spacing={1}>
                <Box>
                  <Avatar
                    sx={{
                      backgroundColor: 'primary.main',
                    }}
                  >
                    <span aria-hidden>{avatarName}</span>
                    <Typography className="sr-only">
                      Avatar name, {session.name}
                    </Typography>
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="h6" component="p">
                    Hi, {firstName}!
                  </Typography>
                </Box>
              </Stack>
            </div>
          </Stack>
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            disabled={isSigningOut || isSignedOut}
            loading={isSigningOut}
            onClick={handleSignOut}
            startIcon={
              <Box
                component={LogOutIcon}
                sx={{
                  width: 14,
                  height: 14,
                }}
              />
            }
            fullWidth
          >
            {!isSigningOut && !isSignedOut && 'Sign out'}
            {isSigningOut && 'Signing out'}
            {!isSigningOut && isSignedOut && 'Signed out'}
          </Button>
        </CardActions>
      </Card>
    </div>
  );
}
