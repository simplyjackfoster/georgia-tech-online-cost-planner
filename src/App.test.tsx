import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('updates the dashboard when a pace is selected', async () => {
    render(<App />);

    const paceRow = screen.getByLabelText(/select 3 credits per term/i);
    await userEvent.click(paceRow);

    expect(screen.getByText(/10 semesters/i)).toBeInTheDocument();
  });
});
