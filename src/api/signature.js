// Port of useSignatureGenerator() from
// maxine-customer-app-react/src/utils/handler.js (lines 10-52).
// Builds the deterministic URL string, then SHA-256(urlString + appSecret).

import CryptoJS from 'crypto-js';

function attachParams(params) {
  let qs = '';
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      qs += `&${key}=${JSON.stringify(value)}`;
    } else {
      qs += `&${key}=${value}`;
    }
  }
  return qs;
}

function sortParams(params) {
  const sorted = {};
  Object.keys(params).sort().forEach((k) => { sorted[k] = params[k]; });
  return sorted;
}

function hash(input, appSecret) {
  return CryptoJS.SHA256(input + appSecret).toString(CryptoJS.enc.Hex);
}

export function getAppSignature(apiUrl, appId, appSecret, params = {}) {
  const sorted = sortParams(params);
  const url = `${apiUrl}?appId=${appId}${attachParams(sorted)}`;
  return hash(url, appSecret);
}
