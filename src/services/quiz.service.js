// Quiz module. Endpoint paths per migration doc (Section 4):
//   /quiz, /quizdetails, /submitquiz, /quizsuccess, /quizhistory, /quiz/answerdistribution

import { MakeAxiosRequest } from '../api/request';

// Landing screen — banner state, badges, today's winners.
export const getQuizService = (signal) =>
  MakeAxiosRequest('post', '/quiz', {}, signal);

// Active quiz question(s) — used both during a live quiz and to view a past one.
export const getQuizDetailsService = (quiz_id, signal) =>
  MakeAxiosRequest('post', '/quizdetails', { quiz_id }, signal);

// Submit the user's chosen option.
export const submitQuizService = (quiz_id, option, signal) =>
  MakeAxiosRequest('post', '/submitquiz', { quiz_id, option }, signal);

// Post-submit screen (score / rank / earned points).
export const getQuizSuccessService = (quiz_id, signal) =>
  MakeAxiosRequest('post', '/quizsuccess', { quiz_id }, signal);

export const getQuizHistoryService = (signal) =>
  MakeAxiosRequest('post', '/quizhistory', {}, signal);

export const getQuizAnswerDistributionService = (quiz_id, signal) =>
  MakeAxiosRequest('post', '/quiz/answerdistribution', { quiz_id }, signal);
