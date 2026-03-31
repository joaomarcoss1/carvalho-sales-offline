import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { mockChats } from '@/lib/mock-data';

export default function Chat() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" /> Mensagens
        </h1>
        <p className="text-xs text-muted-foreground">Converse com empresas</p>
      </div>

      <div className="divide-y divide-border">
        {mockChats.map(chat => (
          <button
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="relative shrink-0">
              <img src={chat.businessAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              {chat.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground truncate">{chat.businessName}</span>
                <span className="text-xs text-muted-foreground shrink-0">{chat.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
            </div>
            {chat.unread > 0 && (
              <span className="w-5 h-5 gradient-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {chat.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {mockChats.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-muted-foreground">Nenhuma conversa ainda</p>
        </div>
      )}
    </div>
  );
}
