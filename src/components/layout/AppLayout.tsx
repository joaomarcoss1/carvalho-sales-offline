import { Outlet, Navigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuthContext } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative noise">
      <div className="pb-20 relative z-10">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
