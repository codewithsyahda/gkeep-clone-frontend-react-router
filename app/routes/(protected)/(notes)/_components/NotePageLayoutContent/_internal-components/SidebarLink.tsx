import { type CSSProperties, type ReactNode } from 'react';
import { useLocation, type LinkProps } from 'react-router';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import Link from '~/components/custom-mui/Link';

export default function SidebarLink({
  to,
  icon,
  text,
  expanded,
}: Readonly<{
  to: LinkProps['to'];
  icon: ReactNode;
  text: string;
  expanded: boolean;
}>) {
  const theme = useTheme();
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <Stack
      data-component="app-sidebar-link"
      to={to}
      direction="row"
      alignItems="center"
      component={Link}
      spacing={2}
      style={
        {
          '--bgColor': isActive ? theme.palette.grey[300] : 'transparent',
          '--bgColorHoverMd': isActive
            ? theme.palette.grey[300]
            : theme.palette.grey[100],
          '--borderRadiusMd': expanded
            ? 'var(--sidebarLinkRoundedExpanded)'
            : '100vw',
          '--padLeft': expanded ? theme.spacing(3.5) : theme.spacing(2),
          '--widthMd': expanded ? '100%' : '56px',
          '--overflowXMd': expanded ? 'visible' : 'clip',
        } as CSSProperties
      }
      sx={(theme) => ({
        backgroundColor: 'var(--bgColor)',
        borderRadius: {
          xs: 'var(--sidebarLinkRoundedExpanded)',
          md: 'var(--borderRadiusMd)',
        },
        color: 'text.primary',
        p: 2,
        pl: 'var(--padLeft)',
        width: {
          xs: 280,
          md: 'var(--widthMd)',
        },
        textDecoration: 'none',
        transitionProperty: 'background-color, border-radius, padding, width',
        transitionDuration: '150ms',
        transitionBehavior: theme.transitions.easing.easeInOut,
        overflowX: {
          md: 'var(--overflowXMd)',
        },
        '&:hover': {
          backgroundColor: {
            md: 'var(--bgColorHoverMd)',
          },
        },
      })}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
        }}
      >
        {icon}
      </Box>{' '}
      <Typography
        style={{
          fontWeight: location.pathname === to ? '500' : 'normal',
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}
