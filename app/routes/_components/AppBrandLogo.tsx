import { GalleryVerticalEnd } from 'lucide-react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function AppBrandLogo() {
  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <Box
        sx={{
          backgroundColor: 'primary.main',
          borderRadius: '0.5em',
          color: 'common.white',
          p: '0.25em',
        }}
      >
        <Box
          component={GalleryVerticalEnd}
          sx={{
            height: '1em',
            width: '1em',
          }}
        />
      </Box>
      <Typography
        sx={{
          userSelect: 'none',
        }}
      >
        Notes App
      </Typography>
    </Stack>
  );
}
