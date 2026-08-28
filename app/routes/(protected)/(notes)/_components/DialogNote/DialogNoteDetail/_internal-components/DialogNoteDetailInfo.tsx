import { clsx } from 'clsx';
import { format } from 'date-fns';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { TNoteStatus } from '~/types/models/notes';

export default function DialogNoteDetailInfo({
  noteStatus,
  isTrashed,
  updatedAt,
}: Readonly<{
  noteStatus: TNoteStatus;
  isTrashed: boolean;
  updatedAt: string;
}>) {
  return (
    <Paper
      data-component="dialog-note-detail-info"
      elevation={4}
      sx={{
        position: 'absolute',
        bottom: 'calc(100% + 0.8rem)',
        left: 0,
        py: 1,
        px: 2,
        width: 'max-content',
      }}
    >
      <Stack spacing={1}>
        <Typography>
          Last edited{' • '}
          {format(new Date(updatedAt), 'MMM, dd yyyy')}
        </Typography>
        <Typography
          sx={(theme) => ({
            [theme.breakpoints.up(355)]: {
              display: 'none',
            },
          })}
        >
          Status{' • '}
          <span
            className={clsx('inline-block rounded px-2 py-1', {
              'text-primary-contrast': noteStatus === 'active' || isTrashed,
              'bg-success': noteStatus === 'active' && !isTrashed,
              'bg-gray-300': noteStatus === 'archived' && !isTrashed,
              'bg-secondary': isTrashed,
            })}
          >
            {noteStatus === 'active' && !isTrashed && 'Active'}
            {noteStatus === 'archived' && !isTrashed && 'Archived'}
            {isTrashed && 'Trashed'}
          </span>
        </Typography>
      </Stack>
    </Paper>
  );
}
