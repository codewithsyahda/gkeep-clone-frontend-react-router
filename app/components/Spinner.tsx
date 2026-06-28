import { LoaderCircleIcon } from 'lucide-react';

import Box from '@mui/material/Box';

export default function Spinner({
  size = 20,
}: Readonly<{
  size?: number;
}>) {
  return (
    <Box
      component={LoaderCircleIcon}
      sx={{
        height: size,
        width: size,
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          to: {
            transform: 'rotate(360deg)',
          },
        },
      }}
    />
  );
}
