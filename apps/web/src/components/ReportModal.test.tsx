import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportModal } from './ReportModal';

describe('ReportModal Component', () => {
  const target = {
    targetType: 'LISTING' as const,
    targetId: '550e8400-e29b-41d4-a716-446655440000',
    targetTitle: 'Suspicious Book Title',
  };

  it('renders report form with reason options and details textarea', () => {
    render(
      <ReportModal
        isOpen={true}
        target={target}
        onClose={vi.fn()}
        onSubmitReport={vi.fn()}
      />
    );

    expect(screen.getByTestId('report-modal')).toBeInTheDocument();
    expect(screen.getByText(/Suspicious Book Title/i)).toBeInTheDocument();
    expect(screen.getByTestId('report-reason-select')).toBeInTheDocument();
    expect(screen.getByTestId('report-details-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-report-btn')).toBeInTheDocument();
  });

  it('submits report with selected reason and details', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <ReportModal
        isOpen={true}
        target={target}
        onClose={handleClose}
        onSubmitReport={handleSubmit}
      />
    );

    fireEvent.change(screen.getByTestId('report-reason-select'), {
      target: { value: 'SPAM' },
    });
    fireEvent.change(screen.getByTestId('report-details-input'), {
      target: { value: 'Duplicate posting across multiple campuses.' },
    });

    fireEvent.click(screen.getByTestId('submit-report-btn'));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        'LISTING',
        '550e8400-e29b-41d4-a716-446655440000',
        'SPAM',
        'Duplicate posting across multiple campuses.'
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
