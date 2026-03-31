import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', address: '' });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep(step + 1); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/feed'); }, 1000);
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-foreground">Criar Conta</h1>
          <p className="text-xs text-muted-foreground">Passo {step} de 2</p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${(step / 2) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-6 space-y-4">
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-2">Dados pessoais</h2>
            <p className="text-sm text-muted-foreground mb-6">Preencha suas informações básicas</p>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Nome completo" className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="E-mail" className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Celular" className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-2">Segurança e endereço</h2>
            <p className="text-sm text-muted-foreground mb-6">Finalize seu cadastro</p>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Criar senha" className="w-full h-14 pl-12 pr-12 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Endereço" className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 gradient-primary text-white font-bold rounded-2xl text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 mt-8"
        >
          {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : step < 2 ? 'Continuar' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}
