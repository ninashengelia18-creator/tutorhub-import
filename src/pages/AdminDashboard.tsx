import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Shield, CheckCircle, Clock, XCircle, Video, Search, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminBooking {
  id: string;
  student_name: string | null;
  student_email: string | null;
  tutor_name: string;
  subject: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price_amount: number;
  currency: string;
  status: string;
  notes: string | null;
  student_message: string | null;
  google_meet_link: string | null;
  created_at: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Clock, label: "Pending" },
  confirmed: { color: "bg-green-500/10 text-green-600 border-green-500/30", icon: CheckCircle, label: "Confirmed" },
  completed: { color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: CheckCircle, label: "Completed" },
  cancelled: { color: "bg-red-500/10 text-red-600 border-red-500/30", icon: XCircle, label: "Cancelled" },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [meetLinkModal, setMeetLinkModal] = useState<AdminBooking | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const [notesModal, setNotesModal] = useState<AdminBooking | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    checkAdmin();
  }, [user]);

  async function checkAdmin() {
    if (!user) return;
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setIsAdmin(!!data);
    if (data) fetchBookings();
    else setLoading(false);
  }

  async function fetchBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setBookings((data as AdminBooking[]) || []);
    setLoading(false);
  }

  const handleMarkPaid = async (booking: AdminBooking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", booking.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.markedPaid") });
      fetchBookings();
    }
  };

  const handleMarkCompleted = async (booking: AdminBooking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", booking.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Marked as completed" });
      fetchBookings();
    }
  };

  const handleSaveMeetLink = async () => {
    if (!meetLinkModal) return;
    const { error } = await supabase
      .from("bookings")
      .update({ google_meet_link: meetLink.trim() })
      .eq("id", meetLinkModal.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.meetLinkSaved") });
      setMeetLinkModal(null);
      setMeetLink("");
      fetchBookings();
    }
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;
    const { error } = await supabase
      .from("bookings")
      .update({ notes: adminNotes.trim() })
      .eq("id", notesModal.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Notes saved" });
      setNotesModal(null);
      setAdminNotes("");
      fetchBookings();
    }
  };

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    return (
      (b.student_name || "").toLowerCase().includes(q) ||
      b.tutor_name.toLowerCase().includes(q) ||
      b.subject.toLowerCase().includes(q) ||
      (b.student_email || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  if (!isAdmin && !loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("admin.accessDenied")}</h1>
          <p className="text-muted-foreground">{t("admin.adminOnly")}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-2">{t("admin.title")}</h1>
          <p className="text-muted-foreground mb-6">{t("admin.subtitle")}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: t("admin.totalBookings"), value: stats.total, color: "text-foreground" },
              { label: t("admin.pendingPayment"), value: stats.pending, color: "text-yellow-600" },
              { label: t("admin.confirmed"), value: stats.confirmed, color: "text-green-600" },
              { label: t("admin.completedStat"), value: stats.completed, color: "text-blue-600" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border bg-card p-4">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("admin.searchPlaceholder")}
              className="pl-9"
            />
          </div>

          {/* Bookings list */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(booking => {
                const sc = statusConfig[booking.status] || statusConfig.pending;
                const StatusIcon = sc.icon;
                return (
                  <div key={booking.id} className="rounded-xl border bg-card p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn(sc.color, "gap-1")}>
                            <StatusIcon className="h-3 w-3" />
                            {sc.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-semibold text-sm">
                          {booking.student_name || "Unknown"} → {booking.tutor_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.subject} · {booking.lesson_date} · {booking.start_time?.slice(0, 5)} – {booking.end_time?.slice(0, 5)} · {booking.duration_minutes}min
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.student_email && `📧 ${booking.student_email}`}
                        </p>
                        {booking.student_message && (
                          <p className="text-xs text-muted-foreground mt-1 italic">"{booking.student_message}"</p>
                        )}
                        {booking.google_meet_link && (
                          <a href={booking.google_meet_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                            <Video className="h-3 w-3" /> Google Meet <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {booking.notes && !booking.student_message && (
                          <p className="text-xs text-muted-foreground mt-1">📝 {booking.notes}</p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <p className="font-bold tabular-nums">{booking.currency}{booking.price_amount.toFixed(2)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {booking.status === "pending" && (
                          <Button size="sm" onClick={() => handleMarkPaid(booking)} className="bg-green-600 hover:bg-green-700 text-white">
                            {t("admin.markPaid")}
                          </Button>
                        )}
                        {booking.status === "confirmed" && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkCompleted(booking)}>
                            {t("admin.markCompleted")}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => { setMeetLinkModal(booking); setMeetLink(booking.google_meet_link || ""); }}>
                          <Video className="h-3.5 w-3.5 mr-1" />
                          Meet Link
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setNotesModal(booking); setAdminNotes(booking.notes || ""); }}>
                          📝 Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {bookings.length === 0 ? t("admin.noBookings") : "No results found"}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Meet Link Dialog */}
      <Dialog open={!!meetLinkModal} onOpenChange={(open) => !open && setMeetLinkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.addMeetLink")}</DialogTitle>
          </DialogHeader>
          <Input
            value={meetLink}
            onChange={e => setMeetLink(e.target.value)}
            placeholder="https://meet.google.com/..."
          />
          <Button onClick={handleSaveMeetLink} className="w-full">{t("admin.saveMeetLink")}</Button>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={!!notesModal} onOpenChange={(open) => !open && setNotesModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Notes</DialogTitle>
          </DialogHeader>
          <textarea
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
            placeholder="Add notes about this booking..."
          />
          <Button onClick={handleSaveNotes} className="w-full">Save Notes</Button>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
