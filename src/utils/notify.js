// Tiny wrapper over react-hot-toast so the toast library is swappable from one
// place (e.g. switch to SweetAlert2 / sonner by editing only this file).

import toast from 'react-hot-toast';

export const notify = {
  success: (msg) => toast.success(msg || 'Success'),
  error:   (msg) => toast.error(msg   || 'Something went wrong'),
  info:    (msg) => toast(msg || ''),
  warn:    (msg) => toast(msg || '', { icon: '⚠️' }),
};
