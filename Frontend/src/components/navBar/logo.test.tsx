
// components/Logo.test.tsx
import { render, screen } from '@testing-library/react';
import Logo from './logo';

jest.mock('../../../public/newsmap.png', () => 'test-logo.png');

describe('Logo', () => {
  it('renders an image with correct src and alt', () => {
    render(<Logo />);
    const img = screen.getByAltText('News Map Logo') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('test-logo.png');
  });
});
