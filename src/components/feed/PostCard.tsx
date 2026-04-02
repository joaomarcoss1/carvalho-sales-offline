import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, BadgeCheck, MapPin, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { Post } from '@/lib/mock-data';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuthContext();
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{ id: string; content: string; userName: string; created_at: string }[]>([]);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [submitting, setSubmitting] = useState(false);

  // Load comments when opened
  useEffect(() => {
    if (!showComments) return;
    supabase
      .from('comments')
      .select('*, profiles!inner(full_name)')
      .eq('target_id', post.id)
      .eq('target_type', 'post')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) {
          setComments(data.map((c: any) => ({
            id: c.id,
            content: c.content,
            userName: c.profiles?.full_name || 'Usuário',
            created_at: c.created_at,
          })));
        }
      });
  }, [showComments, post.id]);

  const handleLike = async () => {
    if (!user) { toast.error('Faça login para curtir'); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : prev - 1);

    if (newLiked) {
      await supabase.from('likes').insert({
        target_id: post.id,
        target_type: 'post',
        user_id: user.id,
      });
    } else {
      await supabase.from('likes').delete().match({
        target_id: post.id,
        target_type: 'post',
        user_id: user.id,
      });
    }
  };

  const handleComment = async () => {
    if (!user) { toast.error('Faça login para comentar'); return; }
    if (!comment.trim()) return;
    setSubmitting(true);

    const { data, error } = await supabase.from('comments').insert({
      target_id: post.id,
      target_type: 'post',
      user_id: user.id,
      content: comment.trim(),
    }).select('*, profiles!inner(full_name)').single();

    setSubmitting(false);
    if (error) { toast.error('Erro ao comentar'); return; }

    setComments(prev => [{
      id: data.id,
      content: data.content,
      userName: (data as any).profiles?.full_name || 'Você',
      created_at: data.created_at,
    }, ...prev]);
    setCommentCount(c => c + 1);
    setComment('');
    toast.success('Comentário enviado!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.businessName, text: post.content, url: window.location.href });
    } else {
      navigator.clipboard.writeText(post.content);
      toast.success('Link copiado!');
    }
  };

  const typeLabel = post.type === 'promo' ? '🏷️ Promoção' : post.type === 'event' ? '🎪 Evento' : '📦 Produto';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/10"
    >
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

      <p className="px-4 pb-3 text-sm text-foreground/85 leading-relaxed">{post.content}</p>

      {post.image && (
        <div className="relative">
          <img src={post.image.replace('w=600', 'w=800').replace('h=400', 'h=600')} alt="" className="w-full aspect-[3/2] object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          <motion.button whileTap={{ scale: 1.3 }} onClick={handleLike} className="flex items-center gap-1.5 group">
            <Heart className={cn('w-5 h-5 transition-all duration-200', liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
            <span className={cn('text-xs font-medium', liked ? 'text-red-500' : 'text-muted-foreground')}>{likes}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 1.1 }} onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">{commentCount}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 1.1 }} onClick={handleShare} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-medium">{post.shares}</span>
          </motion.button>
        </div>
        <motion.button whileTap={{ scale: 1.3 }} onClick={() => setSaved(!saved)}>
          <Bookmark className={cn('w-5 h-5', saved ? 'fill-primary text-primary' : 'text-muted-foreground')} />
        </motion.button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              {comments.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-lg gradient-primary shrink-0 flex items-center justify-center text-[10px] font-bold text-background">
                      {c.userName[0]}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground">{c.userName}</span>
                      <p className="text-xs text-muted-foreground">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhum comentário ainda. Seja o primeiro!</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  placeholder="Adicionar comentário..."
                  className="flex-1 h-9 px-3 rounded-xl glass-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleComment}
                  disabled={submitting || !comment.trim()}
                  className="h-9 px-4 rounded-xl gradient-primary text-background text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
