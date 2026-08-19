import { ArchiveIcon, LightbulbIcon, Trash2Icon } from 'lucide-react';
import { useEffect, type CSSProperties } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import OverlayScreen from '~/components/OverlayScreen';
import SidebarLink from './SidebarLink';
import SidebarLinkItem from './SidebarLinkItem';

import useSelectionNotesCtx from '~/hooks/useSelectionNotesCtx';

const sidebarLinks = [
  {
    to: '/',
    text: 'Active',
    icon: <LightbulbIcon />,
  },
  {
    to: '/archive',
    text: 'Archive',
    icon: <ArchiveIcon />,
  },
  {
    to: '/trash',
    text: 'Trash',
    icon: <Trash2Icon />,
  },
];

export default function AppSidebarMenuContainer({
  isShowSidebar,
  closeSidebar,
}: Readonly<{
  isShowSidebar: boolean;
  closeSidebar: () => void;
}>) {
  const muiTheme = useTheme();

  const selectionNotesCtx = useSelectionNotesCtx();

  useEffect(() => {
    const closeSidebarPageMobileNavigation = (ev: PointerEvent) => {
      const evTarget = ev.target as HTMLElement;

      const isMobile =
        document.documentElement.clientWidth <= muiTheme.breakpoints.values.md;

      const appSidebarLinkElem = evTarget.closest(
        '[data-component="app-sidebar-link"]',
      );

      if (appSidebarLinkElem && isMobile) {
        closeSidebar();
      }

      if (appSidebarLinkElem && selectionNotesCtx.notes.length) {
        selectionNotesCtx.unselectAll();
      }
    };

    document.addEventListener('click', closeSidebarPageMobileNavigation);

    return () => {
      document.removeEventListener('click', closeSidebarPageMobileNavigation);
    };
  }, [closeSidebar, muiTheme.breakpoints.values.md, selectionNotesCtx]);

  return (
    <Box
      data-component="app-sidebar-menu-container"
      style={
        {
          '--sidebarLinkRoundedExpanded': '10vw 100vw 100vw 10vw',
        } as CSSProperties
      }
      sx={{
        minWidth: {
          md: 254,
          lg: 300,
        },
        '&:hover': {
          '> [data-component="app-sidebar-menu"]': {
            pl: 0.5,
          },
          '[data-component="app-sidebar-link"]': {
            borderRadius: 'var(--sidebarLinkRoundedExpanded)',
            pl: 3.5,
            width: {
              md: '100%',
            },
            overflow: 'visible',
          },
        },
      }}
    >
      <Stack
        data-component="app-sidebar-menu"
        component="ul"
        style={
          {
            '--padLeft': isShowSidebar
              ? muiTheme.spacing(0.5)
              : muiTheme.spacing(2),
            '--transform': isShowSidebar
              ? 'translateX(0)'
              : 'translateX(-100%)',
          } as CSSProperties
        }
        sx={(theme) => ({
          backgroundColor: {
            xs: 'grey.50',
            md: 'transparent',
          },
          boxShadow: {
            xs: 2,
            md: 0,
          },
          position: {
            xs: 'absolute',
            md: 'static',
          },
          top: 0,
          left: 0,
          minHeight: '100%',
          maxHeight: '100%',
          p: 2,
          pl: 'var(--padLeft)',
          transform: {
            xs: 'var(--transform)',
            md: 'none',
          },
          transitionProperty: 'padding, transform',
          transitionDuration: '150ms',
          transitionBehavior: theme.transitions.easing.easeInOut,
          zIndex: 50,
        })}
      >
        {sidebarLinks.map((s) => (
          <SidebarLinkItem key={s.to}>
            <SidebarLink
              expanded={isShowSidebar}
              to={s.to}
              text={s.text}
              icon={s.icon}
            />
          </SidebarLinkItem>
        ))}
      </Stack>
      {isShowSidebar && (
        <OverlayScreen
          data-component="app-sidebar-overlay"
          aria-label="Close sidebar"
          onClick={() => closeSidebar()}
          sx={() => ({
            display: {
              md: 'none',
            },
            zIndex: 10,
          })}
        />
      )}
    </Box>
  );
}
