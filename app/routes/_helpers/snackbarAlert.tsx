import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Alert, { type AlertProps } from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

export default function emitSnackbarAlert({
  alertText,
  alertSeverity = 'success',
  undoActionFn,
}: Readonly<{
  alertText: string;
  alertSeverity?: AlertProps['severity'];
  undoActionFn?: () => Promise<void>;
}>) {
  toast.dismiss();

  return toast.custom(
    () => (
      <SnackbarAlert
        alertText={alertText}
        alertSeverity={alertSeverity}
        undoAction={undoActionFn}
      />
    ),
    { position: 'bottom-left' },
  );
}

function SnackbarAlert({
  alertText,
  alertSeverity,
  undoAction,
}: Readonly<{
  alertText: string;
  alertSeverity: AlertProps['severity'];
  undoAction?: () => Promise<void>;
}>) {
  const [isLoadingUndo, setIsLoadingUndo] = useState(false);

  const handleUndo = async () => {
    if (!undoAction) return;

    setIsLoadingUndo(() => true);

    await undoAction();
  };

  return (
    <Alert
      severity={alertSeverity}
      sx={{
        minWidth: {
          md: 420,
        },
      }}
      action={
        <Stack direction="row" spacing={1}>
          {undoAction && (
            <Button
              color="inherit"
              size="small"
              loading={isLoadingUndo}
              onClick={handleUndo}
            >
              Undo
            </Button>
          )}
          <Tooltip title="Close">
            <IconButton
              color="inherit"
              size="small"
              aria-label="Close snackbar"
              onClick={() => toast.dismiss()}
            >
              <XIcon className="size-5" />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      {alertText}
    </Alert>
  );
}
