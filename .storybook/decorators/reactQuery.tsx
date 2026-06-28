import type { Decorator } from '@storybook/react-vite';
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query';

const reactQueryDecorator: Decorator = (Story, context) => {
  const defaultOptions =
    (context?.parameters?.reactQuery
      ?.defaultOptions as QueryClientConfig['defaultOptions']) ?? {};

  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions,
        })
      }
    >
      <Story />
    </QueryClientProvider>
  );
};

export default reactQueryDecorator;
