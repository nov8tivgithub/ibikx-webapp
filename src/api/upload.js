// MakeFileUpload — multipart variant of MakeAxiosRequest.
//
// This backend doesn't sign multipart requests via custom headers either; the
// caller appends an `apiInfo` JSON blob into the FormData if the endpoint
// needs it. Default behaviour just sends the FormData as-is with
// Content-Type: multipart/form-data.

import { apiClient } from './client';

export function MakeFileUpload(method, url, formData) {
  return new Promise((resolve) => {
    apiClient({
      method,
      url,
      data: formData,
      headers: { 'content-type': 'multipart/form-data' },
    })
      .then((res) => resolve(res.data))
      .catch((err) => resolve(err));
  });
}
