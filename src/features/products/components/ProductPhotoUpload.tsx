'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

interface ProductPhotoUploadProps {
  currentImageUrl: string | null;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function ProductPhotoUpload({
  currentImageUrl,
  onFileSelect,
  selectedFile,
}: ProductPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const previewUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : currentImageUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Apenas imagens JPEG e PNG são aceitas');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande. Máximo 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    onFileSelect(file);
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="productPhoto">Foto do Produto</Label>
        <div className="mt-2 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-4">
            Dicas para uma foto de qualidade:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 mb-4">
            <li>• Use boa iluminação</li>
            <li>• Formato quadrado recomendado</li>
            <li>• Tamanho mínimo recomendado: 800x800 pixels</li>
            <li>• Máximo: 5MB</li>
          </ul>
        </div>
      </div>

      <div>
        <Input
          ref={fileInputRef}
          id="productPhoto"
          type="file"
          name="productPhoto"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
      </div>

      {previewUrl && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Preview:</p>
          <div className="w-48 h-48 rounded-lg overflow-hidden border">
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
          >
            Remover Foto
          </Button>
        </div>
      )}

      {!previewUrl && (
        <div className="w-48 h-48 rounded-lg border border-dashed border-muted-foreground/50">
          <PlaceholderImage className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
