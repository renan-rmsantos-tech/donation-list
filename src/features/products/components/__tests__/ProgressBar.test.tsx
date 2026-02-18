import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { calculateProgressPercentage, formatCurrency } from '@/lib/utils/format';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar component', () => {
  it('should display progress label', () => {
    render(<ProgressBar currentAmount={5000} targetAmount={10000} />);
    expect(screen.getByText('Progresso')).toBeInTheDocument();
  });

  it('should display partial funding percentage for monetary products', () => {
    render(<ProgressBar currentAmount={5000} targetAmount={10000} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should display 100% when fully funded', () => {
    render(<ProgressBar currentAmount={10000} targetAmount={10000} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should display 0% when no progress', () => {
    render(<ProgressBar currentAmount={0} targetAmount={10000} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should cap at 100% when overfunded', () => {
    render(<ProgressBar currentAmount={15000} targetAmount={10000} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should display current and target amounts', () => {
    render(<ProgressBar currentAmount={5000} targetAmount={10000} />);
    expect(screen.getByText(/de/)).toBeInTheDocument();
  });
});

describe('ProgressBar utilities', () => {
  describe('calculateProgressPercentage', () => {
    it('should return 0% when current is 0', () => {
      const result = calculateProgressPercentage(0, 10000);
      expect(result).toBe(0);
    });

    it('should return 50% when current is half of target', () => {
      const result = calculateProgressPercentage(5000, 10000);
      expect(result).toBe(50);
    });

    it('should return 100% when current equals target', () => {
      const result = calculateProgressPercentage(10000, 10000);
      expect(result).toBe(100);
    });

    it('should cap at 100% when current exceeds target', () => {
      const result = calculateProgressPercentage(15000, 10000);
      expect(result).toBe(100);
    });

    it('should return 0% when target is 0 or negative', () => {
      expect(calculateProgressPercentage(100, 0)).toBe(0);
      expect(calculateProgressPercentage(100, -100)).toBe(0);
    });

    it('should round percentage correctly', () => {
      // 1/3 = 33.33...% rounds to 33%
      const result = calculateProgressPercentage(3333, 10000);
      expect(result).toBe(33);
    });
  });

  describe('formatCurrency', () => {
    it('should format cents as BRL currency', () => {
      const result = formatCurrency(10000);
      expect(result).toMatch(/R\$\s*100[,.]00/);
    });

    it('should format zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/R\$\s*0[,.]00/);
    });

    it('should handle cents correctly', () => {
      const result = formatCurrency(12345); // R$ 123,45
      expect(result).toMatch(/123[,.]45/);
    });

    it('should format large amounts', () => {
      const result = formatCurrency(1000000); // R$ 10.000,00
      expect(result).toMatch(/10[\s.]*000/);
    });
  });
});
