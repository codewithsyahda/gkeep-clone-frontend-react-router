import { type ReactNode } from 'react';

import Box from '@mui/material/Box';

export default function SidebarLinkItem({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <Box component="li">{children}</Box>;
}
