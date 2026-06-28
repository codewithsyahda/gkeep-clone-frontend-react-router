const envs = {
  e2eApi: {
    baseUrl: process.env.E2E_API_HELPER_BASE_URL || 'http://localhost:4321/api',
  },
};

export default envs;
