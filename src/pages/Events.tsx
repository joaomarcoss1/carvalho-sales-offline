import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import { mockEvents, categories } from '@/lib/mock-data';

export default function Events() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? mockEvents : mockEvents.filter(e => e.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Eventos
            </h1>
            <p className="text-xs text-muted-foreground">Descubra o que está acontecendo</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[{ id: 'all', name: 'Todos' }, ...categories.filter(c => c.id !== 'all')].map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === cat.id ? 'gradient-primary text-white' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {filtered.map(event => <EventCard key={event.id} event={event} />)}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎪</p>
            <p className="text-muted-foreground">Nenhum evento nesta categoria</p>
          </div>
        )}
      </div>
    </div>
  );
}
