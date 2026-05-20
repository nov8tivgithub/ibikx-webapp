// IDE Bytes (micro-learning). Endpoint paths per migration doc (Section 5):
//   /bytes/listing, /bytes/details, /bytes/trackshare, /bytes/trackclick

import { MakeAxiosRequest } from '../api/request';

// /bytes/listing — paged via `page_id` (matches the mobile app contract).
export const getBytesListingService = (page_id = 1, signal) =>
  MakeAxiosRequest('post', '/bytes/listing', { page_id }, signal);

export const getBytesDetailsService = (byteskey, signal) =>
  MakeAxiosRequest('post', '/bytes/details', { byteskey }, signal);

// Tracking — fire-and-forget.
export const trackByteClickService = (byteskey, signal) =>
  MakeAxiosRequest('post', '/bytes/trackclick', { byteskey }, signal);

export const trackByteShareService = (byteskey, channel = '', signal) =>
  MakeAxiosRequest('post', '/bytes/trackshare', { byteskey, channel }, signal);
