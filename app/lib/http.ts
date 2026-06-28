import axios from 'axios';

import envConfig from '~/configs/envs';

const axiosInstance = axios.create({
  baseURL: `${envConfig.api.baseUrl}`,
});

export default axiosInstance;
