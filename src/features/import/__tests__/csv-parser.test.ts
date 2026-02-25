import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseImportCsv } from '../lib/csv-parser';

// Mock PapaParse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn((csv: string, options: any) => {
      // Simple CSV parser implementation for testing
      const lines = csv.trim().split('\n');
      if (lines.length === 0) {
        return { data: [], errors: [] };
      }

      const headers = lines[0].split(',').map((h) => h.trim());
      const data = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      return { data, errors: [] };
    }),
  },
}));

describe('parseImportCsv', () => {
  it('should parse valid CSV with all fields', () => {
    const csv = `nome,categoria,valor,tipo
Impressora,Eletrônicos,150.00,monetario
Mesa,Móveis,200.50,fisico`;

    const result = parseImportCsv(csv);

    expect(result.items).toHaveLength(2);
    expect(result.items[0].name).toBe('Impressora');
    expect(result.items[0].categoryNameRaw).toBe('Eletrônicos');
    expect(result.items[0].targetAmount).toBe(15000); // 150.00 * 100
    expect(result.items[0].donationType).toBe('monetary');
    expect(result.items[0].isValid).toBe(true);
    expect(result.items[0].isExcluded).toBe(false);

    expect(result.items[1].name).toBe('Mesa');
    expect(result.items[1].donationType).toBe('physical');
    expect(result.items[1].targetAmount).toBe(20050); // 200.50 * 100
  });

  it('should mark row invalid if nome is missing', () => {
    const csv = `nome,categoria,valor,tipo
,Eletrônicos,150.00,monetario`;

    const result = parseImportCsv(csv);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].isValid).toBe(false);
    expect(result.items[0].validationErrors).toContain('Nome é obrigatório');
    expect(result.items[0].isExcluded).toBe(true);
  });

  it('should mark row invalid if categoria is missing', () => {
    const csv = `nome,categoria,valor,tipo
Impressora,,150.00,monetario`;

    const result = parseImportCsv(csv);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].isValid).toBe(false);
    expect(result.items[0].validationErrors).toContain('Categoria é obrigatória');
  });

  it('should mark row invalid if valor is missing', () => {
    const csv = `nome,categoria,valor,tipo
Impressora,Eletrônicos,,monetario`;

    const result = parseImportCsv(csv);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].isValid).toBe(false);
    expect(result.items[0].validationErrors).toContain('Valor é obrigatório');
  });

  it('should mark row invalid if valor is not a positive number', () => {
    const csv = `nome,categoria,valor,tipo
Impressora,Eletrônicos,-150.00,monetario`;

    const result = parseImportCsv(csv);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].isValid).toBe(false);
    expect(result.items[0].validationErrors).toContain('Valor deve ser um número positivo');
  });

  it('should mark row invalid if valor is not a number', () => {
    const csv = `nome,categoria,valor,tipo
Impressora,Eletrônicos,abc,monetario`;

    const result = parseImportCsv(csv);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].isValid).toBe(false);
    expect(result.items[0].validationErrors).toContain('Valor deve ser um número positivo');
  });

  it('should default donationType to monetary if tipo is missing', () => {
    const csv = `nome,categoria,valor,tipo
Impressora,Eletrônicos,150.00,`;

    const result = parseImportCsv(csv);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].donationType).toBe('monetary');
  });

  it('should accept "fisico" as physical donation type', () => {
    const csv = `nome,categoria,valor,tipo
Mesa,Móveis,200.00,fisico`;

    const result = parseImportCsv(csv);

    expect(result.items[0].donationType).toBe('physical');
  });

  it('should accept "physical" as physical donation type', () => {
    const csv = `nome,categoria,valor,tipo
Mesa,Móveis,200.00,physical`;

    const result = parseImportCsv(csv);

    expect(result.items[0].donationType).toBe('physical');
  });

  it('should handle name exceeding 200 characters', () => {
    const longName = 'a'.repeat(201);
    const csv = `nome,categoria,valor,tipo
${longName},Eletrônicos,150.00,monetario`;

    const result = parseImportCsv(csv);

    expect(result.items[0].isValid).toBe(false);
    expect(result.items[0].validationErrors).toContain('Nome deve ter no máximo 200 caracteres');
  });

  it('should convert currency to cents correctly', () => {
    const csv = `nome,categoria,valor,tipo
Impressora,Eletrônicos,150.50,monetario`;

    const result = parseImportCsv(csv);

    expect(result.items[0].targetAmount).toBe(15050);
  });

  it('should handle empty CSV', () => {
    const csv = '';
    const result = parseImportCsv(csv);
    expect(result.items).toHaveLength(0);
  });

  it('should generate description from template', () => {
    const csv = `nome,categoria,valor,tipo
Impressora,Eletrônicos,150.00,monetario`;

    const result = parseImportCsv(csv);

    expect(result.items[0].description).toBe('Impressora para doação. Categoria: Eletrônicos');
  });

  it('should handle whitespace trimming', () => {
    const csv = `nome,categoria,valor,tipo
  Impressora  ,  Eletrônicos  ,150.00,monetario`;

    const result = parseImportCsv(csv);

    expect(result.items[0].name).toBe('Impressora');
    expect(result.items[0].categoryNameRaw).toBe('Eletrônicos');
    expect(result.items[0].isValid).toBe(true);
  });
});
