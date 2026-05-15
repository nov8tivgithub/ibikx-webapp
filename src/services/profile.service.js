import { MakeAxiosRequest } from '../api/request';
import { MakeFileUpload } from '../api/upload';

// /myaccount — fetches the signed-in user's full profile blob (name, email,
// user_type / dealer flags, agent code, subscription status, etc.).
export const getProfileService = (signal) =>
  MakeAxiosRequest('post', '/myaccount', {}, signal);

// /settings — sub-options for a given menuList entry (e.g. key="myaccount"
// returns the items shown inside the My Account panel).
export const getSettingsService = (key, signal) =>
  MakeAxiosRequest('post', '/settings', { key }, signal);

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
