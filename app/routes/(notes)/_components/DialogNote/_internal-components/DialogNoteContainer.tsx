import {
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
} from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import { FocusTrap, type FocusTrapProps } from 'focus-trap-react';

import OverlayScreen from '~/components/OverlayScreen';

export default function DialogNoteContainer({
  type,
  fullScreen,
  focusTrapProps,
  bodySection,
  actionSection,
  onClose,
  dialogContainerRef,
  dialogPaperRef,
  dialogActionsRef,
  dialogOverlayRef,
}: Readonly<{
  type: 'create-note' | 'detail-note';
  fullScreen: boolean;
  focusTrapProps?: {
    active?: boolean;
    focusTrapOpts?: Omit<
      Exclude<FocusTrapProps['focusTrapOptions'], undefined>,
      'escapeDeactivates'
    >;
  };
  bodySection: ReactNode;
  actionSection: ReactNode;
  onClose: MouseEventHandler<HTMLButtonElement>;
  dialogContainerRef?: RefObject<HTMLDivElement | null>;
  dialogPaperRef?: RefObject<HTMLDivElement | null>;
  dialogActionsRef?: RefObject<HTMLDivElement | null>;
  dialogOverlayRef?: RefObject<HTMLButtonElement | null>;
}>) {
  return (
    <FocusTrap
      active={focusTrapProps?.active}
      focusTrapOptions={{
        ...focusTrapProps?.focusTrapOpts,
        escapeDeactivates: false,
      }}
    >
      <Stack
        data-component="dialog-note-container"
        data-dialog-note-type={type}
        role="dialog"
        ref={dialogContainerRef}
        sx={(theme) => ({
          justifyContent: { sm: 'center' },
          alignItems: { sm: 'center' },
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100svh',
          width: '100%',
          zIndex: theme.zIndex.drawer + 1,
        })}
      >
        <Paper
          data-component="note-editor-container"
          ref={dialogPaperRef}
          elevation={2}
          style={
            {
              '--fullScreenHeight': fullScreen ? '100%' : '500px',
              '--fullScreenWidth': fullScreen ? '100%' : '700px',
            } as CSSProperties
          }
          sx={(theme) => ({
            flex: 1,
            position: 'relative',
            maxHeight: {
              sm: 'var(--fullScreenHeight)',
            },
            width: '100%',
            maxWidth: {
              sm: 'var(--fullScreenWidth)',
            },
            transitionProperty: 'max-height, max-width',
            transitionDuration: '250ms, 250ms',
            transitionBehavior: theme.transitions.easing.easeInOut,
            overflowY: 'hidden',
            zIndex: 1,
          })}
        >
          <Stack
            sx={{
              height: '100%',
              width: '100%',
            }}
          >
            {bodySection}
            <Box data-component="actions-container" ref={dialogActionsRef}>
              {actionSection}
            </Box>
          </Stack>
        </Paper>
        <OverlayScreen
          tabIndex={fullScreen ? -1 : undefined}
          ref={dialogOverlayRef}
          data-component="overlay"
          onClick={onClose}
        >
          <span className="sr-only">Close dialog</span>
        </OverlayScreen>
      </Stack>
    </FocusTrap>
  );
}
