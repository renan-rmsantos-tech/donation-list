'use client';

import { useState } from 'react';
import Image from 'next/image';
import { adminLogin } from '@/lib/auth/actions';
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
    } catch {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F0EBE3] gap-8 relative">
      <div className="absolute top-5 right-5">
        <ThemeToggle className="w-10 h-10 bg-[#FAF8F5] border-[1.5px] border-[#E8DDD4] rounded-lg" />
      </div>

      <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Colégio São José"
          width={96}
          height={96}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      <div
        className="bg-white border border-[#C5A572] rounded-2xl py-10 px-10 w-[440px]"
        style={{ boxShadow: '#1C141014 0px 4px 32px' }}
      >
        <div className="flex flex-col gap-7">
          <h1 className="font-serif font-bold text-[28px] leading-[34px] text-[#1C1410] text-center">
            Login Administrativo
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-[13px] leading-4 text-[#4A3728] tracking-[0.3px]"
              >
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="h-11 bg-[#FAFAF9] border-[1.5px] border-[#E8DDD4] rounded-lg px-3.5 text-[14px] leading-[18px] text-[#1C1410] placeholder:text-[#C0B0A0] outline-none focus:border-[#B8952E] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[13px] leading-4 text-[#4A3728] tracking-[0.3px]"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 bg-[#FAFAF9] border-[1.5px] border-[#E8DDD4] rounded-lg px-3.5 text-[14px] leading-[18px] text-[#1C1410] placeholder:text-[#C0B0A0] outline-none focus:border-[#B8952E] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 bg-[#1E3D59] rounded-xl text-[#FAF8F5] text-[15px] tracking-[0.3px] leading-[18px] disabled:opacity-60 hover:bg-[#1E3D59]/90 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
