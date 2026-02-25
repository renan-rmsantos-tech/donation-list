import { describe, it, expect } from 'vitest';
import { generateDescription } from '../lib/description-template';

describe('generateDescription', () => {
  it('should generate description with both name and category', () => {
    const result = generateDescription('Impressora', 'Eletrônicos');
    expect(result).toBe('Impressora para doação. Categoria: Eletrônicos');
  });

  it('should generate description with only name when category is empty', () => {
    const result = generateDescription('Mesa', '');
    expect(result).toBe('Mesa para doação.');
  });

  it('should generate description with only name when category is whitespace', () => {
    const result = generateDescription('Cadeira', '   ');
    expect(result).toBe('Cadeira para doação.');
  });

  it('should handle names with leading/trailing spaces', () => {
    const result = generateDescription('  Livro  ', 'Educação');
    expect(result).toBe('Livro para doação. Categoria: Educação');
  });

  it('should handle categories with leading/trailing spaces', () => {
    const result = generateDescription('Notebook', '  Tecnologia  ');
    expect(result).toBe('Notebook para doação. Categoria: Tecnologia');
  });

  it('should handle both name and category with spaces', () => {
    const result = generateDescription('  Ventilador  ', '  Eletrônicos  ');
    expect(result).toBe('Ventilador para doação. Categoria: Eletrônicos');
  });
});
