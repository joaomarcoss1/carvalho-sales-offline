import { useState, useEffect } from 'react';
import { Bell, MapPin, ChevronDown } from 'lucide-react';
import FilterBar from '@/components/feed/FilterBar';
import PostCard from '@/components/feed/PostCard';
import StoryBar from '@/components/feed/StoryBar';
import StoryViewer from '@/components/feed/StoryViewer';
import { supabase } from '@/integrations/supabase/client';
import { mockPosts } from '@/lib/mock-data';

interface StoryGroup {
  businessId: string;
  businessName: string;
  businessAvatar: string;
  stories: { id: string; image_url: string; caption: string | null }[];
}

export default function Feed() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [viewingStory, setViewingStory] = useState<StoryGroup | null>(null);

  useEffect(() => {
    supabase
      .from('stories')
      .select('*, businesses!inner(id, name, avatar_url)')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const groups: Record<string, StoryGroup> = {};
        data.forEach((s: any) => {
          const bId = s.businesses.id;
          if (!groups[bId]) {
            groups[bId] = {
              businessId: bId,
              businessName: s.businesses.name,
              businessAvatar: s.businesses.avatar_url || '',
              stories: [],
            };
          }
          groups[bId].stories.push({ id: s.id, image_url: s.image_url, caption: s.caption });
        });
        setStoryGroups(Object.values(groups));
      });
  }, []);

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
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>São Paulo, SP</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          <button className="relative w-10 h-10 rounded-2xl glass-card flex items-center justify-center">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card" />
          </button>
        </div>
        <FilterBar selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Stories */}
      <StoryBar groups={storyGroups} onView={setViewingStory} />

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

      {/* Story Viewer */}
      {viewingStory && (
        <StoryViewer group={viewingStory} onClose={() => setViewingStory(null)} />
      )}
    </div>
  );
}
