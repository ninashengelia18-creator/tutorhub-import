import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileState: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const applySession = useCallback((nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setLoading(false);

    if (!nextSession) {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    setProfile(data ?? { display_name: null, avatar_url: null });
  }, [session?.user?.id]);

  useEffect(() => {
    const handleAuthChange = (_event: AuthChangeEvent, nextSession: Session | null) => {
      applySession(nextSession);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    void supabase.auth.getSession().then(({ data: { session: nextSession } }) => {
      applySession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const channel = supabase
      .channel("auth-profile-sync")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && "id" in payload.new && payload.new.id === userId) {
            setProfile({
              display_name: (payload.new as { display_name?: string | null }).display_name ?? null,
              avatar_url: (payload.new as { avatar_url?: string | null }).avatar_url ?? null,
            });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const signOut = useCallback(async () => {
    setProfile(null);
    applySession(null);
    await supabase.auth.signOut();
  }, [applySession]);

  const updateProfileState = useCallback((nextProfile: Partial<UserProfile>) => {
    setProfile((current) => ({
      display_name: current?.display_name ?? null,
      avatar_url: current?.avatar_url ?? null,
      ...nextProfile,
    }));
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, session, loading, profile, signOut, refreshProfile, updateProfileState }),
    [user, session, loading, profile, signOut, refreshProfile, updateProfileState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
