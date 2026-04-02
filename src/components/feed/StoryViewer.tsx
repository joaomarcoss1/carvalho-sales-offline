import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Story {
  id: string;
  image_url: string;
  caption: string | null;
}

interface StoryGroup {
  businessId: string;
  businessName: string;
  businessAvatar: string;
  stories: Story[];
}

interface Props {
  group: StoryGroup;
  onClose: () => void;
}

export default function StoryViewer({ group, onClose }: Props) {
  const { user } = useAuthContext();
  const [current, setCurrent] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const story = group.stories[current];

  const goNext = useCallback(() => {
    if (current < group.stories.length - 1) {
      setCurrent(c => c + 1);
      setProgress(0);
      setLiked(false);
    } else {
      onClose();
    }
  }, [current, group.stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent(c => c - 1);
      setProgress(0);
      setLiked(false);
    }
  }, [current]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { goNext(); return 0; }
        return p + 0.5;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [paused, goNext]);

  const handleLike = async () => {
    if (!user) return;
    setLiked(!liked);
    if (!liked) {
      await supabase.from('likes').insert({ target_id: story.id, target_type: 'story', user_id: user.id });
      toast.success('❤️');
    } else {
      await supabase.from('likes').delete().match({ target_id: story.id, target_type: 'story', user_id: user.id });
    }
  };

  const handleComment = async () => {
    if (!user || !comment.trim()) return;
    await supabase.from('comments').insert({ target_id: story.id, target_type: 'story', user_id: user.id, content: comment.trim() });
    toast.success('Comentário enviado!');
    setComment('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
    >
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {group.stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-100"
              style={{ width: i < current ? '100%' : i === current ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img src={group.businessAvatar || 'https://via.placeholder.com/40'} alt="" className="w-9 h-9 rounded-xl object-cover" />
          <span className="text-white font-semibold text-sm">{group.businessName}</span>
        </div>
        <motion.button whileTap={{ scale: 0.85 }} onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={story.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          src={story.image_url.replace('w=100', 'w=800').replace('h=100', 'h=1200')}
          alt=""
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Caption */}
      {story.caption && (
        <div className="absolute bottom-24 left-4 right-4 z-10">
          <p className="text-white text-sm bg-black/40 backdrop-blur-md rounded-2xl px-4 py-3">{story.caption}</p>
        </div>
      )}

      {/* Navigation areas */}
      <button onClick={goPrev} className="absolute left-0 top-0 w-1/3 h-full z-10" />
      <button onClick={goNext} className="absolute right-0 top-0 w-1/3 h-full z-10" />

      {/* Bottom actions */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 z-10">
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={e => e.key === 'Enter' && handleComment()}
          placeholder="Enviar mensagem..."
          className="flex-1 h-10 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm placeholder:text-white/50 focus:outline-none"
        />
        <motion.button whileTap={{ scale: 1.3 }} onClick={handleLike} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
          <Heart className={cn('w-5 h-5', liked ? 'fill-red-500 text-red-500' : 'text-white')} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} onClick={handleComment} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
}
