import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, GraduationCap, Search, Shield, Users, Video, CheckCircle, Clock, XCircle } from "lucide-react";

import { Layout } from "@/components/Layout";
import { TutorApplicationList, type TutorApplicationListItem } from "@/components/admin/TutorApplicationList";
import { ManualTutorDialog, type ManualTutorFormValues } from "@/components/admin/ManualTutorDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { submitFormspree } from "@/lib/formspree";
import { cn } from "@/lib/utils";

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

  const [activeTab, setActiveTab] = useState<"bookings" | "tutors">("bookings");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [applications, setApplications] = useState<TutorApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [meetLinkModal, setMeetLinkModal] = useState<AdminBooking | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const [notesModal, setNotesModal] = useState<AdminBooking | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [pendingTutorActionId, setPendingTutorActionId] = useState<string | null>(null);
  const [publishingTutor, setPublishingTutor] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAdminState = async () => {
      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });

      if (error) {
        if (!cancelled) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      const admin = Boolean(data);
      if (!cancelled) setIsAdmin(admin);

      if (!admin) {
        if (!cancelled) setLoading(false);
        return;
      }

      const [bookingResult, applicationResult] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("tutor_applications").select("*").order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;

      if (bookingResult.error) {
        toast({ title: "Error", description: bookingResult.error.message, variant: "destructive" });
      } else {
        setBookings((bookingResult.data as AdminBooking[] | null) ?? []);
      }

      if (applicationResult.error) {
        toast({ title: "Error", description: applicationResult.error.message, variant: "destructive" });
      } else {
        setApplications((applicationResult.data as TutorApplicationListItem[] | null) ?? []);
      }

      setLoading(false);
    };

    void loadAdminState();
    return () => {
      cancelled = true;
    };
  }, [toast, user]);

  const refreshBookings = async () => {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    setBookings((data as AdminBooking[] | null) ?? []);
  };

  const refreshApplications = async () => {
    const { data, error } = await supabase.from("tutor_applications").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    setApplications((data as TutorApplicationListItem[] | null) ?? []);
  };

  const sendTutorDecisionNotification = async (application: TutorApplicationListItem, decision: "approved" | "rejected") => {
    const fullName = `${application.first_name} ${application.last_name}`.trim();
    const tutorMessage =
      decision === "approved"
        ? "Congratulations! Your LearnEazy tutor profile is now live. Log in at learneazy.org to set up your availability and start receiving student bookings."
        : "Thank you for applying to LearnEazy. Unfortunately we cannot approve your application at this time. Please contact info@learneazy.org for more information.";

    await submitFormspree({
      email: application.email,
      full_name: fullName,
      tutor_email: application.email,
      subject_taught: application.subjects.join(", "),
      experience: application.experience,
      hourly_rate: application.hourly_rate,
      country: application.country ?? "Not provided",
      decision,
      tutor_message: tutorMessage,
      _subject: `Tutor application ${decision}: ${fullName}`,
    });
  };

  const handleMarkPaid = async (booking: AdminBooking) => {
    const { error } = await supabase.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: t("admin.markedPaid") });
    void refreshBookings();
  };

  const handleMarkCompleted = async (booking: AdminBooking) => {
    const { error } = await supabase.from("bookings").update({ status: "completed" }).eq("id", booking.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Marked as completed" });
    void refreshBookings();
  };

  const handleSaveMeetLink = async () => {
    if (!meetLinkModal) return;

    const { error } = await supabase
      .from("bookings")
      .update({ google_meet_link: meetLink.trim() || null })
      .eq("id", meetLinkModal.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: t("admin.meetLinkSaved") });
    setMeetLinkModal(null);
    setMeetLink("");
    void refreshBookings();
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;

    const { error } = await supabase.from("bookings").update({ notes: adminNotes.trim() || null }).eq("id", notesModal.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Notes saved" });
    setNotesModal(null);
    setAdminNotes("");
    void refreshBookings();
  };

  const handleApproveTutor = async (application: TutorApplicationListItem) => {
    setPendingTutorActionId(application.id);

    try {
      const { error } = await supabase.rpc("approve_tutor_application", { _application_id: application.id });
      if (error) throw error;

      try {
        await sendTutorDecisionNotification(application, "approved");
        toast({ title: t("admin.tutorApproved") });
      } catch (notificationError) {
        toast({
          title: t("admin.tutorApproved"),
          description: notificationError instanceof Error ? notificationError.message : "Tutor was approved, but the notification email could not be sent.",
        });
      }

      await refreshApplications();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to approve tutor.",
        variant: "destructive",
      });
    } finally {
      setPendingTutorActionId(null);
    }
  };

  const handleRejectTutor = async (application: TutorApplicationListItem) => {
    setPendingTutorActionId(application.id);

    try {
      const { error } = await supabase.rpc("reject_tutor_application", { _application_id: application.id });
      if (error) throw error;

      try {
        await sendTutorDecisionNotification(application, "rejected");
        toast({ title: t("admin.tutorRejected") });
      } catch (notificationError) {
        toast({
          title: t("admin.tutorRejected"),
          description: notificationError instanceof Error ? notificationError.message : "Tutor was rejected, but the notification email could not be sent.",
        });
      }

      await refreshApplications();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to reject tutor.",
        variant: "destructive",
      });
    } finally {
      setPendingTutorActionId(null);
    }
  };

  const handleManualTutorPublish = async (values: ManualTutorFormValues) => {
    setPublishingTutor(true);

    try {
      const { error } = await supabase.rpc("admin_create_tutor_profile", {
        _first_name: values.firstName.trim(),
        _last_name: values.lastName.trim(),
        _email: values.email.trim(),
        _primary_subject: values.primarySubject.trim(),
        _subjects: values.subjects,
        _experience: values.experience.trim(),
        _hourly_rate: Number(values.hourlyRate),
        _country: values.country.trim() || null,
        _native_language: values.nativeLanguage.trim() || null,
        _other_languages: values.otherLanguages.trim() || null,
        _bio: values.bio.trim(),
        _education: values.education.trim() || null,
        _certifications: values.certifications.trim() || null,
        _avatar_url: values.avatarUrl.trim() || null,
      });

      if (error) throw error;

      await submitFormspree({
        email: values.email.trim(),
        full_name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
        tutor_email: values.email.trim(),
        subject_taught: values.subjects.join(", "),
        experience: values.experience.trim(),
        qualifications: [values.education.trim(), values.certifications.trim()].filter(Boolean).join(" | ") || "Not provided",
        languages_spoken: [values.nativeLanguage.trim(), values.otherLanguages.trim()].filter(Boolean).join(", ") || "Not provided",
        hourly_rate: Number(values.hourlyRate),
        country: values.country.trim() || "Not provided",
        publish_source: "manual",
        _subject: `Manual tutor published: ${values.firstName.trim()} ${values.lastName.trim()}`,
      });

      toast({ title: "Tutor published successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to publish tutor.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setPublishingTutor(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const query = search.toLowerCase();
    return bookings.filter((booking) =>
      [booking.student_name || "", booking.student_email || "", booking.tutor_name, booking.subject]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [bookings, search]);

  const filteredApplications = useMemo(() => {
    const query = search.toLowerCase();
    return applications.filter((application) =>
      [
        `${application.first_name} ${application.last_name}`,
        application.email,
        application.subjects.join(" "),
        application.experience,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [applications, search]);

  const pendingApplications = filteredApplications.filter((application) => application.status === "pending");
  const reviewedApplications = filteredApplications.filter((application) => application.status !== "pending");

  const stats = {
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
    completed: bookings.filter((booking) => booking.status === "completed").length,
  };

  const appStats = {
    total: applications.length,
    pending: applications.filter((application) => application.status === "pending").length,
    approved: applications.filter((application) => application.status === "approved").length,
  };

  if (!isAdmin && !loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">{t("admin.accessDenied")}</h1>
          <p className="text-muted-foreground">{t("admin.adminOnly")}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold">{t("admin.title")}</h1>
              <p className="text-muted-foreground">{t("admin.subtitle")}</p>
            </div>

            {activeTab === "tutors" ? (
              <ManualTutorDialog
                buttonLabel="Add Tutor Manually"
                dialogTitle="Add Tutor Manually"
                submitLabel={publishingTutor ? "Publishing..." : "Publish Tutor"}
                cancelLabel="Cancel"
                onSubmit={handleManualTutorPublish}
              />
            ) : null}
          </div>

          <div className="mb-6 flex items-center gap-6 border-b">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${activeTab === "bookings" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Users className="h-4 w-4" />
              {t("admin.bookingsTab")} ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("tutors")}
              className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${activeTab === "tutors" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <GraduationCap className="h-4 w-4" />
              {t("admin.tutorAppsTab")} ({appStats.pending})
            </button>
          </div>

          {activeTab === "bookings" && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: t("admin.totalBookings"), value: stats.total, color: "text-foreground" },
                  { label: t("admin.pendingPayment"), value: stats.pending, color: "text-yellow-600" },
                  { label: t("admin.confirmed"), value: stats.confirmed, color: "text-green-600" },
                  { label: t("admin.completedStat"), value: stats.completed, color: "text-blue-600" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border bg-card p-4">
                    <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("admin.searchPlaceholder")} className="pl-9" />
              </div>

              {loading ? (
                <div className="py-12 text-center text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((booking) => {
                    const sc = statusConfig[booking.status] || statusConfig.pending;
                    const StatusIcon = sc.icon;

                    return (
                      <div key={booking.id} className="rounded-xl border bg-card p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant="outline" className={cn(sc.color, "gap-1")}>
                                <StatusIcon className="h-3 w-3" />
                                {sc.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-semibold">{booking.student_name || "Unknown"} → {booking.tutor_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.subject} · {booking.lesson_date} · {booking.start_time?.slice(0, 5)} – {booking.end_time?.slice(0, 5)} · {booking.duration_minutes}min
                            </p>
                            {booking.student_email ? <p className="text-sm text-muted-foreground">📧 {booking.student_email}</p> : null}
                            {booking.student_message ? <p className="mt-1 text-xs italic text-muted-foreground">“{booking.student_message}”</p> : null}
                            {booking.google_meet_link ? (
                              <a href={booking.google_meet_link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                <Video className="h-3 w-3" /> Google Meet <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : null}
                            {booking.notes && !booking.student_message ? <p className="mt-1 text-xs text-muted-foreground">📝 {booking.notes}</p> : null}
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-bold tabular-nums">{booking.currency}{booking.price_amount.toFixed(2)}</p>
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-2">
                            {booking.status === "pending" ? (
                              <Button size="sm" onClick={() => handleMarkPaid(booking)}>{t("admin.markPaid")}</Button>
                            ) : null}
                            {booking.status === "confirmed" ? (
                              <Button size="sm" variant="outline" onClick={() => handleMarkCompleted(booking)}>{t("admin.markCompleted")}</Button>
                            ) : null}
                            <Button size="sm" variant="outline" onClick={() => {
                              setMeetLinkModal(booking);
                              setMeetLink(booking.google_meet_link || "");
                            }}>
                              <Video className="mr-1 h-3.5 w-3.5" />Meet Link
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              setNotesModal(booking);
                              setAdminNotes(booking.notes || "");
                            }}>
                              📝 Notes
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredBookings.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      {bookings.length === 0 ? t("admin.noBookings") : "No results found"}
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}

          {activeTab === "tutors" && (
            <>
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-foreground">{appStats.total}</p>
                  <p className="text-xs text-muted-foreground">{t("admin.totalApps")}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-yellow-600">{appStats.pending}</p>
                  <p className="text-xs text-muted-foreground">{t("admin.pendingApps")}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-green-600">{appStats.approved}</p>
                  <p className="text-xs text-muted-foreground">{t("admin.approvedApps")}</p>
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("admin.searchTutors")} className="pl-9" />
              </div>

              <section className="mb-8 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Pending Tutor Applications</h2>
                  <p className="text-sm text-muted-foreground">Review new tutor submissions and publish approved profiles to the site instantly.</p>
                </div>
                <TutorApplicationList
                  applications={pendingApplications}
                  emptyLabel={t("admin.noApps")}
                  approveLabel={t("admin.approveTutor")}
                  rejectLabel={t("admin.rejectTutor")}
                  onApprove={handleApproveTutor}
                  onReject={handleRejectTutor}
                  pendingActionId={pendingTutorActionId}
                />
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Reviewed Applications</h2>
                  <p className="text-sm text-muted-foreground">Previously approved and rejected tutor applications.</p>
                </div>
                <TutorApplicationList
                  applications={reviewedApplications}
                  emptyLabel="No reviewed applications yet"
                  approveLabel={t("admin.approveTutor")}
                  rejectLabel={t("admin.rejectTutor")}
                  onApprove={handleApproveTutor}
                  onReject={handleRejectTutor}
                  pendingActionId={pendingTutorActionId}
                />
              </section>
            </>
          )}
        </motion.div>
      </div>

      <Dialog open={!!meetLinkModal} onOpenChange={(open) => !open && setMeetLinkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.addMeetLink")}</DialogTitle>
          </DialogHeader>
          <Input value={meetLink} onChange={(event) => setMeetLink(event.target.value)} placeholder="https://meet.google.com/..." />
          <Button onClick={handleSaveMeetLink} className="w-full">{t("admin.saveMeetLink")}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!notesModal} onOpenChange={(open) => !open && setNotesModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Notes</DialogTitle>
          </DialogHeader>
          <Textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} rows={4} className="resize-none" placeholder="Add notes about this booking..." />
          <Button onClick={handleSaveNotes} className="w-full">Save Notes</Button>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
