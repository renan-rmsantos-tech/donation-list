import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FulfilledBadge } from '../FulfilledBadge';

describe('FulfilledBadge', () => {
  it('should render Fulfilled badge for fulfilled state', () => {
    render(<FulfilledBadge isFulfilled={true} />);
    expect(screen.getByText('Atendido')).toBeInTheDocument();
  });

  it('should render Needed badge for pending state', () => {
    render(<FulfilledBadge isFulfilled={false} />);
    expect(screen.getByText('Necessário')).toBeInTheDocument();
  });

  it('should apply green styling for fulfilled state', () => {
    const { container } = render(<FulfilledBadge isFulfilled={true} />);
    const badge = container.querySelector('.bg-green-50, .border-green-500');
    expect(badge).toBeInTheDocument();
  });

  it('should apply orange styling for pending state', () => {
    const { container } = render(<FulfilledBadge isFulfilled={false} />);
    const badge = container.querySelector('.bg-orange-50, .border-orange-500');
    expect(badge).toBeInTheDocument();
  });
});
