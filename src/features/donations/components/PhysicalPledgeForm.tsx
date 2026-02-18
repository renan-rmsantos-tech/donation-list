'use client';

import { useState } from 'react';
import { createPhysicalPledge } from '../actions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type PhysicalPledgeFormProps = {
  productId: string;
};

export function PhysicalPledgeForm({ productId }: PhysicalPledgeFormProps) {
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createPhysicalPledge({
        productId,
        donorName: donorName.trim(),
        donorPhone: donorPhone.trim(),
        donorEmail: donorEmail.trim() || undefined,
      });

      if (result.success) {
        toast.success(
          'Obrigado! Seu compromisso foi registrado. Entraremos em contato em breve para coordenar.'
        );
        setDonorName('');
        setDonorPhone('');
        setDonorEmail('');
      } else {
        toast.error(
          result.error === 'VALIDATION_ERROR'
            ? 'Verifique os campos. Nome e telefone são obrigatórios. Telefone deve ser um número brasileiro válido (10-11 dígitos).'
            : result.error === 'ALREADY_FULFILLED'
              ? 'Este item já foi atendido.'
              : result.error === 'INVALID_DONATION_TYPE'
                ? 'Este produto não aceita doações físicas.'
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

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <h2 className="text-xl font-semibold">Oferecer Este Item</h2>
        <p className="text-sm text-muted-foreground">
          Preencha seus dados de contato para registrar seu compromisso de doar
          este item. Entraremos em contato para coordenar a entrega.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="donorName">Seu Nome *</Label>
            <Input
              id="donorName"
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Nome completo"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donorPhone">Telefone *</Label>
            <Input
              id="donorPhone"
              type="tel"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              placeholder="Ex: (11) 98765-4321 ou +55 11 98765-4321"
              required
            />
            <p className="text-xs text-muted-foreground">
              Formato brasileiro: 10-11 dígitos com código do país +55 opcional
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="donorEmail">E-mail (opcional)</Label>
            <Input
              id="donorEmail"
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Enviando...' : 'Enviar Compromisso'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
