// IDE Bytes (micro-learning). Endpoint paths per migration doc (Section 5):
//   /bytes/listing, /bytes/details, /bytes/trackshare, /bytes/trackclick

import { MakeAxiosRequest } from '../api/request';

export const getBytesListingService = (page = 1, signal) =>
  MakeAxiosRequest('post', '/bytes/listing', { page }, signal);

export const getBytesDetailsService = (bytekey, signal) =>
  MakeAxiosRequest('post', '/bytes/details', { bytekey }, signal);

// Tracking — fire-and-forget.
export const trackByteClickService = (bytekey, signal) =>
  MakeAxiosRequest('post', '/bytes/trackclick', { bytekey }, signal);

export const trackByteShareService = (bytekey, channel = '', signal) =>
  MakeAxiosRequest('post', '/bytes/trackshare', { bytekey, channel }, signal);
