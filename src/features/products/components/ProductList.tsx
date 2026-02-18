'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { deleteProduct } from '../actions';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Product = {
  id: string;
  name: string;
  donationType: 'monetary' | 'physical';
  targetAmount: number | null;
  currentAmount: number;
  isFulfilled: boolean;
  isPublished: boolean;
};

export function ProductList({ products }: { products: Product[] }) {
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const result = await deleteProduct(id);
    if (result.success) {
      setDialogOpen(null);
      toast.success('Produto excluído.');
    } else {
      toast.error('Erro ao excluir produto.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Produtos</h1>
        <Button asChild className="gap-2">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      {products.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Nome</TableHead>
                <TableHead className="px-4">Tipo</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="px-4">{product.name}</TableCell>
                  <TableCell className="px-4">
                    {product.donationType === 'monetary'
                      ? 'Monetária'
                      : 'Física'}
                  </TableCell>
                  <TableCell className="px-4">
                    {product.donationType === 'monetary'
                      ? `${formatCurrency(product.currentAmount)} de ${formatCurrency(product.targetAmount ?? 0)}`
                      : product.isFulfilled
                        ? 'Concluído'
                        : 'Pendente'}
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex gap-2 items-center">
                      <Button variant="link" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          Editar
                        </Link>
                      </Button>
                      <AlertDialog
                        open={dialogOpen === product.id}
                        onOpenChange={(open) =>
                          !open && setDialogOpen(null)
                        }
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDialogOpen(product.id)}
                          >
                            Deletar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o produto &quot;{product.name}&quot;?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum produto cadastrado.</p>
      )}
    </div>
  );
}
