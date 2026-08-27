import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';

const ButtonCardNoteAction = styled(ButtonBase)<ButtonBaseProps>(
  ({ theme, disabled }) => ({
    border: `1px solid ${theme.palette.grey['300']}`,
    borderRadius: theme.shape.borderRadius,
    color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
    display: 'inline flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    width: 36,
  }),
);

export default ButtonCardNoteAction;
