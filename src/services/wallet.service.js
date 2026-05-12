// Wallet & rewards. Endpoint paths per migration doc (Section 7):
//   /wallet, /winner/pointscollected

import { MakeAxiosRequest } from '../api/request';

// Wallet balance + paged transaction history.
export const getWalletService = (page = 1, signal) =>
  MakeAxiosRequest('post', '/wallet', { page }, signal);

// Detailed view of "points collected" entries from winning quizzes.
export const getPointsCollectedService = (page = 1, signal) =>
  MakeAxiosRequest('post', '/winner/pointscollected', { page }, signal);
