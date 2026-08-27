import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import formatDate from '~/utils/formatDate';

export default function NoteInfo({
  updatedAt,
}: Readonly<{
  updatedAt: string;
}>) {
  return (
    <Paper
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
      <Typography>
        Last edited{' • '}
        {formatDate(updatedAt)}
      </Typography>
    </Paper>
  );
}
