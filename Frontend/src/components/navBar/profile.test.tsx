/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from './profile';
import { useUser } from '../../Contexts/UserContext';

jest.mock('../../Contexts/UserContext', () => ({
  useUser: jest.fn(),
}));

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

describe('Profile', () => {
  it('shows name and avatar when user is present', () => {
    mockUseUser.mockReturnValue({ user: { firstName: 'Jane', lastName: 'Doe' } });
    
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByAltText('Profile')).toBeInTheDocument();
  });
});
