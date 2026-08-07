import { http, HttpResponse } from 'msw';
import { mockRules, mockRuleAudit } from '../data';
import type { Rule, RuleStatus } from '@/lib/types';

const BASE = '/api/v1/rules';

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

export const ruleHandlers = [
  // GET /api/v1/rules
  http.get(BASE, ({ request }) => {
    const url    = new URL(request.url);
    const page   = Number(url.searchParams.get('page') ?? 0);
    const size   = Number(url.searchParams.get('size') ?? 20);
    const status = url.searchParams.get('status');
    const type   = url.searchParams.get('ruleType');
    const sev    = url.searchParams.get('severity');
    const search = url.searchParams.get('search')?.toLowerCase();

    let filtered = [...mockRules];
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (type)   filtered = filtered.filter((r) => r.ruleType === type);
    if (sev)    filtered = filtered.filter((r) => r.severity === sev);
    if (search) filtered = filtered.filter((r) =>
      r.ruleName.toLowerCase().includes(search) ||
      (r.description ?? '').toLowerCase().includes(search),
    );

    return HttpResponse.json(pagedWrap(filtered, page, size));
  }),

  // GET /api/v1/rules/:id
  http.get(`${BASE}/:id`, ({ params }) => {
    const rule = mockRules.find((r) => r.ruleId === Number(params.id));
    if (!rule) return HttpResponse.json({ success: false, message: 'Rule not found' }, { status: 404 });
    return HttpResponse.json(wrap(rule));
  }),

  // POST /api/v1/rules
  http.post(BASE, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newRule: Rule = {
      ruleId:      mockRules.length + 10,
      ruleName:    String(body.name),
      description: body.description ? String(body.description) : null,
      ruleType:    body.ruleType as Rule['ruleType'],
      severity:    body.severity as Rule['severity'],
      status:      'ACTIVE',
      parameters:  body.parameters as Rule['parameters'],
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };

    // Check duplicate name
    if (mockRules.some((r) => r.ruleName === newRule.ruleName)) {
      return HttpResponse.json({ success: false, message: 'Rule name already exists' }, { status: 409 });
    }

    mockRules.push(newRule);
    return HttpResponse.json(wrap(newRule, 'Rule created', 201), { status: 201 });
  }),

  // PUT /api/v1/rules/:id
  http.put(`${BASE}/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const idx  = mockRules.findIndex((r) => r.ruleId === Number(params.id));
    if (idx === -1) return HttpResponse.json({ success: false, message: 'Rule not found' }, { status: 404 });

    mockRules[idx] = {
      ...mockRules[idx],
      ruleName:    String(body.name),
      description: body.description ? String(body.description) : null,
      severity:    body.severity as Rule['severity'],
      parameters:  body.parameters as Rule['parameters'],
      updatedAt:   new Date().toISOString(),
    };
    return HttpResponse.json(wrap(mockRules[idx], 'Rule updated'));
  }),

  // DELETE /api/v1/rules/:id
  http.delete(`${BASE}/:id`, ({ params }) => {
    const idx = mockRules.findIndex((r) => r.ruleId === Number(params.id));
    if (idx === -1) return HttpResponse.json({ success: false, message: 'Rule not found' }, { status: 404 });
    mockRules[idx] = { ...mockRules[idx], status: 'DELETED' as RuleStatus, updatedAt: new Date().toISOString() };
    return HttpResponse.json(wrap(null, 'Rule deleted'));
  }),

  // PUT /api/v1/rules/:id/toggle
  http.put(`${BASE}/:id/toggle`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const idx  = mockRules.findIndex((r) => r.ruleId === Number(params.id));
    if (idx === -1) return HttpResponse.json({ success: false, message: 'Rule not found' }, { status: 404 });

    mockRules[idx] = {
      ...mockRules[idx],
      status:    body.active ? 'ACTIVE' : 'INACTIVE',
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(wrap(mockRules[idx], `Rule ${body.active ? 'activated' : 'deactivated'}`));
  }),

  // GET /api/v1/rules/:id/audit-trail
  http.get(`${BASE}/:id/audit-trail`, ({ params }) => {
    const trail = mockRuleAudit.filter((e) => e.ruleId === Number(params.id));
    return HttpResponse.json(wrap({ content: trail, page: 0, size: 20, totalElements: trail.length, totalPages: 1, first: true, last: true }));
  }),
];

