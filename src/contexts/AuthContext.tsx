import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authDb, setActiveUser, clearActiveUser, getActiveUserId, type AuthUser } from '@/lib/db';

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, pin: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, pin: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

function normalizeUsername(u: string) {
  return u.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const id = getActiveUserId();
      if (id) {
        const u = await authDb.users.get(id);
        if (u) {
          setActiveUser(u.id!);
          setUser(u);
        } else {
          clearActiveUser();
        }
      }
      setLoading(false);
    })();
  }, []);

  const login: AuthCtx['login'] = async (username, pin) => {
    const uname = normalizeUsername(username);
    if (!uname) return { ok: false, error: 'Informe o usuário' };
    if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'A senha deve ter 4 números' };
    const found = await authDb.users.where('username').equals(uname).first();
    if (!found) return { ok: false, error: 'Usuário não encontrado' };
    if (found.pin !== pin) return { ok: false, error: 'Senha incorreta' };
    setActiveUser(found.id!);
    setUser(found);
    return { ok: true };
  };

  const register: AuthCtx['register'] = async (username, pin) => {
    const uname = normalizeUsername(username);
    if (uname.length < 2) return { ok: false, error: 'Usuário muito curto' };
    if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'A senha deve ter exatamente 4 números' };
    const exists = await authDb.users.where('username').equals(uname).first();
    if (exists) return { ok: false, error: 'Esse usuário já existe' };
    const id = await authDb.users.add({ username: uname, pin, createdAt: new Date() });
    const created = { id: id as number, username: uname, pin, createdAt: new Date() };
    setActiveUser(id as number);
    setUser(created);
    return { ok: true };
  };

  const logout = () => {
    clearActiveUser();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}