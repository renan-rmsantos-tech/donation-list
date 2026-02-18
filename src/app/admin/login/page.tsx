'use client';

import { useState } from 'react';
import Image from 'next/image';
import { adminLogin } from '@/lib/auth/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await adminLogin({ username, password });
      if (!result.success) {
        toast.error(result.error ?? 'Erro ao fazer login');
      }
      // redirect() é chamado dentro de adminLogin em caso de sucesso
    } catch (err) {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Image
        src="/logo.png"
        alt="Colégio São José"
        width={100}
        height={100}
        priority
      />
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Login Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
