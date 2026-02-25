'use client';

import { useState } from 'react';
import { ImportItem, WizardAction } from '../lib/wizard-reducer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/format';

interface Category {
  id: string;
  name: string;
}

interface StepReviewItemsProps {
  items: ImportItem[];
  categories: Category[];
  onUpdateItem: (action: WizardAction) => void;
  onExcludeItem: (action: WizardAction) => void;
  onNavigate: (step: string) => void;
}

export function StepReviewItems({
  items,
  categories,
  onUpdateItem,
  onExcludeItem,
  onNavigate,
}: StepReviewItemsProps) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const toggleRowExpanded = (index: number) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleNavigateNext = () => {
    // Validate that all non-excluded items have a category selected
    const missingCategory = items.some(
      (item) => !item.isExcluded && !item.categoryId
    );

    if (missingCategory) {
      toast.error('Por favor, selecione uma categoria para todos os itens');
      return;
    }

    onNavigate('review-photos');
  };

  const validItems = items.filter((item) => !item.isExcluded);
  const invalidItems = items.filter((item) => item.isExcluded && !item.isValid);

  const categoryOptions = categories.map((c) => ({
    ...c,
    matchScore: 0,
  }));

  const fuzzyMatchCategory = (categoryNameRaw: string): Category | null => {
    if (!categoryNameRaw) return null;
    const lower = categoryNameRaw.toLowerCase();
    return (
      categories.find((c) => c.name.toLowerCase().includes(lower)) || null
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Revisar e Editar Itens</h2>
        <p className="text-gray-600 mt-2">
          Revise os dados e faça ajustes necessários. Você pode editar qualquer campo antes de
          prosseguir.
        </p>
      </div>

      {invalidItems.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900">
            <strong>{invalidItems.length} item(s) com erro</strong> - Esses itens foram automaticamente
            excluídos. Corrija os campos obrigatórios ou revise-os manualmente para incluir.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-semibold">
            {validItems.length} item(s) válido(s) - {invalidItems.length} item(s) com erro
          </p>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden ${
                item.isExcluded ? 'bg-gray-50 opacity-60' : 'bg-white'
              }`}
            >
              {/* Row Header */}
              <div
                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                  item.isExcluded ? 'bg-gray-100' : ''
                }`}
                onClick={() => toggleRowExpanded(index)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.isExcluded) {
                        onExcludeItem({ type: 'INCLUDE_ITEM', index });
                      } else {
                        onExcludeItem({ type: 'EXCLUDE_ITEM', index });
                      }
                    }}
                    className="flex-shrink-0"
                  >
                    {item.isExcluded ? (
                      <X className="h-5 w-5 text-red-600" />
                    ) : (
                      <div className="h-5 w-5 rounded border-2 border-green-600 bg-green-100" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.name || '(nome não preenchido)'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.categoryId
                        ? categories.find((c) => c.id === item.categoryId)?.name
                        : 'Categoria não selecionada'}{' '}
                      • {formatCurrency(item.targetAmount)}
                    </p>
                  </div>
                </div>

                {item.validationErrors.length > 0 && (
                  <div className="flex items-center gap-2 ml-4">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  </div>
                )}

                <ChevronDown
                  className={`h-5 w-5 text-gray-400 ml-2 transition-transform ${
                    expandedRows.includes(index) ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {/* Expanded Details */}
              {expandedRows.includes(index) && (
                <div className="border-t p-4 bg-gray-50 space-y-4">
                  {item.validationErrors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-900">
                      <strong>Problemas encontrados:</strong>
                      <ul className="mt-1 space-y-1">
                        {item.validationErrors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold block mb-2">Nome *</label>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          onUpdateItem({
                            type: 'UPDATE_ITEM',
                            index,
                            updates: { name: e.target.value },
                          })
                        }
                        placeholder="Nome do item"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold block mb-2">Valor (R$) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={(item.targetAmount / 100).toFixed(2)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          onUpdateItem({
                            type: 'UPDATE_ITEM',
                            index,
                            updates: { targetAmount: Math.round(value * 100) },
                          });
                        }}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold block mb-2">Categoria *</label>
                      <Select
                        value={item.categoryId || ''}
                        onValueChange={(categoryId) =>
                          onUpdateItem({
                            type: 'UPDATE_ITEM',
                            index,
                            updates: { categoryId },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!item.categoryId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Sugestão: {fuzzyMatchCategory(item.categoryNameRaw)?.name || 'nenhuma categoria encontrada'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-semibold block mb-2">Tipo *</label>
                      <Select
                        value={item.donationType}
                        onValueChange={(value) =>
                          onUpdateItem({
                            type: 'UPDATE_ITEM',
                            index,
                            updates: {
                              donationType: value as 'monetary' | 'physical',
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monetary">Monetário</SelectItem>
                          <SelectItem value="physical">Físico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">Descrição</label>
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        onUpdateItem({
                          type: 'UPDATE_ITEM',
                          index,
                          updates: { description: e.target.value },
                        })
                      }
                      placeholder="Descrição do item (gerada automaticamente)"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={() => onNavigate('upload')}>
          ← Voltar
        </Button>
        <Button onClick={handleNavigateNext}>
          Próximo: Revisar Fotos →
        </Button>
      </div>
    </div>
  );
}
