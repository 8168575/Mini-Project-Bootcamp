import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders the room planner heading', () => {
  render(<App />);
  expect(screen.getByText(/home interior layout planner/i)).toBeInTheDocument();
});
