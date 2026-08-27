import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

export default [
  layout('./routes/(auth)/layout.tsx', [
    route('signup', './routes/(auth)/signup/page.tsx'),
    route('signin', './routes/(auth)/signin/page.tsx'),
  ]),
  layout('./routes/(protected)/layout.tsx', [
    layout('./routes/(protected)/(notes)/layout.tsx', [
      index('./routes/(protected)/(notes)/page.tsx'),
      route('archive', './routes/(protected)/(notes)/archive/page.tsx'),
      route('trash', './routes/(protected)/(notes)/trash/page.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
