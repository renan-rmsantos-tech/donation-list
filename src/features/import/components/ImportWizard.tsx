'use client';

import { useReducer } from 'react';
import {
  wizardReducer,
  initialWizardState,
  WizardAction,
  ImportItem,
} from '../lib/wizard-reducer';
import { StepUploadCsv } from './StepUploadCsv';
import { StepReviewItems } from './StepReviewItems';
import { StepReviewPhotos } from './StepReviewPhotos';
import { StepConfirmCreate } from './StepConfirmCreate';
import { ImportSummary } from './ImportSummary';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ImportWizardProps {
  categories: Array<{
    id: string;
    name: string;
  }>;
}

const STEPS = [
  { id: 'upload', label: 'Upload CSV', number: 1 },
  { id: 'review-items', label: 'Revisar Itens', number: 2 },
  { id: 'review-photos', label: 'Revisar Fotos', number: 3 },
  { id: 'confirm', label: 'Confirmar', number: 4 },
  { id: 'summary', label: 'Resumo', number: 5 },
] as const;

export function ImportWizard({ categories }: ImportWizardProps) {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);

  const handleNavigate = (stepId: string) => {
    dispatch({ type: 'GO_TO_STEP', step: stepId as any });
  };

  const currentStepNumber = STEPS.find((s) => s.id === state.step)?.number || 1;
  const progressPercent = (currentStepNumber / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Importação em Lote</h1>
          <span className="text-sm font-semibold text-gray-600">
            Passo {currentStepNumber} de {STEPS.length}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-2">
        {STEPS.map((step) => {
          const isActive = state.step === step.id;
          const isCompleted =
            STEPS.findIndex((s) => s.id === state.step) > step.number - 1;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-900 border-2 border-blue-500'
                  : isCompleted
                  ? 'bg-green-100 text-green-900 border-2 border-green-500'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-400 text-white'
                }`}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <div className="text-xs font-semibold hidden sm:block">{step.label}</div>
            </div>
          );
        })}
      </div>

      {/* Content Area */}
      <Card className="p-8">
        {state.step === 'upload' && (
          <StepUploadCsv
            onItemsParsed={(action) => dispatch(action)}
            onNavigate={handleNavigate}
          />
        )}

        {state.step === 'review-items' && (
          <StepReviewItems
            items={state.items}
            categories={categories}
            onUpdateItem={(action) => dispatch(action)}
            onExcludeItem={(action) => dispatch(action)}
            onNavigate={handleNavigate}
          />
        )}

        {state.step === 'review-photos' && (
          <StepReviewPhotos
            items={state.items}
            onSetPhotoOptions={(action) => dispatch(action)}
            onSelectPhoto={(action) => dispatch(action)}
            onNavigate={handleNavigate}
          />
        )}

        {state.step === 'confirm' && (
          <StepConfirmCreate
            items={state.items}
            results={state.results}
            isProcessing={state.isProcessing}
            processingIndex={state.processingIndex}
            onSetProcessing={(action) => dispatch(action)}
            onAddResult={(action) => dispatch(action)}
            onNavigate={handleNavigate}
          />
        )}

        {state.step === 'summary' && (
          <ImportSummary
            results={state.results}
            onReset={(action) => dispatch(action)}
            onNavigate={handleNavigate}
          />
        )}
      </Card>
    </div>
  );
}
