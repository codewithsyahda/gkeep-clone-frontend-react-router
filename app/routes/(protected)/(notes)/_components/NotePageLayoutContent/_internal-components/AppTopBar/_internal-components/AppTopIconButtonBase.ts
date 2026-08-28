import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';

const AppTopIconButtonBase = styled(ButtonBase)<ButtonBaseProps>(
  ({ theme }) => ({
    borderRadius: '100vw',
    transitionProperty: 'background-color',
    transitionDuration: `${theme.transitions.duration.shortest}ms`,
    transitionTimingFunction: theme.transitions.easing.easeInOut,
    '&.Mui-focusVisible': {
      outline: `1px solid ${theme.palette.common.black}`,
    },
    '&:hover, &.Mui-focusVisible': {
      backgroundColor: theme.palette.grey['300'],
    },
    '&:hover': {
      outline: `0px solid ${theme.palette.common.black}`,
    },
  }),
);

export default AppTopIconButtonBase;
