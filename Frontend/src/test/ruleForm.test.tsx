import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RuleParameterFields } from '@/features/rules/components/RuleParameterFields';

// Wrapper to provide FormProvider context
function Wrapper({ ruleType }: { ruleType: string }) {
  const schema = z.object({ parameters: z.record(z.unknown()) });
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: { parameters: {} } });

  return (
    <FormProvider {...methods}>
      <form>
        <RuleParameterFields ruleType={ruleType as never} />
      </form>
    </FormProvider>
  );
}

describe('RuleParameterFields', () => {
  it('shows placeholder when no rule type selected', () => {
    render(<Wrapper ruleType="" />);
    expect(screen.getByText(/Select a rule type/i)).toBeTruthy();
  });

  it('shows thresholdAmount field for AMOUNT_THRESHOLD', () => {
    render(<Wrapper ruleType="AMOUNT_THRESHOLD" />);
    expect(screen.getByText(/Threshold Amount/i)).toBeTruthy();
    expect(screen.getByPlaceholderText('10000')).toBeTruthy();
  });

  it('shows windowMinutes and maxTransactions for VELOCITY', () => {
    render(<Wrapper ruleType="VELOCITY" />);
    expect(screen.getByText(/Time Window/i)).toBeTruthy();
    expect(screen.getByText(/Max Transactions/i)).toBeTruthy();
  });

  it('shows lookbackDays for NEW_PAYEE', () => {
    render(<Wrapper ruleType="NEW_PAYEE" />);
    expect(screen.getByText(/Lookback Days/i)).toBeTruthy();
    expect(screen.getByPlaceholderText('365')).toBeTruthy();
  });

  it('shows dailyLimitAmount for DAILY_LIMIT', () => {
    render(<Wrapper ruleType="DAILY_LIMIT" />);
    expect(screen.getByText(/Daily Limit Amount/i)).toBeTruthy();
    expect(screen.getByPlaceholderText('50000')).toBeTruthy();
  });
});

