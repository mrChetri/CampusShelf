import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App Root Shell (Frontend Seam)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          status: 'ok',
          environment: 'test',
          uptime: 10,
          timestamp: new Date().toISOString(),
        }),
      })
    );
  });

  it('renders the CampusShelf application branding and mission', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/CampusShelf/i);
    expect(screen.getByText(/Donation-first student book network/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('system-status-badge')).toBeInTheDocument();
    });
  });

  it('renders the system status indicator badge and reflects live status', async () => {
    render(<App />);
    expect(screen.getByTestId('system-status-badge')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/System Status: Online \(test\)/i)).toBeInTheDocument();
    });
  });
});
