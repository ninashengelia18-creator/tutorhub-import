import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, ExternalLink, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";

import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { PublicTutorProfile } from "@/lib/publicTutors";

export default function TutorProfileEdit() {
  const { user, profile: authProfile, refreshProfile, updateProfileState } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<PublicTutorProfile | null>(null);

  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [experience, setExperience] = useState("");
  const [country, setCountry] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [otherLanguages, setOtherLanguages] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

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

    const { error } = await supabase.rpc("save_my_tutor_profile", {
      _bio: bio,
      _experience: experience,
      _hourly_rate: Number(hourlyRate) || 0,
      _country: country || null,
      _native_language: nativeLanguage || null,
      _other_languages: otherLanguages || null,
      _education: education || null,
      _certifications: certifications || null,
      _avatar_url: avatarUrl,
    });

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

    const { data, error } = await supabase.rpc("save_my_tutor_profile", {
      _bio: bio,
      _experience: experience,
      _hourly_rate: Number(hourlyRate) || 0,
      _country: country || null,
      _native_language: nativeLanguage || null,
      _other_languages: otherLanguages || null,
      _education: education || null,
      _certifications: certifications || null,
      _avatar_url: tutorProfile?.avatar_url || null,
    });

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
          <p className="mt-2 text-muted-foreground">We couldn’t create your tutor profile automatically yet.</p>
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
                Preview
              </Link>
            </Button>
          </div>

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

          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">Subjects</h2>
            <div className="flex flex-wrap gap-2">
              {tutorProfile.subjects.map((subject) => (
                <Badge key={subject} variant="secondary">{subject}</Badge>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">About You</h2>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Tell students about yourself..." />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Experience</Label>
                <Input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5+ years" />
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate (USD)</Label>
                <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="25" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
              </div>
              <div className="space-y-2">
                <Label>Native Language</Label>
                <Input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)} placeholder="English" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Other Languages</Label>
              <Input value={otherLanguages} onChange={(e) => setOtherLanguages(e.target.value)} placeholder="Spanish, French" />
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

          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link to="/tutor-dashboard">Cancel</Link>
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
