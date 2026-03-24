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
    <div className="flex flex-col gap-7">
      <h1 className="font-serif font-bold text-[36px] leading-[44px] text-[#1E3D59]">
        Categorias
      </h1>

      <form onSubmit={handleCreate} className="flex gap-3 items-center">
        <input
          type="text"
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          placeholder="Nome da nova categoria"
          maxLength={100}
          className="flex-1 h-11 bg-white border-[1.5px] border-[#E8DDD4] rounded-lg px-4 text-[14px] leading-[18px] text-[#1C1410] placeholder:text-[#C0B0A0] outline-none focus:border-[#B8952E] transition-colors"
        />
        <button
          type="submit"
          disabled={!createName.trim()}
          className={`h-11 px-5 rounded-[10px] text-[14px] leading-[18px] transition-colors ${
            createName.trim()
              ? 'bg-[#1E3D59] text-[#FAF8F5] hover:bg-[#1E3D59]/90'
              : 'bg-[#C9D4DC] text-[#9B7B5A] cursor-not-allowed'
          }`}
        >
          Nova Categoria
        </button>
      </form>

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="w-[280px] bg-white border border-[#C5A572] rounded-xl flex flex-col gap-3 pt-5 px-5 pb-4 flex-shrink-0"
            >
              {editingId === category.id ? (
                <form onSubmit={handleSaveEdit} className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={100}
                    autoFocus
                    className="h-9 bg-[#FAFAF9] border-[1.5px] border-[#E8DDD4] rounded-lg px-3 text-[14px] text-[#1C1410] outline-none focus:border-[#B8952E] transition-colors"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="h-8 px-3 bg-[#1E3D59] rounded-lg text-[#FAF8F5] text-[12px]"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="h-8 px-3 border border-[#E8DDD4] rounded-lg text-[#4A3728] text-[12px]"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="text-[16px] leading-5 text-[#1C1410]">
                    {category.name}
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="text-[13px] leading-4 text-[#4A3728] hover:text-[#1C1410] transition-colors"
                      onClick={() => handleStartEdit(category)}
                    >
                      Editar
                    </button>
                    <AlertDialog
                      open={deleteDialogId === category.id}
                      onOpenChange={(open) => !open && setDeleteDialogId(null)}
                    >
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="text-[13px] leading-4 text-[#C0392B] hover:text-[#a93226] transition-colors"
                          onClick={() => setDeleteDialogId(category.id)}
                        >
                          Deletar
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a categoria &quot;{category.name}&quot;?
                            Esta ação não pode ser desfeita.
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
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#9B7B5A] text-[14px]">Nenhuma categoria cadastrada.</p>
      )}
    </div>
  );
}
