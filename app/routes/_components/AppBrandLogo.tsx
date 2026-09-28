import { GalleryVerticalEnd } from 'lucide-react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function AppBrandLogo() {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'primary.main',
          borderRadius: 2,
          color: 'common.white',
          p: 0.5,
        }}
      >
        <GalleryVerticalEnd size={16} aria-hidden="true" />
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
