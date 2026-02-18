import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhysicalPledgeForm } from '../PhysicalPledgeForm';
import { createPhysicalPledge } from '../../actions';
import { toast } from 'sonner';

vi.mock('../../actions', () => ({
  createPhysicalPledge: vi.fn(),
}));

describe('PhysicalPledgeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with required fields', () => {
    render(
      <PhysicalPledgeForm productId="123e4567-e89b-12d3-a456-426614174000" />
    );
    expect(screen.getByText('Oferecer Este Item')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/98765-4321/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
    expect(screen.getByText('Enviar Compromisso')).toBeInTheDocument();
  });

  it('should show success toast after successful submission', async () => {
    vi.mocked(createPhysicalPledge).mockResolvedValueOnce({
      success: true,
      data: { donationId: 'donation-123' },
    });

    render(
      <PhysicalPledgeForm productId="123e4567-e89b-12d3-a456-426614174000" />
    );

    fireEvent.change(screen.getByPlaceholderText('Nome completo'), {
      target: { value: 'Test Donor' },
    });
    fireEvent.change(screen.getByPlaceholderText(/98765-4321/), {
      target: { value: '11987654321' },
    });
    fireEvent.click(screen.getByText('Enviar Compromisso'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Obrigado! Seu compromisso foi registrado')
      );
    });
  });

  it('should show error toast on failed submission', async () => {
    vi.mocked(createPhysicalPledge).mockResolvedValueOnce({
      success: false,
      error: 'ALREADY_FULFILLED',
    });

    render(
      <PhysicalPledgeForm productId="123e4567-e89b-12d3-a456-426614174000" />
    );

    fireEvent.change(screen.getByPlaceholderText('Nome completo'), {
      target: { value: 'Test Donor' },
    });
    fireEvent.change(screen.getByPlaceholderText(/98765-4321/), {
      target: { value: '11987654321' },
    });
    fireEvent.click(screen.getByText('Enviar Compromisso'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Este item já foi atendido.');
    });
  });
});
