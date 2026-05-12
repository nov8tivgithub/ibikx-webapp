// Configured axios instance. Kept intentionally thin — auth/error logic lives in
// request.js to mirror the reference (single function = single source of truth).

import axios from 'axios';
import { baseUrl } from '../config/env';

export const apiClient = axios.create({
  baseURL: baseUrl,
});
