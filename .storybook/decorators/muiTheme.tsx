import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { Decorator } from '@storybook/react-vite';

const muiThemeDecorator: Decorator = (Story) => (
  <ThemeProvider
    theme={createTheme({
      cssVariables: true,
    })}
  >
    <Story />
  </ThemeProvider>
);

export default muiThemeDecorator;
