import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, ExternalLink, GraduationCap, Search, Shield, Users, Video, CheckCircle, Clock, XCircle } from "lucide-react";

import { Layout } from "@/components/Layout";
import { TutorApplicationList, type TutorApplicationListItem } from "@/components/admin/TutorApplicationList";
import { ManualTutorDialog, type ManualTutorFormValues } from "@/components/admin/ManualTutorDialog";
import { TutorManagementList, type TutorManagementListItem } from "@/components/admin/TutorManagementList";
import { TutorProfileEditorDialog, type TutorProfileEditorValues } from "@/components/admin/TutorProfileEditorDialog";
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
import { getTutorFullName, type PublicTutorProfile } from "@/lib/publicTutors";
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

interface BusinessInquiry {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  team_size: string | null;
  message: string | null;
  created_at: string;
}

const bookingStatusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: "border-warning/30 bg-warning/10 text-warning", icon: Clock, label: "Pending" },
  confirmed: { color: "border-success/30 bg-success/10 text-success", icon: CheckCircle, label: "Confirmed" },
  completed: { color: "border-info/30 bg-info/10 text-info", icon: CheckCircle, label: "Completed" },
  cancelled: { color: "border-destructive/30 bg-destructive/10 text-destructive", icon: XCircle, label: "Cancelled" },
};

