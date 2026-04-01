import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Mail, Lock, User, Phone, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function RegisterDriver() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', vehicleType: 'moto', licensePlate: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Senha deve ter ao menos 6 caracteres'); return; }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    });

    if (authError || !authData.user) {
      toast.error(authError?.message || 'Erro ao criar conta');
      setLoading(false);
      return;
    }

    await supabase.from('user_roles').insert({ user_id: authData.user.id, role: 'driver' as any });
    await supabase.from('drivers').insert({
      user_id: authData.user.id,
      vehicle_type: form.vehicleType,
      license_plate: form.licensePlate,
    });

    // Update profile phone
    await supabase.from('profiles').update({ phone: form.phone }).eq('id', authData.user.id);

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center noise">
        <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mb-6 glow-md">
          <CheckCircle className="w-10 h-10 text-background" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Cadastro enviado!</h1>
        <p className="text-muted-foreground text-sm mb-8">Seu cadastro como entregador será analisado. Você receberá uma notificação quando for aprovado.</p>
        <button onClick={() => navigate('/feed')} className="w-full h-14 gradient-primary text-background font-bold rounded-2xl glow-sm">
          Ir para o app
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col noise">
      <div className="px-4 py-4 flex items-center gap-3 relative z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-bold text-lg text-foreground">Cadastro Entregador</h1>
          <p className="text-xs text-muted-foreground">Trabalhe com entregas no Points!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-6 py-4 space-y-4 relative z-10">
        <div className="glass-card rounded-2xl p-4 border-primary/20 mb-2">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Seja um entregador Points!</p>
              <p className="text-xs text-muted-foreground">Ganhe dinheiro fazendo entregas na sua região</p>
            </div>
          </div>
        </div>

        {[
          { icon: User, field: 'name', placeholder: 'Nome completo', type: 'text' },
          { icon: Mail, field: 'email', placeholder: 'E-mail', type: 'email' },
          { icon: Lock, field: 'password', placeholder: 'Criar senha', type: 'password' },
          { icon: Phone, field: 'phone', placeholder: 'Celular', type: 'tel' },
          { icon: FileText, field: 'licensePlate', placeholder: 'Placa do veículo', type: 'text' },
        ].map(({ icon: Icon, field, placeholder, type }) => (
          <div key={field} className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type={type} value={(form as any)[field]} onChange={e => update(field, e.target.value)} placeholder={placeholder} className="w-full h-14 pl-12 pr-4 rounded-2xl glass-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
          </div>
        ))}

        <select value={form.vehicleType} onChange={e => update('vehicleType', e.target.value)} className="w-full h-14 px-4 rounded-2xl glass-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm appearance-none">
          <option value="moto">🏍️ Moto</option>
          <option value="carro">🚗 Carro</option>
          <option value="bicicleta">🚴 Bicicleta</option>
        </select>

        <button type="submit" disabled={loading} className="w-full h-14 gradient-primary text-background font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all glow-sm disabled:opacity-50 mt-4">
          {loading ? <div className="w-6 h-6 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : 'Cadastrar como entregador'}
        </button>
      </form>
    </div>
  );
}
