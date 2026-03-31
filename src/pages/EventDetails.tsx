import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Share2, Heart, Ticket } from 'lucide-react';
import { useState } from 'react';
import { mockEvents } from '@/lib/mock-data';

function formatCurrency(value: number) {
  if (value === 0) return 'Grátis';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = mockEvents.find(e => e.id === id);
  const [liked, setLiked] = useState(false);
  const [tickets, setTickets] = useState(1);

  if (!event) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Evento não encontrado</div>;

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Hero */}
      <div className="relative">
        <img src={event.image} alt="" className="w-full aspect-[16/10] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => setLiked(!liked)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 relative z-10 space-y-4 pb-32">
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${event.price === 0 ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'}`}>
            {formatCurrency(event.price)}
          </span>
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">por {event.businessName}</p>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-card rounded-2xl border border-border p-3 text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs font-bold text-foreground">{event.date}</p>
            <p className="text-[10px] text-muted-foreground">{event.time}</p>
          </div>
          <div className="flex-1 bg-card rounded-2xl border border-border p-3 text-center">
            <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs font-bold text-foreground">{event.location}</p>
          </div>
          <div className="flex-1 bg-card rounded-2xl border border-border p-3 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs font-bold text-foreground">{event.attendees}</p>
            <p className="text-[10px] text-muted-foreground">interessados</p>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-foreground mb-2">Sobre o evento</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
        </div>

        {/* Ticket Selector */}
        {event.price > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" /> Ingressos
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Ingresso padrão</p>
                <p className="text-xs text-muted-foreground">{event.ticketsAvailable} disponíveis</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setTickets(Math.max(1, tickets - 1))} className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold">-</button>
                <span className="w-6 text-center font-bold text-foreground">{tickets}</span>
                <button onClick={() => setTickets(tickets + 1)} className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold">+</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border p-4 z-30 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(event.price * tickets)}</p>
          </div>
          <p className="text-xs text-muted-foreground">{tickets} ingresso(s)</p>
        </div>
        <button className="w-full h-14 gradient-primary text-white font-bold rounded-2xl text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25">
          {event.price === 0 ? 'Confirmar presença' : 'Comprar ingressos'}
        </button>
      </div>
    </div>
  );
}
