'use client';

import { useState } from 'react';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

type Category = {
  id: string;
  name: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export function CategoryManager({
  categories,
}: {
  categories: Category[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [createName, setCreateName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createCategory({ name: createName.trim() });
    if (result.success) {
      setCreateName('');
      toast.success('Categoria criada com sucesso.');
    } else {
      toast.error(
        result.error === 'DUPLICATE_NAME'
          ? 'Já existe uma categoria com este nome.'
          : result.error === 'VALIDATION_ERROR'
            ? 'Nome inválido.'
            : 'Erro ao criar categoria.'
      );
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const result = await updateCategory(editingId, { name: editName.trim() });
    if (result.success) {
      setEditingId(null);
      setEditName('');
      toast.success('Categoria atualizada.');
    } else {
      toast.error(
        result.error === 'DUPLICATE_NAME'
          ? 'Já existe uma categoria com este nome.'
          : 'Erro ao atualizar.'
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleConfirmDelete = async (id: string) => {
    const result = await deleteCategory(id);
    if (result.success) {
      setDeleteDialogId(null);
      toast.success('Categoria excluída.');
    } else {
      toast.error('Erro ao excluir categoria.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Categorias</h1>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          type="text"
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          placeholder="Nome da nova categoria"
          className="flex-1"
          maxLength={100}
        />
        <Button type="submit" disabled={!createName.trim()}>
          Nova Categoria
        </Button>
      </form>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="p-4">
                {editingId === category.id ? (
                  <form onSubmit={handleSaveEdit} className="flex flex-col gap-2">
                    <Input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={100}
                      autoFocus
                      className="h-8"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">
                        Salvar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold">{category.name}</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => handleStartEdit(category)}
                      >
                        Editar
                      </Button>
                      <AlertDialog
                        open={deleteDialogId === category.id}
                        onOpenChange={(open) =>
                          !open && setDeleteDialogId(null)
                        }
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeleteDialogId(category.id)}
                          >
                            Deletar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirmar exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a categoria
                              &quot;{category.name}&quot;? Esta ação não pode
                              ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleConfirmDelete(category.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhuma categoria cadastrada.</p>
      )}
    </div>
  );
}
