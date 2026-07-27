import axios from 'axios';

/** Normalise l'URL API (Vercel : toujours se terminer par /api). */
function normalizeApiBase(raw) {
  if (!raw || !String(raw).trim()) {
    return 'http://localhost:8000/api';
  }
  const trimmed = String(raw).trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE_URL);

export const LIVE_POLL_MS = 8000;
export const STUDENT_FEE = 20000;
export const MIN_INSTALLMENT = 5000;
export const MIN_DONATION = 1000;

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function checkApiHealth() {
  const { data } = await api.get('/health/');
  return data;
}

export async function createStudentRegistration(payload, photoFile = null) {
  if (photoFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== '' && value != null) formData.append(key, value);
    });
    formData.append('photo', photoFile);
    const { data } = await api.post('/contributions/student/', formData);
    return data;
  }
  const { data } = await api.post('/contributions/student/', payload);
  return data;
}

export async function createDonorRegistration(payload) {
  const { data } = await api.post('/contributions/donor/', payload);
  return data;
}

export async function initiatePayment(contributionId, amount, phone, method) {
  const { data } = await api.post(`/contributions/${contributionId}/pay/`, {
    amount,
    phone,
    method,
  });
  return data;
}

export async function getPaymentStatus(contributionId) {
  const { data } = await api.get(`/contributions/${contributionId}/status/`);
  return data;
}

export async function confirmCashPayment(contributionId) {
  const { data } = await api.post(`/contributions/${contributionId}/confirm-cash/`);
  return data;
}

export async function uploadPaymentProof(contributionId, file) {
  const formData = new FormData();
  formData.append('payment_proof', file);
  const { data } = await api.post(
    `/contributions/${contributionId}/upload-proof/`,
    formData,
  );
  return data;
}

export async function getCampaignStats() {
  const { data } = await api.get('/campaign-stats/');
  return data;
}

export async function getRegisteredStudents() {
  const { data } = await api.get('/registered-students/');
  return data;
}

export async function getContributions(token) {
  const { data } = await api.get('/contributions/', { headers: authHeaders(token) });
  return Array.isArray(data) ? data : data.results || [];
}

export async function validateContributionPayment(id, token) {
  const { data } = await api.post(
    `/contributions/${id}/validate-payment/`,
    {},
    { headers: authHeaders(token) },
  );
  return data;
}

export async function rejectContributionPayment(id, token) {
  const { data } = await api.post(
    `/contributions/${id}/reject-payment/`,
    {},
    { headers: authHeaders(token) },
  );
  return data;
}
