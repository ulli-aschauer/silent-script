// Datenzugriff für das Autorenportal: echtes Backend oder (im Testmodus) Beispieldaten.
import axios from 'axios';
import { DEMO } from '../config';
import { demoApi } from './demo';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const TOKEN_KEY = 'ss_author_token';

// Fehlertext aus der Server-Antwort
export const errorText = (e, fallback = 'Etwas ist schiefgelaufen. Bitte erneut versuchen.') =>
  e?.response?.data?.detail || fallback;

const realApi = {
  register: (data) => axios.post(`${API}/author/register`, data).then((r) => r.data.token),
  login: (email, password) => axios.post(`${API}/author/login`, { email, password }).then((r) => r.data.token),
  forToken: (token) => {
    const c = axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });
    return {
      dashboard: () => c.get('/author/dashboard').then((r) => r.data),
      updateMe: (patch) => c.patch('/author/me', patch).then((r) => r.data),
      apply: (orderId, note) => c.post(`/author/orders/${orderId}/apply`, { note }).then((r) => r.data),
      withdraw: (appId) => c.post(`/author/applications/${appId}/withdraw`).then((r) => r.data),
      decide: (appId, decision) => c.post(`/author/applications/${appId}/decision`, { decision }).then((r) => r.data),
    };
  },
};

export const authorApi = DEMO ? demoApi : realApi;
