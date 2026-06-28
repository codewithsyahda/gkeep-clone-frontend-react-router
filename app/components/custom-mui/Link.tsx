import MuiLink, { type LinkProps } from '@mui/material/Link';
import { Link as ReactRouterLink } from 'react-router';

export default function Link({
  children,
  ...restProps
}: LinkProps<typeof ReactRouterLink>) {
  return (
    <MuiLink {...restProps} component={ReactRouterLink}>
      {children}
    </MuiLink>
  );
}
