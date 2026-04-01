import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Senha deve ter ao menos 6 caracteres'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }

    toast.success('Conta criada com sucesso!');
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col noise">
      <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="px-4 py-4 flex items-center gap-3 relative z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-bold text-lg text-foreground">Criar Conta</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-6 space-y-4 relative z-10">
        <h2 className="text-2xl font-bold text-foreground mb-1">Junte-se ao Points!</h2>
        <p className="text-sm text-muted-foreground mb-6">Crie sua conta e descubra sua cidade</p>

        {[
          { icon: User, field: 'name', placeholder: 'Nome completo', type: 'text' },
          { icon: Mail, field: 'email', placeholder: 'E-mail', type: 'email' },
          { icon: Phone, field: 'phone', placeholder: 'Celular', type: 'tel' },
        ].map(({ icon: Icon, field, placeholder, type }) => (
          <div key={field} className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={type}
              value={(form as any)[field]}
              onChange={e => update(field, e.target.value)}
              placeholder={placeholder}
              className="w-full h-14 pl-12 pr-4 rounded-2xl glass-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              required
            />
          </div>
        ))}

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={e => update('password', e.target.value)}
            placeholder="Criar senha"
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
          className="w-full h-14 gradient-primary text-background font-bold rounded-2xl text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all glow-sm disabled:opacity-50 mt-6"
        >
          {loading ? <div className="w-6 h-6 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}
