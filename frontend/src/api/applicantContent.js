/**
 * API для контента лендинга абитуриента
 * @module api/applicantContent
 */

import api from './axios';

export const getApplicantContent = async () => {
  const response = await api.get('/applicant-content');
  return response.data;
};

export const updateApplicantContent = async (data) => {
  const response = await api.put('/applicant-content', data);
  return response.data;
};
