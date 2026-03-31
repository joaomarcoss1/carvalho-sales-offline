import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, MoreVertical } from 'lucide-react';
import { mockChats } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
}

const demoMessages: Message[] = [
  { id: '1', text: 'Olá! Vi a promoção no Points! e gostaria de saber mais detalhes.', fromMe: true, time: '14:25' },
  { id: '2', text: 'Olá! Claro, temos o combo duplo por R$ 29,90, válido até hoje! 🍔🍟', fromMe: false, time: '14:27' },
  { id: '3', text: 'Posso reservar pelo app?', fromMe: true, time: '14:28' },
  { id: '4', text: 'Seu pedido está sendo preparado! 🍔', fromMe: false, time: '14:30' },
];

export default function ChatConversation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chat = mockChats.find(c => c.id === id);
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: input, fromMe: true, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  if (!chat) return null;

  return (
    <div className="h-screen bg-background max-w-lg mx-auto flex flex-col">
      {/* Header */}
      <div className="glass border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/chat')} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="relative">
          <img src={chat.businessAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          {chat.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{chat.businessName}</p>
          <p className="text-xs text-green-400">{chat.online ? 'Online' : 'Offline'}</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Phone className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.fromMe ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm',
              msg.fromMe
                ? 'gradient-primary text-white rounded-br-md'
                : 'bg-card border border-border text-foreground rounded-bl-md'
            )}>
              <p>{msg.text}</p>
              <p className={cn('text-[10px] mt-1 text-right', msg.fromMe ? 'text-white/60' : 'text-muted-foreground')}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="glass border-t border-border p-3 flex items-center gap-2 safe-bottom shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Mensagem..."
          className="flex-1 h-11 px-4 rounded-full bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
        <button onClick={sendMessage} className="w-11 h-11 gradient-primary rounded-full flex items-center justify-center shrink-0 hover:opacity-90 active:scale-90 transition-all">
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
