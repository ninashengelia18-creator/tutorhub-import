import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Eye, Loader2, Save } from "lucide-react";
import { TutorProfilePreviewDialog } from "@/components/tutor/TutorProfilePreviewDialog";
import { motion } from "framer-motion";

import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TIMEZONE_OPTIONS } from "@/contexts/AppLocaleContext";
import type { PublicTutorProfile } from "@/lib/publicTutors";

const experienceOptions = ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

export default function TutorProfileEdit() {
  const { user, profile: authProfile, refreshProfile, updateProfileState } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<PublicTutorProfile | null>(null);

  // Core fields
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [experience, setExperience] = useState("");
  const [country, setCountry] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [otherLanguages, setOtherLanguages] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  // Extended fields from application
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("");
  const [availability, setAvailability] = useState("");
  const [aboutTeaching, setAboutTeaching] = useState("");
  const [subjectText, setSubjectText] = useState("");

  // Load application data for extra fields
  const [appData, setAppData] = useState<Record<string, string | null>>({});

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase.rpc("ensure_my_tutor_profile" as never);

    if (error) {
      toast({ title: "Unable to load profile", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const profile = data as PublicTutorProfile | null;
    setTutorProfile(profile);

    if (profile) {
      setBio(profile.bio || "");
      setEducation(profile.education || "");
      setCertifications(profile.certifications || "");
      setExperience(profile.experience || "");
      setCountry(profile.country || "");
      setNativeLanguage(profile.native_language || "");
      setOtherLanguages(profile.other_languages || "");
      setHourlyRate(String(profile.hourly_rate || ""));
      setSubjectText(profile.subjects?.join(", ") || "");

      // Load extra fields from application
      if (profile.email) {
        const { data: appRow } = await supabase
          .from("tutor_applications")
          .select("phone, timezone, availability, about_teaching")
          .eq("email", profile.email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (appRow) {
          const app = appRow as Record<string, string | null>;
          setAppData(app);
          setPhone(app.phone || "");
          setTimezone(app.timezone || "");
          setAvailability(app.availability || "");
          setAboutTeaching(app.about_teaching || "");
        }
      }
    }

    setLoading(false);
  }, [toast, user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = urlData.publicUrl;

    const { error } = await supabase.rpc("save_my_tutor_profile" as never, {
      _bio: bio,
      _experience: experience,
      _hourly_rate: Number(hourlyRate) || 0,
      _country: country || null,
      _native_language: nativeLanguage || null,
      _other_languages: otherLanguages || null,
      _education: education || null,
      _certifications: certifications || null,
      _avatar_url: avatarUrl,
      _subjects: subjectText ? subjectText.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
      _phone: phone || null,
      _timezone: timezone || null,
      _availability: availability || null,
      _about_teaching: aboutTeaching || null,
    } as never);

    if (error) {
      toast({ title: "Failed to update avatar", description: error.message, variant: "destructive" });
    } else {
      setTutorProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev);
      updateProfileState({ avatar_url: avatarUrl, display_name: authProfile?.display_name ?? null });
      await refreshProfile();
      toast({ title: "Photo updated" });
    }

    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { data, error } = await supabase.rpc("save_my_tutor_profile" as never, {
      _bio: bio,
      _experience: experience,
      _hourly_rate: Number(hourlyRate) || 0,
      _country: country || null,
      _native_language: nativeLanguage || null,
      _other_languages: otherLanguages || null,
      _education: education || null,
      _certifications: certifications || null,
      _avatar_url: tutorProfile?.avatar_url || null,
      _subjects: subjectText ? subjectText.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
      _phone: phone || null,
      _timezone: timezone || null,
      _availability: availability || null,
      _about_teaching: aboutTeaching || null,
    } as never);

    setSaving(false);

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      return;
    }

    setTutorProfile(data as PublicTutorProfile);
    toast({ title: "Profile updated successfully" });
  };

  if (loading) {
    return (
      <Layout hideFooter>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!tutorProfile) {
    return (
      <Layout hideFooter>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="mt-2 text-muted-foreground">We couldn't create your tutor profile automatically yet.</p>
          <Button className="mt-6" onClick={() => void loadProfile()}>Try again</Button>
        </div>
      </Layout>
    );
  }

  const initials = `${tutorProfile.first_name?.[0] || ""}${tutorProfile.last_name?.[0] || ""}`.toUpperCase();

  return (
    <Layout hideFooter>
      <div className="container max-w-3xl py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Edit Your Profile</h1>
              <p className="text-sm text-muted-foreground">Your tutor application details are prefilled here and can now be updated anytime.</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/tutor/${tutorProfile.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Preview Profile
              </Link>
            </Button>
          </div>

          {/* Photo Section */}
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Photo</h2>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={tutorProfile.avatar_url || undefined} alt={tutorProfile.first_name} />
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <Button type="button" size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
              </div>
              <div>
                <p className="font-medium">{tutorProfile.first_name} {tutorProfile.last_name}</p>
                <p className="text-sm text-muted-foreground">{tutorProfile.email}</p>
              </div>
            </div>
          </section>

          {/* Subjects */}
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">Subjects</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {tutorProfile.subjects.map((subject) => (
                <Badge key={subject} variant="secondary">{subject}</Badge>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Update subjects (comma-separated)</Label>
              <Input value={subjectText} onChange={(e) => setSubjectText(e.target.value)} placeholder="English, Mathematics, Science" />
            </div>
          </section>

          {/* Personal Info */}
          <section className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Personal Information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Native Language</Label>
                <Input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)} placeholder="English" />
              </div>
              <div className="space-y-2">
                <Label>Other Languages</Label>
                <Input value={otherLanguages} onChange={(e) => setOtherLanguages(e.target.value)} placeholder="Spanish, French" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Qualifications */}
          <section className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Qualifications</h2>

            <div className="space-y-2">
              <Label>Teaching Experience</Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Education</Label>
              <Textarea value={education} onChange={(e) => setEducation(e.target.value)} rows={2} placeholder="Your education background" />
            </div>

            <div className="space-y-2">
              <Label>Certifications</Label>
              <Textarea value={certifications} onChange={(e) => setCertifications(e.target.value)} rows={2} placeholder="TEFL, CELTA, etc." />
            </div>
          </section>

          {/* Bio & Teaching */}
          <section className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">About You & Teaching</h2>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Tell students about yourself..." />
            </div>

            <div className="space-y-2">
              <Label>About Your Teaching Style</Label>
              <Textarea value={aboutTeaching} onChange={(e) => setAboutTeaching(e.target.value)} rows={3} placeholder="How do you approach lessons? What makes your teaching unique?" />
            </div>
          </section>

          {/* Availability & Rate */}
          <section className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Availability & Pricing</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hourly Rate (USD)</Label>
                <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="25" />
              </div>
              <div className="space-y-2">
                <Label>General Availability</Label>
                <Input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Weekdays 9am-5pm EST" />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link to="/tutor-dashboard">Cancel</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/tutor/${tutorProfile.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Preview Profile
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
