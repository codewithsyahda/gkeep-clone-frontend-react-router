import { styled } from '@mui/material/styles';

import ButtonBaseLink from '~/components/custom-mui/ButtonBaseLink';

const ButtonLinkCardNoteAction = styled(ButtonBaseLink)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey['300']}`,
  borderRadius: theme.shape.borderRadius,
  display: 'inline flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 36,
  width: 36,
}));

export default ButtonLinkCardNoteAction;
