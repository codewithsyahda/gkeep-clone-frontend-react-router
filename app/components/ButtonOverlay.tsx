import { alpha, styled } from '@mui/material/styles';

const ButtonOverlay = styled('button')(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.black, 0.8),
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100dvh',
  width: '100%',
  '&:focus-visible': {
    border: `2px solid ${theme.palette.primary.contrastText}`,
  },
}));

export default ButtonOverlay;
