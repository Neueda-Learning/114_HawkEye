import { http, HttpResponse } from 'msw';
import { mockTransactions, mockAlerts } from '../data';
import type { TransactionResponse, TransactionDetailResponse } from '@/lib/types';

const BASE = '/api/v1/transactions';

function wrap<T>(data: T, message = 'Success', statusCode = 200) {
  return { success: true, message, statusCode, data, timestamp: new Date().toISOString() };
}

function pagedWrap<T>(content: T[], page: number, size: number) {
  const start = page * size;
  const slice = content.slice(start, start + size);
  return wrap({
    content: slice,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.ceil(content.length / size),
    first: page === 0,
    last: start + size >= content.length,
  });
}

export const transactionHandlers = [
  // POST /api/v1/transactions
  http.post(BASE, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newTx: TransactionResponse = {
      transactionId: Date.now(),
      accountId:       String(body.accountId),
      accountName:     'Mock Account',
      payeeId:         String(body.payeeId),
      payeeName:       'Mock Payee',
      amount:          Number(body.amount),
      currency:        String(body.currency ?? 'USD'),
      transactionType: body.transactionType as TransactionResponse['transactionType'],
      status:          'COMPLETED',
      description:     body.description ? String(body.description) : null,
      timestamp:       new Date().toISOString(),
      createdAt:       new Date().toISOString(),
    };
    mockTransactions.unshift(newTx);
    return HttpResponse.json(wrap(newTx, 'Transaction created successfully', 201), { status: 201 });
  }),

  // GET /api/v1/transactions
  http.get(BASE, ({ request }) => {
    const url    = new URL(request.url);
    const page   = Number(url.searchParams.get('page') ?? 0);
    const size   = Number(url.searchParams.get('size') ?? 20);
    const acct   = url.searchParams.get('accountId');
    const status = url.searchParams.get('status');
    const type   = url.searchParams.get('transactionType');
    const payee  = url.searchParams.get('payeeId');

    let filtered = [...mockTransactions];
    if (acct)   filtered = filtered.filter((t) => t.accountId === acct);
    if (status) filtered = filtered.filter((t) => t.status === status);
    if (type)   filtered = filtered.filter((t) => t.transactionType === type);
    if (payee)  filtered = filtered.filter((t) => t.payeeId === payee);

    return HttpResponse.json(pagedWrap(filtered, page, size));
  }),

  // GET /api/v1/transactions/:id
  http.get(`${BASE}/:id`, ({ params }) => {
    const tx = mockTransactions.find((t) => t.transactionId === Number(params.id));
    if (!tx) return HttpResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });

    const linkedAlerts = mockAlerts
      .filter((a) => a.transactionId === tx.transactionId)
      .map((a) => ({
        alertId:      a.alertId,
        ruleId:       a.ruleId,
        alertStatus:  a.alertStatus,
        severity:     a.severity,
        alertMessage: a.alertMessage,
        createdAt:    a.createdAt,
      }));

    const detail: TransactionDetailResponse = { ...tx, alerts: linkedAlerts };
    return HttpResponse.json(wrap(detail));
  }),

  // GET /api/v1/transactions/:id/alerts
  http.get(`${BASE}/:id/alerts`, ({ params }) => {
    const alerts = mockAlerts
      .filter((a) => a.transactionId === Number(params.id))
      .map((a) => ({
        alertId:      a.alertId,
        ruleId:       a.ruleId,
        alertStatus:  a.alertStatus,
        severity:     a.severity,
        alertMessage: a.alertMessage,
        createdAt:    a.createdAt,
      }));
    return HttpResponse.json(wrap(alerts));
  }),
];

