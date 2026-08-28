import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { ComponentProps } from 'react';

export default function DialogConfirmation({
  title,
  content,
  slotProps,
}: Readonly<{
  title: string;
  content: string;
  slotProps: {
    rootDialog: ComponentProps<typeof Dialog>;
    dialogTitle: Omit<ComponentProps<typeof DialogTitle>, 'children'>;
    dialogContent: Omit<ComponentProps<typeof DialogContentText>, 'children'>;
    noButton: Omit<ComponentProps<typeof Button>, 'children'>;
    yesButton: Omit<ComponentProps<typeof Button>, 'children'>;
  };
}>) {
  return (
    <Dialog {...slotProps.rootDialog}>
      <DialogTitle {...slotProps.dialogTitle}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText {...slotProps.dialogContent}>
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button {...slotProps.noButton}>No</Button>
        <Button {...slotProps.yesButton}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
}
