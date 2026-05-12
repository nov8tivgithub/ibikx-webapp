import { MakeAxiosRequest } from '../api/request';

// /dashboardnew — `type` is the active dashboard tab ("videos" / "cards").
export const getDashboardService = (type = 'videos', signal) =>
  MakeAxiosRequest('post', '/dashboardnew', { type }, signal);

// /categories — top-level category list (when needed standalone).
export const getCategoriesService = (signal) =>
  MakeAxiosRequest('post', '/categories', {}, signal);

// /categorydetails — sub-categories inside a parent. `favourite:"1"` returns
// only the user's favourited sub-categories.
export const getCategoryDetailsService = (
  { categorykey, favourite = '0' } = {},
  signal,
) =>
  MakeAxiosRequest('post', '/categorydetails', { categorykey, favourite }, signal);
