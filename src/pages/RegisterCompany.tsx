import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, Clock } from 'lucide-react';

export default function RegisterCompany() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', cnpj: '', email: '', phone: '', address: '', category: '' });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-primary/30">
          <Clock className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Solicitação enviada!</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Sua solicitação de cadastro empresarial foi recebida. Nossa equipe irá analisar e você receberá uma confirmação em breve.
        </p>
        <button onClick={() => navigate('/')} className="w-full h-14 gradient-primary text-white font-bold rounded-2xl">
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
      <div className="px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-bold text-lg text-foreground">Cadastro Empresarial</h1>
          <p className="text-xs text-muted-foreground">Sujeito à aprovação</p>
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="flex-1 px-6 py-4 space-y-4">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-2">
          <p className="text-sm text-primary font-medium">⚠️ O cadastro empresarial é restrito e necessita aprovação dos administradores.</p>
        </div>

        {[
          { icon: Building2, field: 'name', placeholder: 'Nome da empresa', type: 'text' },
          { icon: FileText, field: 'cnpj', placeholder: 'CNPJ', type: 'text' },
          { icon: Mail, field: 'email', placeholder: 'E-mail corporativo', type: 'email' },
          { icon: Phone, field: 'phone', placeholder: 'Telefone', type: 'tel' },
          { icon: MapPin, field: 'address', placeholder: 'Endereço', type: 'text' },
        ].map(({ icon: Icon, field, placeholder, type }) => (
          <div key={field} className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type={type} value={(form as any)[field]} onChange={e => update(field, e.target.value)} placeholder={placeholder} className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
          </div>
        ))}

        <select
          value={form.category}
          onChange={e => update('category', e.target.value)}
          className="w-full h-14 px-4 rounded-2xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm appearance-none"
          required
        >
          <option value="" disabled>Categoria da empresa</option>
          <option value="food">Gastronomia</option>
          <option value="fashion">Moda</option>
          <option value="beauty">Beleza</option>
          <option value="tech">Tecnologia</option>
          <option value="fitness">Fitness</option>
          <option value="entertainment">Entretenimento</option>
          <option value="services">Serviços</option>
        </select>

        <button type="submit" className="w-full h-14 gradient-primary text-white font-bold rounded-2xl text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 mt-4">
          Enviar solicitação
        </button>
      </form>
    </div>
  );
}
