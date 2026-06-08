const BASE = '/api/whatgpr';
const token = () => sessionStorage.getItem('token') || '';
const authHeaders = () => ({ 'Authorization': `Bearer ${token()}` });

// WhatsApp
export const getQR = () => fetch(`${BASE}/whatsapp/qr`, { headers: authHeaders() }).then(r => r.json());
export const getStatus = () => fetch(`${BASE}/whatsapp/status`, { headers: authHeaders() }).then(r => r.json());
export const disconnect = () => fetch(`${BASE}/whatsapp/disconnect`, { method: 'POST', headers: authHeaders() });

// Messages
export const getMessages = (filter = 'all') => fetch(`${BASE}/messages?filter=${filter}`, { headers: authHeaders() }).then(r => r.json());
export const markRead = (id) => fetch(`${BASE}/messages/${id}/read`, { method: 'PATCH', headers: authHeaders() });
export const markReadBatch = (ids) => fetch(`${BASE}/messages/read`, { method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });

// Complaints
export const getComplaints = (status) => fetch(`${BASE}/complaints${status ? `?status=${status}` : ''}`, { headers: authHeaders() }).then(r => r.json());
export const createComplaint = (formData) => fetch(`${BASE}/complaints`, { method: 'POST', headers: authHeaders(), body: formData });
export const getComplaint = (id) => fetch(`${BASE}/complaints/${id}`, { headers: authHeaders() }).then(r => r.json());
export const updateComplaintStatus = (id, status) => fetch(`${BASE}/complaints/${id}/status`, { method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
export const replyToComplaint = (id, body) => fetch(`${BASE}/complaints/${id}/reply`, { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) });
export const sendSurvey = (id) => fetch(`${BASE}/complaints/${id}/survey`, { method: 'POST', headers: authHeaders() });

// Dashboard
export const getDashboardStats = () => fetch(`${BASE}/dashboard/stats`, { headers: authHeaders() }).then(r => r.json());
