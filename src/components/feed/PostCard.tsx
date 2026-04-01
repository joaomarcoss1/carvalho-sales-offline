import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, BadgeCheck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Post } from '@/lib/mock-data';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const typeLabel = post.type === 'promo' ? '🏷️ Promoção' : post.type === 'event' ? '🎪 Evento' : '📦 Produto';

  return (
    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/10">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <img src={post.businessAvatar} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/10" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-foreground truncate">{post.businessName}</span>
            {post.businessVerified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{post.distance}</span>
            <span>•</span>
            <span>{post.createdAt}</span>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-xl glass-surface text-muted-foreground font-medium">{typeLabel}</span>
      </div>

      {/* Content */}
      <p className="px-4 pb-3 text-sm text-foreground/85 leading-relaxed">{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className="relative">
          <img src={post.image} alt="" className="w-full aspect-[3/2] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          <button onClick={handleLike} className="flex items-center gap-1.5 group">
            <Heart
              className={cn(
                'w-5 h-5 transition-all duration-200 group-active:scale-125',
                liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
            <span className={cn('text-xs font-medium', liked ? 'text-red-500' : 'text-muted-foreground')}>{likes}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-medium">{post.shares}</span>
          </button>
        </div>
        <button onClick={() => setSaved(!saved)} className="transition-all duration-200 active:scale-125">
          <Bookmark className={cn('w-5 h-5', saved ? 'fill-primary text-primary' : 'text-muted-foreground')} />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border px-4 py-3 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary shrink-0" />
            <div>
              <span className="text-xs font-semibold text-foreground">Maria S.</span>
              <p className="text-xs text-muted-foreground">Adorei! Vou com certeza 😍</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Adicionar comentário..."
              className="flex-1 h-9 px-3 rounded-xl glass-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="h-9 px-4 rounded-xl gradient-primary text-background text-sm font-medium">
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
