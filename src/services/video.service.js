// Video module. Endpoint paths per migration doc (Section 6):
//   /viewvideo, /personalizevideo

import { MakeAxiosRequest } from '../api/request';

// Returns the video preview + records the view server-side in one call.
export const getViewVideoService = (videokey, signal) =>
  MakeAxiosRequest('post', '/viewvideo', { videokey }, signal);

// Returns the personalised video URL/data after stamping the user's profile.
export const personalizeVideoService = (videokey, language = 'en', signal) =>
  MakeAxiosRequest('post', '/personalizevideo', { videokey, language }, signal);
