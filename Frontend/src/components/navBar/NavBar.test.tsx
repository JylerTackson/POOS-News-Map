// components/NavBar.test.tsx
import { render, screen } from '@testing-library/react';
import NavBar from './NavBar';

// stub out child components
jest.mock('./logo',       () => () => <div data-testid="logo" />);
jest.mock('./navigations',() => () => <div data-testid="navs" />);
jest.mock('./profile',    () => () => <div data-testid="profile" />);

describe('NavBar', () => {
  it('renders Logo, Navigations, and Profile', () => {
    render(<NavBar />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('navs')).toBeInTheDocument();
    expect(screen.getByTestId('profile')).toBeInTheDocument();
  });
});
