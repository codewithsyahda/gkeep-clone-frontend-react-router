const envConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:1234/api',
  },
  dev: {
    mock: {
      msw: import.meta.env.VITE_DEV_MOCK_MSW === 'true',
      auth: {
        signedIn: import.meta.env.VITE_DEV_MOCK_AUTH_SIGNED_IN === 'true',
      },
    },
  },
};

export default envConfig;
