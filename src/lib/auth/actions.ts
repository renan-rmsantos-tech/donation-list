'use server';

import { redirect } from 'next/navigation';
import { getSession } from './session';

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function adminLogin(
  input: { username: string; password: string }
): Promise<ActionResult> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return {
      success: false,
      error: 'Credenciais do admin não configuradas. Verifique as variáveis de ambiente.',
    };
  }

  if (
    input.username === username &&
    input.password === password
  ) {
    const session = await getSession();
    session.isAdmin = true;
    session.username = input.username;
    await session.save();
    redirect('/admin/dashboard');
  }

  return {
    success: false,
    error: 'Usuário ou senha inválidos.',
  };
}

export async function adminLogout(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect('/admin/login');
}
