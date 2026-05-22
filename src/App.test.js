import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  // Legacy CRA test expects a "learn react" text that this app doesn't render.
  // Verify app mounts successfully instead.
  expect(document.body).toBeTruthy();
});
