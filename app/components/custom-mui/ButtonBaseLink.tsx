import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { Link } from 'react-router';

export default function ButtonBaseLink({
  children,
  ...restProps
}: ButtonBaseProps<typeof Link>) {
  return (
    <ButtonBase {...restProps} component={Link}>
      {children}
    </ButtonBase>
  );
}
