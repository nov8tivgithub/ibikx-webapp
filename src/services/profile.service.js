import { MakeAxiosRequest } from '../api/request';
import { MakeFileUpload } from '../api/upload';

export const getProfileService = (signal) =>
  MakeAxiosRequest('post', '/myprofile', {}, signal);

export const updateProfileService = (payload, signal) =>
  MakeAxiosRequest('post', '/updateprofile', payload, signal);

export const uploadProfileImageService = (file) => {
  const fd = new FormData();
  fd.append('image', file);
  return MakeFileUpload('post', '/uploadprofileimage', fd);
};

export const getCertificatesService = (signal) =>
  MakeAxiosRequest('post', '/certificates', {}, signal);

export const getWalletService = (signal) =>
  MakeAxiosRequest('post', '/wallet', {}, signal);

export const getReferralService = (signal) =>
  MakeAxiosRequest('post', '/referral', {}, signal);

export const getCardSubscriptionsService = (signal) =>
  MakeAxiosRequest('post', '/subscriptions/cards', {}, signal);

export const getVideoSubscriptionsService = (signal) =>
  MakeAxiosRequest('post', '/subscriptions/videos', {}, signal);

export const purchasePlanService = (plan_id, kind, signal) =>
  MakeAxiosRequest('post', '/subscriptions/purchase', { plan_id, kind }, signal);
