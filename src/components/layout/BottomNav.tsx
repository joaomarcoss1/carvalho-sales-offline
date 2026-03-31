import { Home, Calendar, MessageCircle, User, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/feed', label: 'Início', icon: Home },
  { path: '/search', label: 'Buscar', icon: Search },
  { path: '/events', label: 'Eventos', icon: Calendar },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/profile', label: 'Perfil', icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex h-16">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'relative p-1.5 rounded-xl transition-all duration-200',
                isActive && 'gradient-primary'
              )}>
                <Icon className={cn('w-5 h-5', isActive && 'text-white')} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className={cn('text-[10px]', isActive ? 'font-bold' : 'font-medium')}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
