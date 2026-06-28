import type { ReactNode } from 'react';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

export default function AuthPageContainer({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Container maxWidth={false}>
      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{
          minHeight: '100dvh',
        }}
      >
        <Stack
          spacing={4}
          sx={{
            width: '100%',
            maxWidth: '458px',
          }}
        >
          {children}
        </Stack>
      </Stack>
    </Container>
  );
}
