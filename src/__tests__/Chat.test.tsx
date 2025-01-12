import { afterEach, describe, it, expect } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Chat from '../components/Chat.tsx';

describe('Chat Component', () => {
  afterEach(cleanup);

  it('renders initial message', () => {
    render(<Chat />);
    expect(screen.getByText(/¡Hola! Soy SushiBot/)).toBeDefined();
  });

  it('handles user input', () => {
    render(<Chat />);
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: '¿Están abiertos?' } });
    fireEvent.click(button);

    // Wait for bot response
    const response = screen.findByText(/Estamos abiertos de martes a domingo/);
    expect(response).toBeDefined();
  });
});