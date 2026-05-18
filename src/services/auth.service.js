import CryptoJS from 'crypto-js';
import { MakeAxiosRequest } from '../api/request';
import { deviceSecret } from '../config/constants';

// Backend computes the same MD5 server-side and compares — see
// server's php login handler:
//   md5($lowemail . $inputParameters["password"] . DEVICESECRET)
export const loginService = (email, password, signal) => {
  const lowEmail = (email || '').toLowerCase();
  const enckey   = CryptoJS.MD5(lowEmail + password + deviceSecret).toString();
  return MakeAxiosRequest(
    'post',
    '/login',
    { email: lowEmail, password },
    signal,
    false,
    { enckey },
  );
};

export const logoutService = (signal) =>
  MakeAxiosRequest('post', '/logout', {}, signal);

export const getCountriesService = (signal) =>
  MakeAxiosRequest('post', '/getcountries', {}, signal);

export const validatePhoneService = (phone_number, countrycode, login_type = 'phone', signal) =>
  MakeAxiosRequest('post', '/validatephonenumber', { phone_number, countrycode, login_type }, signal);

export const sendOtpService = (phone_number, countrycode, signal) =>
  MakeAxiosRequest('post', '/sendotp', { phone_number, countrycode }, signal);

export const verifyOtpService = (otp_uuid, otp, signal) =>
  MakeAxiosRequest('post', '/verifyotp', { otp_uuid, otp }, signal);

export const forgotPasswordService = (email, signal) =>
  MakeAxiosRequest('post', '/forgotpassword', { email }, signal);

export const changePasswordService = (current_password, new_password, signal) =>
  MakeAxiosRequest('post', '/changepassword', { current_password, new_password }, signal);