function buildLanguagesSpoken(nativeLanguage: string, otherLanguages: string) {
  return [nativeLanguage, otherLanguages]
    .flatMap((value) => value.split(/[;,]/))
    .map((value) => value.trim())
    .filter(Boolean);
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<"bookings" | "tutors" | "enquiries">("bookings");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [applications, setApplications] = useState<TutorApplicationListItem[]>([]);
  const [enquiries, setEnquiries] = useState<BusinessInquiry[]>([]);
  const [tutors, setTutors] = useState<PublicTutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [meetLinkModal, setMeetLinkModal] = useState<AdminBooking | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const [notesModal, setNotesModal] = useState<AdminBooking | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [pendingTutorActionId, setPendingTutorActionId] = useState<string | null>(null);
  const [publishingTutor, setPublishingTutor] = useState(false);
  const [editingTutor, setEditingTutor] = useState<TutorManagementListItem | null>(null);
  const [savingTutorEdit, setSavingTutorEdit] = useState(false);
  const [deletingTutor, setDeletingTutor] = useState<TutorManagementListItem | null>(null);
  const [bookingsTutor, setBookingsTutor] = useState<TutorManagementListItem | null>(null);
  const [hasAutoFocusedPendingApplications, setHasAutoFocusedPendingApplications] = useState(false);

  const refreshBookings = useCallback(async () => {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    setBookings((data as AdminBooking[] | null) ?? []);
  }, []);

  const refreshApplications = useCallback(async () => {
    const { data, error } = await supabase.from("tutor_applications").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    setApplications((data as TutorApplicationListItem[] | null) ?? []);
  }, []);

  const refreshTutorProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from("public_tutor_profiles" as never)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setTutors((data as PublicTutorProfile[] | null) ?? []);
  }, []);

  const refreshAdminData = useCallback(async () => {
    const [bookingResult, applicationResult, tutorResult, enquiryResult] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("tutor_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("public_tutor_profiles" as never).select("*").order("created_at", { ascending: false }),
      supabase.from("business_inquiries").select("*").order("created_at", { ascending: false }),
    ]);

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

    if (tutorResult.error) {
      toast({ title: "Error", description: tutorResult.error.message, variant: "destructive" });
    } else {
      setTutors((tutorResult.data as PublicTutorProfile[] | null) ?? []);
    }

    if (enquiryResult.error) {
      toast({ title: "Error", description: enquiryResult.error.message, variant: "destructive" });
    } else {
      setEnquiries((enquiryResult.data as BusinessInquiry[] | null) ?? []);
    }
  }, [toast]);

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

      await refreshAdminData();

      if (!cancelled) {
        setLoading(false);
      }
    };

    void loadAdminState();
    return () => {
      cancelled = true;
    };
  }, [refreshAdminData, toast, user]);

  useEffect(() => {
    if (!isAdmin) return;

    const handleFocusRefresh = () => {
      void refreshAdminData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshAdminData();
      }
    };

    window.addEventListener("focus", handleFocusRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocusRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAdmin, refreshAdminData]);

  useEffect(() => {
    setSearch("");
  }, [activeTab]);

  useEffect(() => {
    if (hasAutoFocusedPendingApplications) return;

    const hasPendingApplications = applications.some((application) => application.status === "pending");
    if (hasPendingApplications) {
      setActiveTab("tutors");
      setHasAutoFocusedPendingApplications(true);
    }
  }, [applications, hasAutoFocusedPendingApplications]);

  const sendTutorDecisionNotification = async (application: TutorApplicationListItem, decision: "approved" | "rejected") => {
    const fullName = `${application.first_name} ${application.last_name}`.trim();

    // Send email via edge function
    try {
      await supabase.functions.invoke("notify-tutor-decision", {
        body: {
          email: application.email,
          first_name: application.first_name,
          last_name: application.last_name,
          decision,
        },
      });
    } catch (err) {
      console.error("Edge function email failed:", err);
    }

    // Also notify via Formspree
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

  const invokeManageTutor = async (tutorId: string, action: "suspend" | "unsuspend" | "delete") => {
    const { error } = await supabase.functions.invoke("admin-manage-tutor", {
      body: { tutorProfileId: tutorId, action },
    });
    if (error) throw error;
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

    const { error } = await supabase.from("bookings").update({ google_meet_link: meetLink.trim() || null }).eq("id", meetLinkModal.id);

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

      await Promise.all([refreshApplications(), refreshTutorProfiles()]);
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

      await Promise.all([refreshApplications(), refreshTutorProfiles()]);
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

  const handleSetTutorLiveState = async (tutor: TutorManagementListItem, makeLive: boolean) => {
    setPendingTutorActionId(tutor.id);

    try {
      if (makeLive) {
        // Unsuspend via edge function (removes is_suspended flag + republishes + sends email)
        await invokeManageTutor(tutor.id, "unsuspend");

        // Also approve application if needed
        if (tutor.application_id) {
          const application = applications.find((item) => item.id === tutor.application_id);
          if (application && application.status !== "approved") {
            await supabase.rpc("approve_tutor_application", { _application_id: application.id });
          }
        }
      } else {
        // Suspend via edge function (sets is_suspended + unpublishes + sends email)
        await invokeManageTutor(tutor.id, "suspend");
      }

      toast({ title: makeLive ? "Tutor is live" : "Tutor suspended" });
      await Promise.all([refreshApplications(), refreshTutorProfiles()]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to update tutor status.",
        variant: "destructive",
      });
    } finally {
      setPendingTutorActionId(null);
    }
  };

  const handleDeleteTutor = async () => {
    if (!deletingTutor) return;

    setPendingTutorActionId(deletingTutor.id);
    try {
      const { error } = await supabase.functions.invoke("admin-delete-tutor", {
        body: { tutorProfileId: deletingTutor.id },
      });
      if (error) throw error;

      toast({ title: "Tutor deleted permanently" });
      setDeletingTutor(null);
      await Promise.all([refreshApplications(), refreshTutorProfiles(), refreshBookings()]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to delete tutor.",
        variant: "destructive",
      });
    } finally {
      setPendingTutorActionId(null);
    }
  };

  const handleSaveTutorProfile = async (values: TutorProfileEditorValues) => {
    if (!editingTutor) return;

    setSavingTutorEdit(true);
    const payload = {
      primary_subject: values.primarySubject.trim(),
      subjects: values.subjects,
      experience: values.experience.trim(),
      hourly_rate: Number(values.hourlyRate),
      country: values.country.trim() || null,
      native_language: values.nativeLanguage.trim() || null,
      other_languages: values.otherLanguages.trim() || null,
      languages_spoken: buildLanguagesSpoken(values.nativeLanguage, values.otherLanguages),
      bio: values.bio.trim(),
      education: values.education.trim() || null,
      certifications: values.certifications.trim() || null,
      avatar_url: values.avatarUrl.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error: profileError } = await supabase
        .from("public_tutor_profiles" as never)
        .update(payload as never)
        .eq("id", editingTutor.id);

      if (profileError) throw profileError;

      if (editingTutor.application_id) {
        const { error: applicationError } = await supabase
          .from("tutor_applications")
          .update({
            subjects: values.subjects,
            experience: values.experience.trim(),
            hourly_rate: Number(values.hourlyRate),
            country: values.country.trim() || null,
            native_language: values.nativeLanguage.trim() || null,
            other_languages: values.otherLanguages.trim() || null,
            bio: values.bio.trim(),
            education: values.education.trim() || null,
            certifications: values.certifications.trim() || null,
          })
          .eq("id", editingTutor.application_id);

        if (applicationError) throw applicationError;
      }

      toast({ title: "Tutor profile updated" });
      setEditingTutor(null);
      await Promise.all([refreshApplications(), refreshTutorProfiles()]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to save tutor profile.",
        variant: "destructive",
      });
    } finally {
      setSavingTutorEdit(false);
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

      await refreshTutorProfiles();
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
      [booking.student_name || "", booking.student_email || "", booking.tutor_name, booking.subject].join(" ").toLowerCase().includes(query),
    );
  }, [bookings, search]);

  const filteredApplications = useMemo(() => {
    const query = search.toLowerCase();
    return applications.filter((application) =>
      [`${application.first_name} ${application.last_name}`, application.email, application.subjects.join(" "), application.experience]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [applications, search]);

  const managedTutors = useMemo<TutorManagementListItem[]>(() => {
    return tutors.map((tutor) => {
      const tutorName = getTutorFullName(tutor);
      const tutorBookings = bookings.filter((booking) => booking.tutor_name === tutorName);
      const completedLessons = tutorBookings.filter((booking) => booking.status === "completed");
      const totalEarnings = completedLessons.reduce((sum, booking) => sum + booking.price_amount, 0);

      return {
        ...tutor,
        bookingsCount: tutorBookings.length,
        completedLessonsCount: completedLessons.length,
        totalEarnings,
      };
    });
  }, [bookings, tutors]);

  const filteredManagedTutors = useMemo(() => {
    const query = search.toLowerCase();
    return managedTutors.filter((tutor) =>
      [getTutorFullName(tutor), tutor.email ?? "", tutor.primary_subject, tutor.subjects.join(" "), tutor.experience, tutor.country ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [managedTutors, search]);

  const pendingApplications = filteredApplications.filter((application) => application.status === "pending");
  const reviewedApplications = filteredApplications.filter((application) => application.status !== "pending");

  const selectedTutorBookings = useMemo(() => {
    if (!bookingsTutor) return [];
    const tutorName = getTutorFullName(bookingsTutor);
    return bookings.filter((booking) => booking.tutor_name === tutorName);
  }, [bookings, bookingsTutor]);

  const tutorBookingSummary = useMemo(() => {
    const completed = selectedTutorBookings.filter((booking) => booking.status === "completed");
    return {
      total: selectedTutorBookings.length,
      completed: completed.length,
      earnings: completed.reduce((sum, booking) => sum + booking.price_amount, 0),
    };
  }, [selectedTutorBookings]);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
    completed: bookings.filter((booking) => booking.status === "completed").length,
  };

  const tutorStats = {
    total: managedTutors.length,
    live: managedTutors.filter((tutor) => tutor.is_published).length,
    suspended: managedTutors.filter((tutor) => !tutor.is_published).length,
    pending: applications.filter((application) => application.status === "pending").length,
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

          <div className="mb-6 flex items-center gap-6 border-b border-border">
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
              Tutor management ({tutorStats.total})
            </button>
            <button
              onClick={() => setActiveTab("enquiries")}
              className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${activeTab === "enquiries" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Building2 className="h-4 w-4" />
              Enquiries ({enquiries.length})
            </button>
          </div>

          {activeTab === "bookings" && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: t("admin.totalBookings"), value: stats.total, color: "text-foreground" },
                  { label: t("admin.pendingPayment"), value: stats.pending, color: "text-warning" },
                  { label: t("admin.confirmed"), value: stats.confirmed, color: "text-success" },
                  { label: t("admin.completedStat"), value: stats.completed, color: "text-info" },
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
                    const sc = bookingStatusConfig[booking.status] || bookingStatusConfig.pending;
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
                            {booking.status === "pending" ? <Button size="sm" onClick={() => handleMarkPaid(booking)}>{t("admin.markPaid")}</Button> : null}
                            {booking.status === "confirmed" ? <Button size="sm" variant="outline" onClick={() => handleMarkCompleted(booking)}>{t("admin.markCompleted")}</Button> : null}
                            <Button size="sm" variant="outline" onClick={() => { setMeetLinkModal(booking); setMeetLink(booking.google_meet_link || ""); }}>
                              <Video className="mr-1 h-3.5 w-3.5" />Meet Link
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setNotesModal(booking); setAdminNotes(booking.notes || ""); }}>
                              📝 Notes
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredBookings.length === 0 ? <div className="py-12 text-center text-muted-foreground">{bookings.length === 0 ? t("admin.noBookings") : "No results found"}</div> : null}
                </div>
              )}
            </>
          )}

          {activeTab === "tutors" && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-foreground">{tutorStats.total}</p>
                  <p className="text-xs text-muted-foreground">Tutors</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-success">{tutorStats.live}</p>
                  <p className="text-xs text-muted-foreground">Live</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-warning">{tutorStats.suspended}</p>
                  <p className="text-xs text-muted-foreground">Suspended</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-info">{tutorStats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending applications</p>
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tutors, subjects, or bookings" className="pl-9" />
              </div>

              <section className="mb-8 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Live & suspended tutors</h2>
                  <p className="text-sm text-muted-foreground">Approve, suspend, delete, edit, and inspect tutor bookings and earnings.</p>
                </div>
                <TutorManagementList
                  tutors={filteredManagedTutors}
                  emptyLabel="No tutors found"
                  pendingActionId={pendingTutorActionId}
                  onApprove={(tutor) => void handleSetTutorLiveState(tutor, true)}
                  onSuspend={(tutor) => void handleSetTutorLiveState(tutor, !tutor.is_published)}
                  onDelete={setDeletingTutor}
                  onEdit={setEditingTutor}
                  onViewBookings={setBookingsTutor}
                />
              </section>

              <section className="mb-8 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Pending tutor applications</h2>
                  <p className="text-sm text-muted-foreground">Review new tutor submissions before they go live.</p>
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
                  <h2 className="text-lg font-semibold">Reviewed applications</h2>
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

          {activeTab === "enquiries" && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-foreground">{enquiries.length}</p>
                  <p className="text-xs text-muted-foreground">Total enquiries</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-info">
                    {enquiries.filter((e) => {
                      const d = new Date(e.created_at);
                      const now = new Date();
                      return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
                    }).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-muted-foreground">Loading...</div>
              ) : enquiries.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No business enquiries yet</div>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((enquiry) => (
                    <div key={enquiry.id} className="rounded-xl border bg-card p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-semibold">{enquiry.company_name}</p>
                          <p className="text-sm text-muted-foreground">{enquiry.contact_name} · {enquiry.email}</p>
                          {enquiry.phone && <p className="text-sm text-muted-foreground">📞 {enquiry.phone}</p>}
                          {enquiry.team_size && <p className="text-sm text-muted-foreground">👥 Team size: {enquiry.team_size}</p>}
                          {enquiry.message && <p className="mt-2 text-sm italic text-muted-foreground">"{enquiry.message}"</p>}
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{new Date(enquiry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      <Dialog open={!!bookingsTutor} onOpenChange={(open) => !open && setBookingsTutor(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{bookingsTutor ? `${getTutorFullName(bookingsTutor)} · bookings & earnings` : "Tutor bookings"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Bookings</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{tutorBookingSummary.total}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{tutorBookingSummary.completed}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Earnings</p>
              <p className="mt-1 text-2xl font-bold text-foreground">${tutorBookingSummary.earnings.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {selectedTutorBookings.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">No bookings for this tutor yet.</div>
            ) : (
              selectedTutorBookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{booking.student_name || "Unknown student"} · {booking.subject}</p>
                      <p className="text-sm text-muted-foreground">{booking.lesson_date} · {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={cn((bookingStatusConfig[booking.status] || bookingStatusConfig.pending).color)}>{booking.status}</Badge>
                      <p className="mt-2 text-sm font-semibold text-foreground">{booking.currency}{booking.price_amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingTutor} onOpenChange={(open) => !open && setDeletingTutor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete tutor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this tutor? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingTutor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTutor} disabled={!deletingTutor || pendingTutorActionId === deletingTutor?.id}>Delete tutor</Button>
          </div>
        </DialogContent>
      </Dialog>

      <TutorProfileEditorDialog
        open={!!editingTutor}
        tutor={editingTutor}
        saving={savingTutorEdit}
        onOpenChange={(open) => !open && setEditingTutor(null)}
        onSubmit={handleSaveTutorProfile}
      />
    </Layout>
  );
}
