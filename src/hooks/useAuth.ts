import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const checkRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    const roles = data?.map(r => r.role) || [];
    setIsAdmin(roles.includes('admin'));
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await checkRole(u.id);
        await fetchProfile(u.id);
      } else {
        setIsAdmin(false);
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        checkRole(u.id);
        fetchProfile(u.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkRole, fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setProfile(null);
  }, []);

  return { user, loading, isAdmin, profile, signOut };
}
