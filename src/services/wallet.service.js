// Wallet & rewards. Endpoint paths per migration doc (Section 7):
//   /wallet, /winner/pointscollected

import { MakeAxiosRequest } from '../api/request';

// Wallet balance + paged transaction history. Two call shapes are accepted:
//   getWalletService(1)                              → { page: 1 }            (legacy wallet view)
//   getWalletService({ type: 'referral', page_id }) → { type, page_id }      (referral list)
export const getWalletService = (params = 1, signal) => {
  const body =
    typeof params === 'number'
      ? { page: params }
      : params.type
        ? { type: params.type, page_id: params.page_id ?? 1 }
        : { page: params.page ?? 1 };
  return MakeAxiosRequest('post', '/wallet', body, signal);
};

// Detailed view of "points collected" entries from winning quizzes.
export const getPointsCollectedService = (page = 1, signal) =>
  MakeAxiosRequest('post', '/winner/pointscollected', { page }, signal);
