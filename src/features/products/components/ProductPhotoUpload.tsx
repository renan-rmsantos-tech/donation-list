'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/constants';

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
        <Label htmlFor="productPhoto">Foto do Produto (opcional)</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          A foto pode ser adicionada depois. Se não enviar, será exibida uma imagem padrão.
        </p>
        <div className="mt-2 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Tamanho mínimo: 800x800 pixels. Máximo: 5MB.
          </p>
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
        <div className="w-48 h-48 rounded-lg border border-dashed border-muted-foreground/50 overflow-hidden">
          <Image
            src={PRODUCT_PLACEHOLDER_IMAGE}
            alt="Imagem padrão"
            width={192}
            height={192}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
