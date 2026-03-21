import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";

type AppRole = Enums<"app_role">;

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  roles: AppRole[];
  isAdmin: boolean;
  isTutor: boolean;
  isConvoPartner: boolean;
  isStudent: boolean;
  defaultRoute: string;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  updateProfileState: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const applySession = useCallback((nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setAuthLoading(false);

    if (!nextSession?.user) {
      setProfile(null);
      setRoles([]);
      setProfileLoading(false);
      setRolesLoading(false);
      return;
    }

    setProfileLoading(true);
    setRolesLoading(true);
  }, []);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    try {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      setProfile(data ?? { display_name: null, avatar_url: null });
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user?.id]);

  const refreshRoles = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setRoles([]);
      setRolesLoading(false);
      return;
    }

    setRolesLoading(true);

    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      setRoles((data ?? []).map((entry) => entry.role));
    } finally {
      setRolesLoading(false);
    }
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
    if (!session?.user?.id) return;
    void Promise.all([refreshProfile(), refreshRoles()]);
  }, [refreshProfile, refreshRoles, session?.user?.id]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const channel = supabase
      .channel(`auth-sync-${userId}`)
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_roles",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refreshRoles();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshRoles, session?.user?.id]);

  const signOut = useCallback(async () => {
    setProfile(null);
    setRoles([]);
    setProfileLoading(false);
    setRolesLoading(false);
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

  const isAdmin = roles.includes("admin");
  const isTutor = roles.includes("tutor");
  const isConvoPartner = roles.includes("convo_partner");
  const isStudent = user !== null && !isTutor && !isAdmin && !isConvoPartner;
  const defaultRoute = isAdmin ? "/admin" : isTutor ? "/tutor-dashboard" : isConvoPartner ? "/partner-dashboard" : "/dashboard";
  const loading = authLoading || (user !== null && (profileLoading || rolesLoading));

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      loading,
      profile,
      roles,
      isAdmin,
      isTutor,
      isConvoPartner,
      isStudent,
      defaultRoute,
      signOut,
      refreshProfile,
      refreshRoles,
      updateProfileState,
    }),
    [user, session, loading, profile, roles, isAdmin, isTutor, isConvoPartner, isStudent, defaultRoute, signOut, refreshProfile, refreshRoles, updateProfileState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
