import { useState } from 'react';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import PostCard from '@/components/feed/PostCard';
import { mockPosts, categories } from '@/lib/mock-data';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const results = mockPosts.filter(p =>
    p.businessName.toLowerCase().includes(query.toLowerCase()) ||
    p.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSearched(true); }}
            placeholder="Buscar promoções, empresas, eventos..."
            className="w-full h-12 pl-12 pr-10 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            autoFocus
          />
          {query && (
            <button onClick={() => { setQuery(''); setSearched(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {!searched || !query ? (
        <div className="px-4 py-6 space-y-6">
          {/* Trending */}
          <div>
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Em alta
            </h2>
            <div className="space-y-2">
              {['Promoção Burger House', 'Festival Gastronômico', 'Desconto Studio Bella'].map((item, i) => (
                <button key={i} onClick={() => { setQuery(item); setSearched(true); }} className="w-full text-left p-3 rounded-xl bg-card border border-border text-sm text-foreground hover:border-primary/20 transition-colors">
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Grid */}
          <div>
            <h2 className="font-bold text-foreground mb-3">Categorias</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.filter(c => c.id !== 'all').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setQuery(cat.name); setSearched(true); }}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white font-bold text-sm flex items-center gap-2`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          <p className="text-xs text-muted-foreground">{results.length} resultado(s)</p>
          {results.map(post => <PostCard key={post.id} post={post} />)}
          {results.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">😕</p>
              <p className="text-muted-foreground">Nenhum resultado para "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
