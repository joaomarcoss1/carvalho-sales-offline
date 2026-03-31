import { useState } from 'react';
import { Bell, MapPin, ChevronDown } from 'lucide-react';
import FilterBar from '@/components/feed/FilterBar';
import PostCard from '@/components/feed/PostCard';
import { mockPosts } from '@/lib/mock-data';

export default function Feed() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const filtered = selectedCategory === 'all'
    ? mockPosts
    : mockPosts.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight">
              Points<span className="gradient-text">!</span>
            </h1>
            <button
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"
            >
              <MapPin className="w-3 h-3" />
              <span>São Paulo, SP</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card" />
          </button>
        </div>

        {/* Filter */}
        <FilterBar selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Stories / Highlights */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 py-4">
        {['Burger House', 'Studio Bella', 'TechStore', 'CrossFit', 'Café Moka'].map((name, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-primary to-pink-500">
              <div className="w-full h-full rounded-full bg-card p-0.5">
                <img
                  src={`https://images.unsplash.com/photo-${1550547660 + i * 10000}-d9450f859349?w=100&h=100&fit=crop`}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium max-w-[60px] truncate">{name}</span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="px-4 space-y-4 pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-muted-foreground font-medium">Nenhum resultado para esta categoria</p>
          </div>
        ) : (
          filtered.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50" onClick={() => setShowLocationPicker(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-w-lg mx-auto animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h2 className="font-bold text-lg text-foreground mb-4">Alterar localização</h2>
            <div className="relative mb-4">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input placeholder="Buscar cidade..." className="w-full h-12 pl-12 pr-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            </div>
            <button className="w-full h-12 gradient-primary text-white font-bold rounded-2xl" onClick={() => setShowLocationPicker(false)}>
              Usar localização atual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
