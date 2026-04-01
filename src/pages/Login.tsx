import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto noise">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-60 h-60 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative z-10">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 gradient-primary rounded-3xl mx-auto mb-6 flex items-center justify-center glow-md rotate-12">
            <span className="text-3xl font-black text-background -rotate-12">P!</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Points<span className="gradient-text">!</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Descubra o melhor da sua cidade</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="E-mail"
              className="w-full h-14 pl-12 pr-4 rounded-2xl glass-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full h-14 pl-12 pr-12 rounded-2xl glass-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 gradient-primary text-background font-bold rounded-2xl text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all glow-sm disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <>Entrar <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Não tem conta?{' '}
            <button onClick={() => navigate('/register')} className="text-primary font-bold">Criar conta</button>
          </p>
          <button onClick={() => navigate('/register-company')} className="text-xs text-muted-foreground underline">
            Cadastrar minha empresa
          </button>
          <button onClick={() => navigate('/register-driver')} className="text-xs text-primary/70 flex items-center gap-1 mx-auto">
            <Shield className="w-3 h-3" /> Cadastrar como entregador
          </button>
        </div>
      </div>
    </div>
  );
}
