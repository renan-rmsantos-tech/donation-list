'use client';

import { useState, useRef } from 'react';
import { updatePixSettings } from '../actions';
import { uploadFile } from '@/features/donations/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type PixSettingsFormProps = {
  copiaEColaCode: string | null;
  qrCodeImagePath: string | null;
  qrCodeImageUrl: string | null;
};

export function PixSettingsForm({
  copiaEColaCode,
  qrCodeImagePath,
  qrCodeImageUrl,
}: PixSettingsFormProps) {
  const [copiaECola, setCopiaECola] = useState(copiaEColaCode ?? '');
  const [qrPath, setQrPath] = useState(qrCodeImagePath ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalQrPath = qrPath;

      if (file) {
        const formData = new FormData();
        formData.set('bucket', 'pix-qr');
        formData.set('file', file);

        const uploadResult = await uploadFile(formData);

        if (!uploadResult.success || !uploadResult.data) {
          const detail =
            uploadResult.details &&
            typeof uploadResult.details === 'object' &&
            'message' in uploadResult.details
              ? String(uploadResult.details.message)
              : null;
          toast.error(
            detail
              ? `Erro ao enviar imagem: ${detail}`
              : 'Erro ao enviar imagem. Tente novamente.'
          );
          setLoading(false);
          return;
        }

        finalQrPath = uploadResult.data.path;
      }

      const result = await updatePixSettings({
        copiaEColaCode: copiaECola.trim() || undefined,
        qrCodeImagePath: finalQrPath || undefined,
      });

      if (result.success) {
        toast.success('Configurações salvas com sucesso.');
        setQrPath(finalQrPath);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(
          result.error === 'VALIDATION_ERROR'
            ? 'Verifique os dados.'
            : 'Erro ao salvar. Tente novamente.'
        );
      }
    } catch {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const qrPreviewUrl = file ? URL.createObjectURL(file) : qrCodeImageUrl;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Configurações PIX</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="copiaECola">Código PIX Copia e Cola</Label>
          <Textarea
            id="copiaECola"
            name="copiaEColaCode"
            value={copiaECola}
            onChange={(e) => setCopiaECola(e.target.value)}
            rows={4}
            placeholder="Cole aqui o código PIX copia e cola"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qrCode">Imagem QR Code PIX</Label>
          <Input
            ref={fileInputRef}
            id="qrCode"
            type="file"
            name="qrCode"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {qrPreviewUrl && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Preview do QR Code:
              </p>
              <img
                src={qrPreviewUrl}
                alt="QR Code PIX"
                className="max-w-[250px] h-auto border rounded"
              />
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </form>
    </div>
  );
}
