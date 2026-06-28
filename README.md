# A Note-Taking Front-End Application Project

## Description

A note-taking front-end application personal project. Inspired by Google Keep.

## Technology Stack

Below are the main technologies used in this project:

- Node.js (a JavaScript runtime): [https://github.com/nodejs/node](https://github.com/nodejs/node)
- TypeScript: [https://github.com/microsoft/TypeScript](https://github.com/microsoft/TypeScript)

## Framework & Library

Below are the core frameworks and libraries used in this project:

- React Router - Framework Mode: [https://github.com/remix-run/react-router](https://github.com/remix-run/react-router)
- React Hook Form (a React form state hook): [https://github.com/react-hook-form/react-hook-form](https://github.com/react-hook-form/react-hook-form)
- Material UI (a React component library): [https://github.com/mui/material-ui](https://github.com/mui/material-ui)
- Tailwind CSS (a utility-first CSS framework): [https://github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)
- Sonner (an opinionated React toast component): [https://github.com/emilkowalski/sonner](https://github.com/emilkowalski/sonner)
- Tiptap Editor (a headless rich-text editor): [https://github.com/ueberdosis/tiptap](https://github.com/ueberdosis/tiptap)
- Better Auth (a comprehensive auth for TypeScript): [https://github.com/better-auth/better-auth](https://github.com/better-auth/better-auth)
- TanStack Query (a data fetcher): [https://github.com/TanStack/query](https://github.com/TanStack/query)
- Zod (a TypeScript schema validation): [https://github.com/colinhacks/zod](https://github.com/colinhacks/zod)
- Axios (a Promise-based HTTP client): [https://github.com/axios/axios](https://github.com/axios/axios)
- Vitest (a JavaScript testing framework): [https://github.com/vitest-dev/vitest](https://github.com/vitest-dev/vitest)
- Mock Service Worker (an API mocking library): [https://github.com/mswjs/msw](https://github.com/mswjs/msw)

## Utility & Tool

Below are the core utilities and tools used in this project:

- Vite (a front-end tooling): [https://github.com/vitejs/vite](https://github.com/vitejs/vite)
- Storybook (a front-end workshop): [https://github.com/storybookjs/storybook](https://github.com/storybookjs/storybook)
- Playwright Test (an E2E testing tool): [https://github.com/microsoft/playwright](https://github.com/microsoft/playwright)
- cross-env (a platform agnostic ENVs setter): [https://github.com/kentcdodds/cross-env](https://github.com/kentcdodds/cross-env)

## Specifications

Below are the specifications that are used in this project:

- [Node.js](https://github.com/nodejs/node) with version 24 LTS or higher
- [pnpm](https://github.com/pnpm/pnpm) with version 11 or higher

## Configuration

### Environment Variables

All environment variables are hinted in the `.env.example` file. They can be set by creating a `.env` file for all modes, a `.env.production` file for production mode, a `.env.development` file for development mode, and a `.env.test` file for test mode (if they do not already exist) and setting them within it. Note that the `.env.[mode]` file will take higher priority than the generic one, such as the `.env` file.

ENVs can also be set in the system-wide environment variables directly on the host machine.

## API Specification Implementation

The project implements the API specification, which is defined in the `apiSpec.yaml` file. It's stored in the [gkeep-clone-restful-api-spec](https://github.com/codewithsyahda/gkeep-clone-restful-api-spec) repository.

## Getting Started

### Dependencies Installation

```sh
pnpm install # or `pnpm i`
```

### Code Quality

To run TypeScript type-checking:

```sh
pnpm run typecheck
```

To linting all source code files:

```sh
pnpm run lint
```

To checking all source code files that should be formatted:

```sh
pnpm run format:c
```

To format all source code files:

```sh
pnpm run format:w
```

### Development

To run the application in the development mode:

```sh
pnpm run dev
```

The application will be available at `http://localhost:5173` by default.

There are environment variables that can be set for running the application in development mode:

- `VITE_API_BASE_URL`
- `VITE_DEV_MOCK_API`
- `VITE_DEV_MOCK_AUTH_SIGNED_IN`

> See in more detail in the [environment variables configuration](#environment-variables) section.

## Testing

### Running Unit and Integration Testing

To run unit and integration testing with coverage mode by default:

```sh
pnpm test:ci # or `pnpm test:w` with watch mode
```

### Running E2E Testing (in Local)

For running E2E testing (locally), this project uses Playwright Test. Before running E2E testing, it needs a backend and a relational database, such as PostgreSQL. Below are related backend application repositories to this frontend project.

- [gkeep-clone-backend-nodejs-fastify](https://github.com/codewithsyahda/gkeep-clone-backend-nodejs-fastify)

To set up one of the above backend repositories, each of them is provided with instructions for setting up the project. After setting it up, it should run two applications. They are the real backend and the backend helper applications. The backend helper is used to manage the state of database tables, such as resetting database tables on each E2E test scenario.

To simplify a relational database setup locally, such as a PostgreSQL database that the backend needs during E2E testing, use a Docker container to run a PostgreSQL database, or use Docker Compose. To set up a PostgreSQL database with Docker, [read more about how to set it up with the Postgres Docker image here](https://github.com/docker-library/docs/tree/master/postgres).

After setting up the backend applications and the relational database, set the `VITE_API_BASE_URL=http://real-backend:port/api/v1` environment variable in the `.env.production` file, and the `E2E_API_HELPER_BASE_URL=http://backend-helper:port/api` in the `.env.test` file locally. Then, adjust both base URL environment variable values with the previously set up backend. Both environment variables can also be set in the `.env` file.

Next, build the frontend project with the command below.

```sh
pnpm run build
```

Then, install the Playwright browsers with the command below.

```sh
pnpm exec playwright install --with-deps
```

Lastly, run Playwright Test with the command below.

```sh
pnpm run test:e2e
```

Furthermore, check out the `playwright.config.ts` for the Plawright Test configuration. All E2E testing source code files are stored in the `tests/e2e` directory.

## Building for Production

Create a production build:

```sh
pnpm run build
```

> Make sure to set the `VITE_API_BASE_URL` environment variable before building application. See the [environment variables configuration](#environment-variables) section.

After building the application, you can start the built application by running the following command:

```sh
pnpm run start
```

The application will be available at `http://localhost:3000` by default.

## Deployment

### Docker Deployment

To build the application as a Docker image:

```sh
docker build --build-arg VITE_API_BASE_URL=http://real-backend:port/api/v1 -t username/gkeep-clone-frontend-react-router .
```

> Adjust the `VITE_API_BASE_URL` build arg for the command above.

To run the application as a Docker container by using the previously built Docker image:

```sh
docker run -d --name my-app -p 3000:3000 username/gkeep-clone-frontend-react-router
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

Similar to deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `pnpm run build`.

```text
├── package.json
├──  pnpm-lock.yaml (or package-lock.json, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## License

[MIT License](./LICENSE.txt) © 2026-present Syahda Romansyah.
