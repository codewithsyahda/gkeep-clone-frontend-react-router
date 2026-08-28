import type { ButtonBaseProps } from '@mui/material/ButtonBase';
import ButtonBase from '@mui/material/ButtonBase';
import Tooltip from '@mui/material/Tooltip';

export default function ButtonDialogNoteAction({
  children,
  tooltipTitle,
  ...restButtonBaseProps
}: Readonly<
  Omit<
    ButtonBaseProps & {
      tooltipTitle: string;
    },
    'sx'
  >
>) {
  return (
    <Tooltip title={tooltipTitle}>
      <ButtonBase
        {...restButtonBaseProps}
        sx={(theme) => ({
          border: 1,
          borderColor: 'grey.300',
          borderRadius: 1,
          color: restButtonBaseProps.disabled
            ? theme.palette.text.disabled
            : theme.palette.text.primary,
          height: 36,
          width: 36,
          '&:hover, &:focus-visible': {
            backgroundColor: 'grey.200',
          },
        })}
      >
        {children}
      </ButtonBase>
    </Tooltip>
  );
}
