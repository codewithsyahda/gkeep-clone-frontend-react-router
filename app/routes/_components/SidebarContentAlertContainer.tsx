import type { ReactNode } from 'react';

import Stack from '@mui/material/Stack';

export default function SidebarContentAlertContainer({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Stack
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      {children}
    </Stack>
  );
}
