// Single gateway over localStorage so the rest of the app never reads/writes
// auth keys directly. Swap to cookies / sessionStorage by editing this file.

export const TOKEN_KEY = 'accesstoken';
export const USER_KEY  = 'user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuth = ({ token, user }) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user)  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); }
  catch { return null; }
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthed = () => !!getToken();
