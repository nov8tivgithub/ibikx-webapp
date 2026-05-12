// MakeAxiosRequest — central HTTP function used by every service.
//
// This backend identifies the client and the user entirely through the
// `apiInfo` envelope in the request body (apitoken + accesstoken), so the
// request leaves with no custom headers — just the default Content-Type. That
// keeps the CORS preflight green (Content-Type is already in every server's
// Access-Control-Allow-Headers list) and matches the Postman contract.
//
// The envelope shape mirrors what the backend expects in Postman:
//   { apiInfo: { apitoken, devicetoken, devicekey, devicetype, os,
//                buildversion, buildnumber, accesstoken },
//     parameters: { ... } }
//
// Behavioural contract is preserved from the reference:
//  - Resolves (never rejects) with `res.data` on success, or the axios error on failure.
//  - On `status==-1` / `-3` / HTTP `403`, clears stored auth and hard-redirects to /login.
//    Pass `skipAutoLogout=true` (5th arg) to opt out per-call.
//  - `signal` flows through to axios so callers can abort via AbortController.

import { apiClient } from './client';
import { apiKey } from '../config/env';
import { getToken, clearAuth } from '../utils/token';
import { notify } from '../utils/notify';

// Static device descriptors for the web client. Override via env vars if the
// backend ever cares about exact values.
const env             = import.meta.env || {};
const DEVICE_TOKEN    = env.VITE_DEVICE_TOKEN || 'web-client';
const DEVICE_KEY      = env.VITE_DEVICE_KEY   || 'web';
const DEVICE_TYPE     = env.VITE_DEVICE_TYPE  || 'web';
const OS              = env.VITE_DEVICE_OS    || 'w';
const BUILD_VERSION   = env.VITE_BUILD_VERSION || '2.8.6';
// Sent as a string to match the production app (matches captured payload).
const BUILD_NUMBER    = String(env.VITE_BUILD_NUMBER || '64');

function bailToLogin() {
  clearAuth();
  // Hard reload — wipes app state cleanly. Matches the reference behaviour.
  window.location.href = '/login';
}

// `apiInfoExtra` (optional, 6th arg) lets a specific service merge extra
// fields into apiInfo without changing every other call. The Login service
// uses this to attach its MD5 `enckey`.
export function MakeAxiosRequest(method, url, parameters = {}, signal, skipAutoLogout = false, apiInfoExtra = {}) {
  const accesstoken = getToken() || '';

  return new Promise((resolve) => {
    apiClient({
      method,
      url,
      data: {
        apiInfo: {
          apitoken: apiKey,
          devicetoken: DEVICE_TOKEN,
          devicekey: DEVICE_KEY,
          devicetype: DEVICE_TYPE,
          os: OS,
          buildversion: BUILD_VERSION,
          buildnumber: BUILD_NUMBER,
          accesstoken,
          ...apiInfoExtra,
        },
        parameters,
      },
      signal,
    }).then((res) => {
      // status === -1 → token expired / invalid
      if (res.data?.status === '-1' || res.data?.status === -1) {
        if (!skipAutoLogout) { bailToLogin(); }
        else                 { resolve(res.data); }
        return;
      }
      // status === -3 → forbidden — show the server message before booting out
      if (res.data?.status === '-3' || res.data?.status === -3) {
        if (!skipAutoLogout) { notify.error(res.data.message); bailToLogin(); }
        else                 { resolve(res.data); }
        return;
      }
      resolve(res.data);
    }).catch((err) => {
      if (err?.response?.status === 403) {
        if (!skipAutoLogout) { bailToLogin(); return; }
        resolve(err);
        return;
      }
      if (err?.name !== 'CanceledError') {
        // eslint-disable-next-line no-console
        console.error('[MakeAxiosRequest]', err);
      }
      resolve(err);
    });
  });
}
