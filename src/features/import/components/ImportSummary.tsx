'use client';

import { ImportResult, WizardAction } from '../lib/wizard-reducer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ImportSummaryProps {
  results: ImportResult[];
  onReset: (action: WizardAction) => void;
  onNavigate: (step: string) => void;
}

export function ImportSummary({
  results,
  onReset,
  onNavigate,
}: ImportSummaryProps) {
  const successResults = results.filter((r) => r.success);
  const failedResults = results.filter((r) => !r.success);

  const handleNewImport = () => {
    onReset({ type: 'RESET' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resumo da Importação</h2>
        <p className="text-gray-600 mt-2">
          Veja os resultados da importação e acesse os produtos criados.
        </p>
      </div>

      {results.length === 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-900">
            Nenhum resultado disponível. Volte e tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 border-green-200 bg-green-50">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">
                  {successResults.length}
                </p>
                <p className="text-gray-600 mt-2">Produtos Criados</p>
              </div>
            </Card>

            <Card className="p-6 border-red-200 bg-red-50">
              <div className="text-center">
                <p className="text-4xl font-bold text-red-600">
                  {failedResults.length}
                </p>
                <p className="text-gray-600 mt-2">Produtos Falhados</p>
              </div>
            </Card>
          </div>

          {successResults.length > 0 && (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Produtos Criados com Sucesso
              </h3>

              <div className="space-y-2">
                {successResults.map((result) => (
                  <div
                    key={result.productId}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <p className="font-semibold text-sm">{result.name}</p>
                      <p className="text-xs text-gray-600">ID: {result.productId}</p>
                    </div>
                    <Link
                      href={`/admin/products/${result.productId}/edit`}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold text-blue-600 hover:text-blue-700 rounded transition-colors"
                    >
                      Editar
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {failedResults.length > 0 && (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Produtos com Falha
              </h3>

              <div className="space-y-2">
                {failedResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <p className="font-semibold text-sm">{result.name}</p>
                    <p className="text-xs text-red-700 mt-1">
                      Erro: {result.error || 'Erro desconhecido'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <div className="flex gap-3 justify-end pt-4">
        <Link href="/admin/products">
          <Button variant="outline">Voltar para Produtos</Button>
        </Link>
        <Button onClick={handleNewImport}>
          Nova Importação →
        </Button>
      </div>
    </div>
  );
}
