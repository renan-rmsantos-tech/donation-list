'use client';

import { useState } from 'react';
import { ImportItem, WizardAction, PexelsPhoto } from '../lib/wizard-reducer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { searchPexelsPhotos } from '../actions';

interface StepReviewPhotosProps {
  items: ImportItem[];
  onSetPhotoOptions: (action: WizardAction) => void;
  onSelectPhoto: (action: WizardAction) => void;
  onNavigate: (step: string) => void;
}

export function StepReviewPhotos({
  items,
  onSetPhotoOptions,
  onSelectPhoto,
  onNavigate,
}: StepReviewPhotosProps) {
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);
  const [errorItemId, setErrorItemId] = useState<number | null>(null);

  const nonExcludedItems = items.filter((item) => !item.isExcluded);

  const handleSearchPhotos = async (index: number, itemName: string) => {
    setLoadingItemId(index);
    setErrorItemId(null);

    try {
      const result = await searchPexelsPhotos({
        query: itemName,
        perPage: 3,
      });

      if (!result.success) {
        setErrorItemId(index);
        const errorMsg =
          (result.details as any)?.message || 'Erro ao buscar fotos. Tente novamente.';
        toast.error(errorMsg);
        return;
      }

      if (result.data?.photos) {
        onSetPhotoOptions({
          type: 'SET_PHOTO_OPTIONS',
          index,
          photos: result.data.photos,
        });

        if (result.data.photos.length === 0) {
          toast.info('Nenhuma foto encontrada para este item');
        }
      }
    } catch (error) {
      console.error('Error searching photos:', error);
      setErrorItemId(index);
      toast.error('Erro ao buscar fotos');
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleSelectPhoto = (index: number, photoUrl: string) => {
    onSelectPhoto({
      type: 'SELECT_PHOTO',
      index,
      photoUrl,
    });
  };

  const handleSkipPhotos = (index: number) => {
    onSelectPhoto({
      type: 'SELECT_PHOTO',
      index,
      photoUrl: '',
    });
  };

  const handleNavigateNext = () => {
    const unresolved = nonExcludedItems.some(
      (item) => item.selectedPhotoUrl === null
    );

    if (unresolved) {
      toast.error(
        'Por favor, selecione uma foto ou pule para todos os itens'
      );
      return;
    }

    onNavigate('confirm');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Revisar Fotos</h2>
        <p className="text-gray-600 mt-2">
          Revise e aprove as fotos sugeridas para cada item antes de criar os
          produtos.
        </p>
      </div>

      {nonExcludedItems.length === 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            Nenhum item incluído. Volte e inclua pelo menos um item.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {nonExcludedItems.map((item, displayIndex) => {
          const actualIndex = items.indexOf(item);
          const isLoading = loadingItemId === actualIndex;
          const hasError = errorItemId === actualIndex;

          return (
            <Card key={actualIndex} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>

              {!item.photoOptions || item.photoOptions.length === 0 ? (
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center space-y-2">
                        <div className="animate-spin">
                          <ImageIcon className="h-8 w-8 text-blue-500 mx-auto" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Carregando fotos...
                        </p>
                      </div>
                    </div>
                  ) : hasError ? (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-900">
                        Erro ao buscar fotos. Verifique sua conexão ou tente
                        novamente.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-gray-50 border-gray-200">
                      <AlertCircle className="h-4 w-4 text-gray-600" />
                      <AlertDescription className="text-gray-900">
                        Nenhuma foto encontrada
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    {(isLoading || hasError) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearchPhotos(actualIndex, item.name)}
                        disabled={isLoading}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Tentar Novamente
                      </Button>
                    )}

                    {!isLoading && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSkipPhotos(actualIndex)}
                      >
                        Pular Foto
                      </Button>
                    )}

                    {!item.photoOptions || item.photoOptions.length === 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearchPhotos(actualIndex, item.name)}
                        disabled={isLoading}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Buscar Fotos
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {item.selectedPhotoUrl
                      ? '✓ Foto selecionada'
                      : 'Clique em uma foto para selecioná-la'}
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {item.photoOptions.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => handleSelectPhoto(actualIndex, photo.src)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          item.selectedPhotoUrl === photo.src
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="w-full h-full object-cover"
                        />
                        {item.selectedPhotoUrl === photo.src && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="bg-blue-500 text-white rounded-full p-2 flex items-center justify-center">
                              ✓
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center truncate">
                          {photo.photographer}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearchPhotos(actualIndex, item.name)}
                      disabled={isLoading}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Buscar Novamente
                    </Button>

                    {item.selectedPhotoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSkipPhotos(actualIndex)}
                      >
                        Remover Seleção
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={() => onNavigate('review-items')}>
          ← Voltar
        </Button>
        <Button onClick={handleNavigateNext}>
          Próximo: Confirmar e Criar →
        </Button>
      </div>
    </div>
  );
}
