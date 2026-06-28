import Button, { type ButtonProps } from '@mui/material/Button';
import { Link } from 'react-router';

export default function ButtonLink({
  children,
  ...restProps
}: ButtonProps<typeof Link>) {
  return (
    <Button {...restProps} component={Link}>
      {children}
    </Button>
  );
}
