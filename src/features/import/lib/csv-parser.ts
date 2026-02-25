import Papa from 'papaparse';
import { ImportItem } from './wizard-reducer';
import { generateDescription } from './description-template';

interface CsvRow {
  [key: string]: string | undefined;
}

interface ParseCsvResult {
  items: ImportItem[];
}

export function parseImportCsv(csvText: string): ParseCsvResult {
  const result = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors && result.errors.length > 0) {
    console.error('CSV parse errors:', result.errors);
    return { items: [] };
  }

  const items: ImportItem[] = (result.data || []).map((row, index) => {
    const validationErrors: string[] = [];

    // Validate name
    const name = row.nome?.trim() || '';
    if (!name || name.length === 0) {
      validationErrors.push('Nome é obrigatório');
    } else if (name.length > 200) {
      validationErrors.push('Nome deve ter no máximo 200 caracteres');
    }

    // Validate category name
    const categoryNameRaw = row.categoria?.trim() || '';
    if (!categoryNameRaw || categoryNameRaw.length === 0) {
      validationErrors.push('Categoria é obrigatória');
    }

    // Validate target amount
    const targetAmountStr = row.valor?.trim() || '';
    let targetAmount = 0;
    if (!targetAmountStr || targetAmountStr.length === 0) {
      validationErrors.push('Valor é obrigatório');
    } else {
      const parsed = parseFloat(targetAmountStr);
      if (isNaN(parsed) || parsed <= 0) {
        validationErrors.push('Valor deve ser um número positivo');
      } else {
        targetAmount = Math.round(parsed * 100); // Convert to cents
      }
    }

    // Validate and parse donation type
    let donationType: 'monetary' | 'physical' = 'monetary';
    const tipoRaw = row.tipo?.trim().toLowerCase() || '';
    if (tipoRaw && tipoRaw !== 'monetario' && tipoRaw !== 'fisico' && tipoRaw !== 'monetary' && tipoRaw !== 'physical') {
      validationErrors.push('Tipo deve ser "monetário" ou "físico"');
    }
    if (tipoRaw === 'fisico' || tipoRaw === 'physical') {
      donationType = 'physical';
    }

    // Generate description from template
    const description = generateDescription(name, categoryNameRaw);

    const isValid = validationErrors.length === 0;

    return {
      rowIndex: index,
      name,
      categoryId: null,
      categoryNameRaw,
      targetAmount,
      donationType,
      description,
      photoOptions: [],
      selectedPhotoUrl: null,
      isValid,
      validationErrors,
      isExcluded: !isValid, // Auto-exclude invalid items
    };
  });

  return { items };
}
