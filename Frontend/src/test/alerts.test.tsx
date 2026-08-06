import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { canTransition, isTerminalStatus, validTransitions } from '@/lib/utils';
import type { AlertStatus } from '@/lib/types';

// ─── StatusBadge ─────────────────────────────────────────────────────────────
describe('StatusBadge', () => {
  it('renders OPEN badge', () => {
    render(<StatusBadge status="OPEN" />);
    expect(screen.getByText('Open')).toBeTruthy();
  });

  it('renders CLOSED badge', () => {
    render(<StatusBadge status="CLOSED" />);
    expect(screen.getByText('Closed')).toBeTruthy();
  });
});

// ─── SeverityBadge ───────────────────────────────────────────────────────────
describe('SeverityBadge', () => {
  it('renders HIGH severity', () => {
    render(<SeverityBadge severity="HIGH" />);
    expect(screen.getByText(/HIGH/)).toBeTruthy();
  });
});

// ─── Alert status transitions ─────────────────────────────────────────────
describe('Alert status transition rules', () => {
  it('OPEN can transition to ACKNOWLEDGED', () => {
    expect(canTransition('OPEN', 'ACKNOWLEDGED')).toBe(true);
  });

  it('OPEN can transition to INVESTIGATING', () => {
    expect(canTransition('OPEN', 'INVESTIGATING')).toBe(true);
  });

  it('OPEN cannot transition to CLOSED directly', () => {
    expect(canTransition('OPEN', 'CLOSED')).toBe(false);
  });

  it('ACKNOWLEDGED can transition to INVESTIGATING', () => {
    expect(canTransition('ACKNOWLEDGED', 'INVESTIGATING')).toBe(true);
  });

  it('ACKNOWLEDGED can transition to CLOSED', () => {
    expect(canTransition('ACKNOWLEDGED', 'CLOSED')).toBe(true);
  });

  it('INVESTIGATING can transition to CLOSED', () => {
    expect(canTransition('INVESTIGATING', 'CLOSED')).toBe(true);
  });

  it('INVESTIGATING can transition to DISMISSED', () => {
    expect(canTransition('INVESTIGATING', 'DISMISSED')).toBe(true);
  });

  it('CLOSED is terminal — no transitions', () => {
    expect(isTerminalStatus('CLOSED')).toBe(true);
    expect(validTransitions['CLOSED']).toHaveLength(0);
  });

  it('DISMISSED is terminal — no transitions', () => {
    expect(isTerminalStatus('DISMISSED')).toBe(true);
    expect(validTransitions['DISMISSED']).toHaveLength(0);
  });

  it('Non-terminal statuses are not terminal', () => {
    const nonTerminal: AlertStatus[] = ['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING'];
    nonTerminal.forEach((s) => expect(isTerminalStatus(s)).toBe(false));
  });
});

