import { renderToReactElement } from '@tiptap/static-renderer/pm/react';
import { clsx } from 'clsx';
import {
  useRef,
  type CSSProperties,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from 'react';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import tiptapConfig from '~/configs/tiptap';
import useSelectionNotesCtx from '~/hooks/useSelectionNotesCtx';
import type { TNoteStatus } from '~/types/models/notes';

export default function NoteCardContainer({
  noteId,
  noteTitle,
  jsonContent,
  noteStatus,
  isTrashed = false,
  actionSection,
}: Readonly<{
  noteId: string;
  noteTitle: string;
  jsonContent: string;
  noteStatus?: TNoteStatus;
  isTrashed?: boolean;
  actionSection: ReactNode;
}>) {
  const selectionNotesCtx = useSelectionNotesCtx();

  const isSelected = selectionNotesCtx.notes.some((n) => n.noteId === noteId);

  const totalSelectionNotes = selectionNotesCtx.notes.length;

  const selectionTmRef = useRef<NodeJS.Timeout>(null);

  const muiTheme = useTheme();

  const isFirstNoteSelectionRef = useRef(false);

  const handleNoteSelectionPointerDown: PointerEventHandler<HTMLDivElement> = (
    ev,
  ) => {
    if (document.documentElement.clientWidth < muiTheme.breakpoints.values.sm) {
      if (!isSelected && totalSelectionNotes === 0) {
        try {
          ev.currentTarget.setPointerCapture(ev.pointerId);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Pointer capture failed:', error);
        }

        selectionTmRef.current = setTimeout(() => {
          selectionNotesCtx.selectOne({
            noteId,
            noteStatus,
            isTrashed,
          });

          isFirstNoteSelectionRef.current = true;
        }, 500);
      }
    }
  };

  const handleNoteSelectionPointerMove: PointerEventHandler<HTMLDivElement> = (
    ev,
  ) => {
    const movY = ev.movementY;

    if (document.documentElement.clientWidth < muiTheme.breakpoints.values.sm) {
      const selectionTm = selectionTmRef.current;

      if (selectionTm && (movY < -2 || movY >= 2)) {
        clearTimeout(selectionTm);
      }
    }
  };

  const handleNoteSelectionPointerUp: PointerEventHandler<HTMLDivElement> = (
    ev,
  ) => {
    if (document.documentElement.clientWidth < muiTheme.breakpoints.values.sm) {
      const isFirstNoteSelection = isFirstNoteSelectionRef.current;

      if (isFirstNoteSelection) {
        isFirstNoteSelectionRef.current = false;
      } else if (!isSelected && totalSelectionNotes) {
        selectionNotesCtx.selectOne({
          noteId,
          noteStatus,
          isTrashed,
        });
      } else {
        setTimeout(() => selectionNotesCtx.unselectOne(noteId), 100);
      }

      const selectionTm = selectionTmRef.current;

      if (selectionTm) {
        clearTimeout(selectionTm);
      }

      try {
        ev.currentTarget.releasePointerCapture(ev.pointerId);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Pointer capture failed:', error);
      }
    } else {
      const evTarget = ev.target as HTMLElement;

      if (
        !evTarget.closest('[data-component="note-card-selection-checkbox"]')
      ) {
        if (!isSelected && totalSelectionNotes) {
          selectionNotesCtx.selectOne({
            noteId,
            noteStatus,
            isTrashed,
          });
        } else {
          selectionNotesCtx.unselectOne(noteId);
        }
      }
    }
  };

  const handleNoteSelectionPointerCancel: PointerEventHandler<
    HTMLDivElement
  > = () => {
    if (document.documentElement.clientWidth < muiTheme.breakpoints.values.sm) {
      const isFirstNoteSelection = isFirstNoteSelectionRef.current;

      if (isFirstNoteSelection) {
        isFirstNoteSelectionRef.current = false;
      }

      const selectionTm = selectionTmRef.current;

      if (selectionTm) {
        clearTimeout(selectionTm);
      }
    }
  };

  const handleNoteSelectionContextMenu: MouseEventHandler<HTMLDivElement> = (
    ev,
  ) => {
    if (document.documentElement.clientWidth < muiTheme.breakpoints.values.sm) {
      ev.preventDefault();
    }
  };

  const handleNoteSelectionCheckbox = () => {
    if (isSelected) {
      selectionNotesCtx.unselectOne(noteId);
    } else {
      selectionNotesCtx.selectOne({
        noteId,
        noteStatus,
        isTrashed,
      });
    }
  };

  return (
    <Paper
      elevation={isSelected ? 0 : 2}
      data-component="note-card-container"
      style={
        {
          '--outlineIsSelected': isSelected ? '2px solid' : '0 solid',
        } as CSSProperties
      }
      sx={(theme) => ({
        position: 'relative',
        outline: 'var(--outlineIsSelected)',
        outlineColor: theme.palette.primary.main,
        '&:hover [data-component="note-card-selection-checkbox"]': {
          opacity: '100%',
        },
      })}
      onPointerDown={handleNoteSelectionPointerDown}
      onPointerMove={handleNoteSelectionPointerMove}
      onPointerUp={handleNoteSelectionPointerUp}
      onPointerCancel={handleNoteSelectionPointerCancel}
      onContextMenu={handleNoteSelectionContextMenu}
    >
      <Checkbox
        checked={isSelected}
        data-component="note-card-selection-checkbox"
        slotProps={{
          input: {
            'aria-label': 'Select note',
          },
        }}
        style={
          {
            '--opacityIsSelected': totalSelectionNotes ? '100%' : '0%',
          } as CSSProperties
        }
        sx={{
          backgroundColor: 'common.white',
          display: {
            xs: 'none',
            md: 'initial',
          },
          position: 'absolute',
          top: -10,
          left: -10,
          opacity: 'var(--opacityIsSelected)',
          p: 0,
          zIndex: 5,
        }}
        onChange={handleNoteSelectionCheckbox}
        disableRipple
      />
      <ButtonBase
        data-component="note-card-selection-overlay"
        style={
          {
            '--displayIsSelected': totalSelectionNotes ? 'initial' : 'none',
          } as CSSProperties
        }
        sx={{
          display: 'var(--displayIsSelected)',
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          zIndex: 1,
        }}
        disableRipple
      >
        <Typography className="sr-only">Select note</Typography>
      </ButtonBase>
      <Stack
        sx={{
          minHeight: {
            xs: 320,
            md: 400,
          },
          maxHeight: 400,
        }}
      >
        <Box
          tabIndex={0}
          style={
            {
              '--overflowYIsSelected': totalSelectionNotes ? 'hidden' : 'auto',
              '--userSelectIsSelectedMd': totalSelectionNotes ? 'none' : 'auto',
            } as CSSProperties
          }
          sx={{
            flex: 1,
            overflowY: 'var(--overflowYIsSelected)',
            userSelect: {
              xs: 'none',
              md: 'var(--userSelectIsSelectedMd)',
            },
          }}
        >
          <Stack
            spacing={2}
            sx={{
              px: {
                xs: 2,
                md: 4,
              },
              pt: {
                xs: 2,
                md: 2.5,
              },
              pb: 8,
            }}
          >
            <Typography
              component="h1"
              sx={{
                typography: 'h4',
                wordBreak: 'break-word',
                textWrap: 'balance',
              }}
            >
              {noteTitle}
            </Typography>
            <Box>
              <Divider />
            </Box>
            <Box>
              <div
                className={clsx(tiptapConfig.defaultStyle, 'wrap-break-word')}
              >
                {renderToReactElement({
                  content: JSON.parse(jsonContent),
                  extensions: tiptapConfig.extensions,
                })}
              </div>
            </Box>
          </Stack>
        </Box>
        {totalSelectionNotes === 0 && <Box>{actionSection}</Box>}
      </Stack>
    </Paper>
  );
}
