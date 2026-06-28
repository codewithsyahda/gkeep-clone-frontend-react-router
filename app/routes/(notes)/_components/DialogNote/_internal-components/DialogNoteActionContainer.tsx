import type { ReactNode } from 'react';

import Stack from '@mui/material/Stack';

export default function DialogNoteActionContainer({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        borderTop: 1,
        borderTopColor: 'grey.300',
        alignItems: 'center',
        p: 1,
      }}
    >
      {children}
    </Stack>
  );
}
