import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import App from './App';

describe('App Root Shell (Frontend Seam)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/health')) {
          return Promise.resolve({
            json: async () => ({
              status: 'ok',
              environment: 'test',
              uptime: 10,
              timestamp: new Date().toISOString(),
            }),
          });
        }
        return Promise.reject(new Error('Not found'));
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

  it('renders guest mode by default with Sign in with Google button', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('guest-auth-section')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
  });

  it('displays student profile and Registered User badge when authenticated and supports signing out', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('guest-auth-section')).toBeInTheDocument();
    });

    // Trigger sign in
    const signInBtn = screen.getByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    // Profile chip and badge should now be rendered in the header
    await waitFor(() => {
      const profileChip = screen.getByTestId('user-profile-chip');
      expect(profileChip).toBeInTheDocument();
      expect(within(profileChip).getByText(/Registered User/i)).toBeInTheDocument();
      expect(within(profileChip).getByText(/Aarav Sharma/i)).toBeInTheDocument();
    });

    // Clicking sign out returns to guest mode
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
    });
  });
});
