import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, Search, Shield, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { TutorApplicationList, type TutorApplicationListItem } from "@/components/admin/TutorApplicationList";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminApplications() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [applications, setApplications] = useState<TutorApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const refreshApplications = useCallback(async () => {
    const { data, error } = await supabase
      .from("tutor_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setApplications((data as TutorApplicationListItem[] | null) ?? []);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) {
        if (!cancelled) { setIsAdmin(false); setLoading(false); }
        return;
      }

      setLoading(true);
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      const admin = Boolean(data);
      if (!cancelled) setIsAdmin(admin);

      if (admin) await refreshApplications();
      if (!cancelled) setLoading(false);
    };

    void load();
    return () => { cancelled = true; };
  }, [refreshApplications, user]);

  const sendDecisionEmail = async (app: TutorApplicationListItem, decision: "approved" | "rejected") => {
    try {
      await supabase.functions.invoke("notify-tutor-decision", {
        body: {
          email: app.email,
          first_name: app.first_name,
          last_name: app.last_name,
          decision,
        },
      });
    } catch (err) {
      console.error("Failed to send decision email:", err);
    }
  };

  const handleApprove = async (app: TutorApplicationListItem) => {
    setPendingActionId(app.id);
    try {
      const { error } = await supabase.rpc("approve_tutor_application", { _application_id: app.id });
      if (error) throw error;

      await sendDecisionEmail(app, "approved");
      toast({ title: "Tutor approved", description: `${app.first_name} ${app.last_name} has been approved and notified.` });
      await refreshApplications();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Unable to approve.", variant: "destructive" });
    } finally {
      setPendingActionId(null);
    }
  };

  const handleReject = async (app: TutorApplicationListItem) => {
    setPendingActionId(app.id);
    try {
      const { error } = await supabase.rpc("reject_tutor_application", { _application_id: app.id });
      if (error) throw error;

      await sendDecisionEmail(app, "rejected");
      toast({ title: "Tutor rejected", description: `${app.first_name} ${app.last_name} has been rejected.` });
      await refreshApplications();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Unable to reject.", variant: "destructive" });
    } finally {
      setPendingActionId(null);
    }
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return applications
      .filter((a) => statusFilter === "all" || a.status === statusFilter)
      .filter((a) =>
        [`${a.first_name} ${a.last_name}`, a.email, a.subjects.join(" "), a.experience]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
  }, [applications, search, statusFilter]);

  const counts = useMemo(() => ({
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  }), [applications]);

  if (!isAdmin && !loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">Admin access required.</p>
        </div>
      </Layout>
    );
  }

  const filterButtons: { key: StatusFilter; label: string; icon: typeof Clock; color: string }[] = [
    { key: "pending", label: "Pending", icon: Clock, color: "text-warning" },
    { key: "approved", label: "Approved", icon: CheckCircle, color: "text-success" },
    { key: "rejected", label: "Rejected", icon: XCircle, color: "text-destructive" },
    { key: "all", label: "All", icon: Clock, color: "text-foreground" },
  ];

  return (
    <Layout>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <Link to="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Admin Dashboard
            </Link>
            <h1 className="mb-2 text-2xl font-bold">Tutor Applications</h1>
            <p className="text-muted-foreground">Review, approve, or reject tutor applications.</p>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setStatusFilter(btn.key)}
                className={cn(
                  "rounded-xl border bg-card p-4 text-left transition-colors",
                  statusFilter === btn.key && "ring-2 ring-primary",
                )}
              >
                <p className={cn("text-2xl font-bold", btn.color)}>{counts[btn.key]}</p>
                <p className="text-xs text-muted-foreground">{btn.label}</p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, subject..." className="pl-9" />
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : (
            <TutorApplicationList
              applications={filtered}
              emptyLabel={statusFilter === "pending" ? "No pending applications" : "No applications found"}
              approveLabel="Approve"
              rejectLabel="Reject"
              onApprove={handleApprove}
              onReject={handleReject}
              pendingActionId={pendingActionId}
            />
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
