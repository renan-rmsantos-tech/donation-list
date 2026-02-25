'use client';

import { useRef } from 'react';
import { parseImportCsv } from '../lib/csv-parser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ImportItem, WizardAction } from '../lib/wizard-reducer';

interface StepUploadCsvProps {
  onItemsParsed: (action: WizardAction) => void;
  onNavigate: (step: string) => void;
}

const CSV_TEMPLATE = `nome,categoria,valor,tipo
Impressora,Tecnologia,500.00,monetario
Cadeiras,Móveis,150.00,monetario
Livros,Educação,75.50,fisico`;

export function StepUploadCsv({ onItemsParsed, onNavigate }: StepUploadCsvProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV válido');
      return;
    }

    try {
      const text = await file.text();
      const result = parseImportCsv(text);

      if (result.items.length === 0) {
        toast.error('Nenhum item válido encontrado no arquivo. Verifique o formato.');
        return;
      }

      onItemsParsed({ type: 'SET_ITEMS', items: result.items });
      onNavigate('review-items');
      toast.success(`${result.items.length} itens carregados com sucesso`);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Erro ao ler arquivo CSV. Verifique o formato.');
    }

    // Reset input for next upload
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(CSV_TEMPLATE));
    element.setAttribute('download', 'import-template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Importar Itens de Doação</h2>
        <p className="text-gray-600 mt-2">
          Faça upload de um arquivo CSV para criar múltiplos itens de doação rapidamente
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Dica:</strong> Comece baixando o modelo de template abaixo para entender o formato esperado.
        </AlertDescription>
      </Alert>

      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold mb-3">Campos Obrigatórios</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li>• <strong>nome</strong> - Nome do item (até 200 caracteres)</li>
            <li>• <strong>categoria</strong> - Categoria existente no sistema</li>
            <li>• <strong>valor</strong> - Valor alvo em BRL (ex: 150.00)</li>
            <li>• <strong>tipo</strong> - "monetario" ou "fisico" (padrão: monetario)</li>
          </ul>
        </div>

        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Template CSV
        </Button>
      </Card>

      <Card className="p-6 space-y-4 border-2 border-dashed">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="text-4xl">📄</div>
          <p className="font-semibold text-gray-700">Selecione um arquivo CSV</p>
          <p className="text-sm text-gray-500">Clique abaixo para escolher seu arquivo</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-12 text-base"
        >
          Selecionar Arquivo
        </Button>
      </Card>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Exemplo de CSV Válido
        </h3>
        <pre className="text-xs bg-white p-3 rounded overflow-x-auto border">
          {CSV_TEMPLATE}
        </pre>
      </div>
    </div>
  );
}
