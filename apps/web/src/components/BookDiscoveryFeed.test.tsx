import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BookDiscoveryFeed } from './BookDiscoveryFeed';
import type { Campus, PublicListing } from '@campusshelf/contracts';

const mockCampuses: Campus[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Darrang College',
    slug: 'darrang-college',
    city: 'Tezpur',
    state: 'Assam',
    active: true,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440000',
    name: 'Tezpur University',
    slug: 'tezpur-university',
    city: 'Tezpur',
    state: 'Assam',
    active: true,
  },
];

const mockFeedListings: PublicListing[] = [
  {
    id: 'l1111111-0000-0000-0000-000000000001',
    donorId: 'u1111111-0000-0000-0000-000000000001',
    donorName: 'Aarav Sharma',
    campusId: '550e8400-e29b-41d4-a716-446655440000',
    campusName: 'Darrang College',
    title: 'Concepts of Physics Vol 1',
    author: 'H.C. Verma',
    isbn: '9788177091878',
    subject: 'Physics',
    condition: 'LIKE_NEW',
    pickupLocation: 'Main Canteen',
    photos: ['https://example.com/hcv.jpg'],
    status: 'AVAILABLE',
    type: 'DONATION',
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
];

describe('BookDiscoveryFeed Component', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/listings')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              listings: mockFeedListings,
              total: 1,
              page: 1,
              limit: 12,
              hasMore: false,
            }),
          });
        }
        return Promise.reject(new Error('Not found'));
      })
    );
  });

  it('renders search input, filter dropdowns, and book cards', async () => {
    const handleSelect = vi.fn();
    render(
      <BookDiscoveryFeed
        campuses={mockCampuses}
        onSelectListing={handleSelect}
      />
    );

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('filter-campus')).toBeInTheDocument();
    expect(screen.getByTestId('filter-condition')).toBeInTheDocument();
    expect(screen.getByTestId('filter-type')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Concepts of Physics Vol 1')).toBeInTheDocument();
      expect(screen.getByText(/by H.C. Verma/i)).toBeInTheDocument();
      expect(screen.getByText('FREE DONATION')).toBeInTheDocument();
    });

    // Clicking card triggers callback
    const card = screen.getByTestId('book-card-l1111111-0000-0000-0000-000000000001');
    fireEvent.click(card);
    expect(handleSelect).toHaveBeenCalledWith(mockFeedListings[0]);
  });

  it('renders sale listings with secondary badge styling and formatted asking price (CS-011)', async () => {
    const saleListing: PublicListing = {
      id: 'sale-card-1',
      donorId: 'u2222222-0000-0000-0000-000000000002',
      donorName: 'Priya Das',
      campusId: '550e8400-e29b-41d4-a716-446655440000',
      campusName: 'Darrang College',
      title: 'Organic Chemistry 8th Edition',
      author: 'Paula Bruice',
      subject: 'Chemistry',
      condition: 'GOOD',
      pickupLocation: 'Science Dept Entrance',
      photos: ['https://example.com/chem.jpg'],
      status: 'AVAILABLE',
      type: 'SALE',
      price: 280,
      createdAt: '2026-11-20T10:00:00.000Z',
      updatedAt: '2026-11-20T10:00:00.000Z',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string) => {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            listings: [saleListing],
            total: 1,
            page: 1,
            limit: 12,
            hasMore: false,
          }),
        });
      })
    );

    render(
      <BookDiscoveryFeed
        campuses={mockCampuses}
        onSelectListing={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Organic Chemistry 8th Edition')).toBeInTheDocument();
      expect(screen.getByTestId('badge-sale')).toBeInTheDocument();
      expect(screen.getByTestId('listing-price')).toHaveTextContent(/₹280/);
      expect(screen.getByTestId('card-price')).toHaveTextContent('₹280');
    });

    // Test changing filter-type
    const filterType = screen.getByTestId('filter-type');
    fireEvent.change(filterType, { target: { value: 'SALE' } });
    expect(filterType).toHaveValue('SALE');
  });
});
