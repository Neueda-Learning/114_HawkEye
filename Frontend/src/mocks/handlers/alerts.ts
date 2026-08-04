import { http, HttpResponse } from 'msw';
import { mockAlerts, mockAlertAudit, mockDashboardStats } from '../data';
import type { Alert, AlertStatus } from '@/lib/types';

const BASE = '/api/v1/alerts';

function wrap<T>(data: T, message = 'Success', statusCode = 200) {
  return { success: true, message, statusCode, data, timestamp: new Date().toISOString() };
}

function pagedWrap<T>(content: T[], page: number, size: number) {
  const start = page * size;
  const slice = content.slice(start, start + size);
  return wrap({
    content: slice, page, size,
    totalElements: content.length,
    totalPages: Math.ceil(content.length / size),
    first: page === 0,
    last: start + size >= content.length,
  });
}

function updateStatus(alertId: number, newStatus: AlertStatus, body: Record<string, unknown>) {
  const idx = mockAlerts.findIndex((a) => a.alertId === alertId);
  if (idx === -1) return null;

  const alert = { ...mockAlerts[idx] };
  const now   = new Date().toISOString();

  alert.alertStatus = newStatus;
  alert.updatedAt   = now;

  if (newStatus === 'ACKNOWLEDGED')  alert.acknowledgedAt  = now;
  if (newStatus === 'INVESTIGATING') alert.investigatingAt = now;
  if (newStatus === 'CLOSED' || newStatus === 'DISMISSED') {
    alert.closedAt     = now;
    alert.closedReason = String(body.reason ?? '');
    alert.closedBy     = String(body.performedBy ?? 'OPERATOR');
  }

  mockAlerts[idx] = alert;
  return alert;
}

export const alertHandlers = [
  // GET /api/v1/alerts
  http.get(BASE, ({ request }) => {
    const url    = new URL(request.url);
    const page   = Number(url.searchParams.get('page') ?? 0);
    const size   = Number(url.searchParams.get('size') ?? 20);
    const status = url.searchParams.get('alertStatus');
    const sev    = url.searchParams.get('severity');

    let filtered = [...mockAlerts];
    if (status) filtered = filtered.filter((a) => a.alertStatus === status);
    if (sev)    filtered = filtered.filter((a) => a.severity === sev);

    return HttpResponse.json(pagedWrap(filtered, page, size));
  }),

  // GET /api/v1/alerts/history
  http.get(`${BASE}/history`, ({ request }) => {
    const url  = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);
    const closed = mockAlerts.filter((a) => a.alertStatus === 'CLOSED' || a.alertStatus === 'DISMISSED');
    return HttpResponse.json(pagedWrap(closed, page, size));
  }),

  // GET /api/v1/alerts/stats
  http.get(`${BASE}/stats`, () => {
    const byStatus = mockAlerts.reduce((acc, a) => {
      acc[a.alertStatus] = (acc[a.alertStatus] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = mockAlerts.reduce((acc, a) => {
      acc[a.severity] = (acc[a.severity] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return HttpResponse.json(wrap({
      byStatus, bySeverity,
      dailyTrend:               mockDashboardStats.alertTrend,
      avgResolutionTimeMinutes: 42,
    }));
  }),

  // GET /api/v1/alerts/:id
  http.get(`${BASE}/:id`, ({ params }) => {
    const alert = mockAlerts.find((a) => a.alertId === Number(params.id));
    if (!alert) return HttpResponse.json({ success: false, message: 'Alert not found' }, { status: 404 });
    return HttpResponse.json(wrap(alert));
  }),

  // GET /api/v1/alerts/:id/audit-trail
  http.get(`${BASE}/:id/audit-trail`, ({ params }) => {
    const trail = mockAlertAudit.filter((e) => e.alertId === Number(params.id));
    return HttpResponse.json(wrap(trail));
  }),

  // GET /api/v1/alerts/:id/transactions
  http.get(`${BASE}/:id/transactions`, ({ params }) => {
    const { mockTransactions } = require('../data');
    const alert = mockAlerts.find((a) => a.alertId === Number(params.id));
    if (!alert) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    const txs = mockTransactions.filter((t: Alert) => t.transactionId === alert.transactionId);
    return HttpResponse.json(wrap(txs));
  }),

  // PUT /api/v1/alerts/:id/acknowledge
  http.put(`${BASE}/:id/acknowledge`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const updated = updateStatus(Number(params.id), 'ACKNOWLEDGED', body);
    if (!updated) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return HttpResponse.json(wrap(updated, 'Alert acknowledged'));
  }),

  // PUT /api/v1/alerts/:id/investigate
  http.put(`${BASE}/:id/investigate`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const updated = updateStatus(Number(params.id), 'INVESTIGATING', body);
    if (!updated) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return HttpResponse.json(wrap(updated, 'Alert set to investigating'));
  }),

  // PUT /api/v1/alerts/:id/close
  http.put(`${BASE}/:id/close`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const updated = updateStatus(Number(params.id), 'CLOSED', body);
    if (!updated) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return HttpResponse.json(wrap(updated, 'Alert closed'));
  }),

  // PUT /api/v1/alerts/:id/dismiss
  http.put(`${BASE}/:id/dismiss`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const updated = updateStatus(Number(params.id), 'DISMISSED', body);
    if (!updated) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return HttpResponse.json(wrap(updated, 'Alert dismissed'));
  }),
];

