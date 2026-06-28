import { renderToReactElement } from '@tiptap/static-renderer/pm/react';
import { clsx } from 'clsx';
import { type ReactNode } from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import tiptapConfig from '~/configs/tiptap';

export default function NoteCardContainer({
  noteTitle,
  jsonContent,
  actionSection,
}: Readonly<{
  noteTitle: string;
  jsonContent: string;
  actionSection: ReactNode;
}>) {
  return (
    <Paper elevation={2}>
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
          sx={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <Stack
            spacing={2}
            sx={{
              px: 1,
              pt: 2,
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
        <Box>{actionSection}</Box>
      </Stack>
    </Paper>
  );
}
