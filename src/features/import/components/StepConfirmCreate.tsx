'use client';

import { useState } from 'react';
import { ImportItem, ImportResult, WizardAction } from '../lib/wizard-reducer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { bulkCreateProducts } from '../actions';
import { formatCurrency } from '@/lib/utils/format';

interface StepConfirmCreateProps {
  items: ImportItem[];
  results: ImportResult[];
  isProcessing: boolean;
  processingIndex: number;
  onSetProcessing: (action: WizardAction) => void;
  onAddResult: (action: WizardAction) => void;
  onNavigate: (step: string) => void;
}

export function StepConfirmCreate({
  items,
  results,
  isProcessing,
  processingIndex,
  onSetProcessing,
  onAddResult,
  onNavigate,
}: StepConfirmCreateProps) {
  const [showResults, setShowResults] = useState(false);
  const nonExcludedItems = items.filter((item) => !item.isExcluded);

  const categoryBreakdown = nonExcludedItems.reduce(
    (acc, item) => {
      const categoryName = item.categoryId ? `Category ${item.categoryId}` : 'Unknown';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const typeBreakdown = nonExcludedItems.reduce(
    (acc, item) => {
      const type = item.donationType === 'monetary' ? 'Monetário' : 'Físico';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleCreateProducts = async () => {
    const itemsToCreate = nonExcludedItems.map((item) => ({
      name: item.name,
      description: item.description,
      donationType: item.donationType,
      targetAmount: item.targetAmount,
      categoryId: item.categoryId!,
      photoUrl: item.selectedPhotoUrl || '',
      isPublished: true,
    }));

    onSetProcessing({
      type: 'SET_PROCESSING',
      isProcessing: true,
      index: 0,
    });

    setShowResults(true);

    try {
      const result = await bulkCreateProducts({ items: itemsToCreate });

      if (!result.success) {
        toast.error('Erro ao criar produtos');
        onSetProcessing({
          type: 'SET_PROCESSING',
          isProcessing: false,
        });
        return;
      }

      if (result.data?.results) {
        result.data.results.forEach((resultItem) => {
          onAddResult({
            type: 'ADD_RESULT',
            result: resultItem,
          });
        });

        const successCount = result.data.results.filter((r) => r.success).length;
        const failedCount = result.data.results.filter((r) => !r.success).length;

        toast.success(
          `${successCount} produto(s) criado(s)${
            failedCount > 0 ? `, ${failedCount} falhou(aram)` : ''
          }`
        );

        onSetProcessing({
          type: 'SET_PROCESSING',
          isProcessing: false,
        });

        setTimeout(() => {
          onNavigate('summary');
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating products:', error);
      toast.error('Erro ao criar produtos. Tente novamente.');
      onSetProcessing({
        type: 'SET_PROCESSING',
        isProcessing: false,
      });
    }
  };

  const successCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;
  const totalCount = results.length;
  const progressPercent =
    totalCount > 0 ? (successCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Confirmar e Criar Produtos</h2>
        <p className="text-gray-600 mt-2">
          Revise o resumo dos itens a serem criados e confirme a operação.
        </p>
      </div>

      {!showResults && (
        <>
          <Card className="p-6 space-y-4 border-blue-200 bg-blue-50">
            <h3 className="font-semibold text-lg">Resumo da Importação</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {nonExcludedItems.length}
                </p>
                <p className="text-sm text-gray-600">Total de Itens</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {Object.keys(categoryBreakdown).length}
                </p>
                <p className="text-sm text-gray-600">Categorias</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {nonExcludedItems.reduce((sum, item) => sum + item.targetAmount, 0) / 100}
                </p>
                <p className="text-sm text-gray-600">Valor Total (R$)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm mb-2">Tipo de Doação</p>
                <ul className="text-sm space-y-1">
                  {Object.entries(typeBreakdown).map(([type, count]) => (
                    <li key={type}>
                      {type}: <span className="font-semibold">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Categorias</p>
                <ul className="text-sm space-y-1">
                  {Object.entries(categoryBreakdown).map(([category, count]) => (
                    <li key={category}>
                      {category}: <span className="font-semibold">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              Ao confirmar, os produtos serão criados e as fotos serão
              processadas. Esta operação pode levar alguns minutos.
            </AlertDescription>
          </Alert>
        </>
      )}

      {showResults && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                Progresso: {successCount + failedCount} de {nonExcludedItems.length}
              </p>
              <span className="text-sm text-gray-600">
                {((successCount + failedCount) / nonExcludedItems.length * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={((successCount + failedCount) / nonExcludedItems.length) * 100} />
          </div>

          <div className="space-y-2">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{result.name}</p>
                  {result.success ? (
                    <p className="text-xs text-green-700">
                      ✓ Produto criado com sucesso
                    </p>
                  ) : (
                    <p className="text-xs text-red-700">
                      ✗ {result.error || 'Erro desconhecido'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showResults && (
        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => onNavigate('review-photos')}
            disabled={isProcessing}
          >
            ← Voltar
          </Button>
          <Button onClick={handleCreateProducts} disabled={isProcessing}>
            {isProcessing ? 'Criando Produtos...' : 'Criar Produtos'}
          </Button>
        </div>
      )}
    </div>
  );
}
