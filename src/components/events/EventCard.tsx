import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Event } from '@/lib/mock-data';

function formatCurrency(value: number) {
  if (value === 0) return 'Grátis';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/events/${event.id}`)}
      className="w-full text-left bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 group"
    >
      <div className="relative">
        <img src={event.image} alt="" className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 text-center">
          <p className="text-white font-bold text-sm">{event.date.split(' ')[0]}</p>
          <p className="text-white/80 text-[10px] uppercase font-medium">{event.date.split(' ')[1]}</p>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-base leading-tight">{event.title}</h3>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.price === 0 ? 'bg-green-500/90 text-white' : 'gradient-primary text-white'}`}>
            {formatCurrency(event.price)}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{event.time}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />{event.attendees} interessados
          </span>
          <span className="flex items-center gap-1 text-xs text-primary font-medium">
            <Ticket className="w-3.5 h-3.5" />{event.ticketsAvailable} ingressos
          </span>
        </div>
      </div>
    </button>
  );
}
