// components/navigations.test.tsx
import { render, screen } from '@testing-library/react';
import Navigations from './navigations';

const originalLocation = window.location;

beforeAll(() => {
  delete (window as any).location;
  window.location = { pathname: '/pages/Favorites' } as any;
});

afterAll(() => {
  window.location = originalLocation;
});

describe('Navigations', () => {
  it('renders all menu links with correct href and label', () => {
    render(<Navigations />);
    const links = screen.getAllByRole('link');
    const labels = links.map(l => l.textContent);
    expect(labels).toEqual(['Map', 'Favorites', 'Daily', 'About Us']);

    const favLink = screen.getByText('Favorites').closest('a');
    expect(favLink).toHaveAttribute('href', '/pages/Favorites');
  });

  it('applies active class to current page link', () => {
    render(<Navigations />);
    const fav = screen.getByText('Favorites').parentElement;
    expect(fav).toHaveClass('bg-blue-100');
  });
});
