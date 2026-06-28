import axios from 'axios';

import envs from '../config/envs';

export async function resetDBTables() {
  return await axios.delete(`${envs.e2eApi.baseUrl}/tables`);
}
