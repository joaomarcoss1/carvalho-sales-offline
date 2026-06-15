import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ShoppingBag, User, Lock } from 'lucide-react';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = mode === 'login' ? await login(username, pin) : await register(username, pin);
    setBusy(false);
    if (!res.ok) {
      toast({ title: 'Ops', description: res.error, variant: 'destructive' });
    } else {
      toast({ title: mode === 'login' ? 'Bem-vindo!' : 'Conta criada!', description: `Olá, ${username}` });
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Carvalho Vendas</h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'Entre com sua conta de vendedor' : 'Crie sua conta de vendedor'}
          </p>
        </div>

        <div className="flex rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === 'login' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === 'register' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Usuário</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoCapitalize="none"
                autoComplete="username"
                placeholder="seu nome de usuário"
                className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Senha (4 números)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                placeholder="••••"
                className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm tracking-[0.5em] outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Cada vendedor tem seu próprio estoque, clientes e relatórios.
        </p>
      </div>
    </div>
  );
}