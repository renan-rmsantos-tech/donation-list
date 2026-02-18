'use client';

import { useState, useRef } from 'react';
import { createMonetaryDonation, uploadFile } from '../actions';
import { formatCurrency } from '@/lib/utils/format';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

type MonetaryDonationFormProps = {
  productId: string;
  targetAmount: number;
  currentAmount: number;
  qrCodeImageUrl: string | null;
  copiaEColaCode: string | null;
};

export function MonetaryDonationForm({
  productId,
  targetAmount,
  currentAmount,
  qrCodeImageUrl,
  copiaEColaCode,
}: MonetaryDonationFormProps) {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPath, setReceiptPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = Math.max(0, targetAmount - currentAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalReceiptPath = receiptPath;

      if (receiptFile && !receiptPath) {
        const formData = new FormData();
        formData.set('bucket', 'receipts');
        formData.set('file', receiptFile);

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
              ? `Falha ao enviar comprovante: ${detail}`
              : 'Falha ao enviar comprovante. Tente novamente.'
          );
          setLoading(false);
          return;
        }

        finalReceiptPath = uploadResult.data.path;
      }

      if (!finalReceiptPath) {
        toast.error('Por favor, envie o comprovante de pagamento PIX.');
        setLoading(false);
        return;
      }

      const amountCents = Math.round(parseFloat(amount) * 100);
      if (amountCents < 100) {
        toast.error('Doação mínima é R$ 1,00.');
        setLoading(false);
        return;
      }

      const result = await createMonetaryDonation({
        productId,
        amount: amountCents,
        donorName: donorName.trim() || undefined,
        receiptPath: finalReceiptPath,
      });

      if (result.success) {
        toast.success('Obrigado! Sua doação foi registrada com sucesso.');
        setAmount('');
        setDonorName('');
        setReceiptFile(null);
        setReceiptPath(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(
          result.error === 'VALIDATION_ERROR'
            ? 'Verifique os campos. Valor deve ser pelo menos R$ 1,00 e comprovante é obrigatório.'
            : result.error === 'ALREADY_FUNDED'
              ? 'Esta campanha já atingiu a meta.'
              : result.error === 'INVALID_DONATION_TYPE'
                ? 'Este produto não aceita doações monetárias.'
                : result.error === 'PRODUCT_NOT_FOUND'
                  ? 'Produto não encontrado.'
                  : 'Ocorreu um erro. Tente novamente.'
        );
      }
    } catch {
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const hasPixSettings = qrCodeImageUrl || copiaEColaCode;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <h2 className="text-xl font-semibold">Faça uma Doação Monetária</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o valor que deseja contribuir e complete a transferência via
          PIX. Envie o comprovante de pagamento para confirmar sua doação.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasPixSettings && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200">
            <AlertDescription>
              Os dados de pagamento PIX ainda não foram configurados. Entre em
              contato com o administrador.
            </AlertDescription>
          </Alert>
        )}

        {hasPixSettings && (
          <Card className="bg-background">
            <CardHeader className="pb-2">
              <h3 className="font-medium">Dados de Pagamento PIX</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCodeImageUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    QR Code:
                  </p>
                  <img
                    src={qrCodeImageUrl}
                    alt="PIX QR Code"
                    className="max-w-[200px] h-auto border rounded"
                  />
                </div>
              )}
              {copiaEColaCode && (
                <div className="space-y-2">
                  <Label>Código PIX Copia e Cola:</Label>
                  <Textarea
                    readOnly
                    value={copiaEColaCode}
                    className="font-mono bg-muted"
                    rows={3}
                    onClick={(e) =>
                      (e.target as HTMLTextAreaElement).select()
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {hasPixSettings && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor da Doação (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Restante: ${formatCurrency(remaining)}`}
                required
              />
              <p className="text-xs text-muted-foreground">
                Mínimo R$ 1,00. Restante para atingir a meta:{' '}
                {formatCurrency(remaining)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donorName">Seu Nome (opcional)</Label>
              <Input
                id="donorName"
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Deixe em branco para doar anonimamente"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Comprovante de Pagamento *</Label>
              <Input
                ref={fileInputRef}
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setReceiptFile(file ?? null);
                  setReceiptPath(null);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Envie uma captura de tela ou foto do comprovante da transferência
                PIX.
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Enviando...' : 'Enviar Doação'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
