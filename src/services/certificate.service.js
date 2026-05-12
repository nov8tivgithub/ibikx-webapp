// Certification & winners. Endpoint paths per migration doc (Section 8):
//   /winners, /certificate/list, /certificate/view

import { MakeAxiosRequest } from '../api/request';

// Leaderboard / winners list. period: 'latest' | 'month' | 'year'.
// `filters` is the period-specific extra payload (month, fy, etc.).
export const getWinnersService = (period = 'latest', filters = {}, signal) =>
  MakeAxiosRequest('post', '/winners', { period, ...filters }, signal);

export const getCertificateListService = (signal) =>
  MakeAxiosRequest('post', '/certificate/list', {}, signal);

// Returns the certificate PDF URL (or base64) for inline preview / download.
export const getCertificateViewService = (certificate_id, signal) =>
  MakeAxiosRequest('post', '/certificate/view', { certificate_id }, signal);
