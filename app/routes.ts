import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

export default [
  route('signup', './routes/(auth)/signup/page.tsx'),
  route('signin', './routes/(auth)/signin/page.tsx'),
  layout('./routes/(notes)/layout.tsx', [
    index('./routes/(notes)/page.tsx'),
    route('archive', './routes/(notes)/archive/page.tsx'),
    route('trash', './routes/(notes)/trash/page.tsx'),
  ]),
] satisfies RouteConfig;
