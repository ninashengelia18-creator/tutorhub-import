import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Eye, Loader2, Save } from "lucide-react";
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
import type { PublicPartnerProfile } from "@/lib/publicPartners";

export default function PartnerProfileEdit() {
  const { user, profile: authProfile, refreshProfile, updateProfileState } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState<PublicPartnerProfile | null>(null);

  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [otherLanguages, setOtherLanguages] = useState("");
  const [topicsText, setTopicsText] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");
  const [availability, setAvailability] = useState("");
  const [timezone, setTimezone] = useState("");
  const [videoIntroUrl, setVideoIntroUrl] = useState("");

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase.rpc("ensure_my_partner_profile" as never);
    if (error) {
      toast({ title: "Unable to load profile", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const p = data as PublicPartnerProfile | null;
    setPartnerProfile(p);

    if (p) {
      setBio(p.bio || "");
      setCountry(p.country || "");
      setNativeLanguage(p.native_language || "");
      setOtherLanguages(p.other_languages || "");
      setTopicsText(p.topics?.join(", ") || "");
      setPricePerSession(String(p.price_per_session || ""));
      setAvailability(p.availability || "");
      setTimezone(p.timezone || "");
      setVideoIntroUrl(p.video_intro_url || "");
    }

    setLoading(false);
  }, [toast, user]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    await handleSave(urlData.publicUrl);
    setUploading(false);
  };

  const handleSave = async (avatarOverride?: string) => {
    setSaving(true);
    const { data, error } = await supabase.rpc("save_my_partner_profile" as never, {
      _bio: bio,
      _price_per_session: Number(pricePerSession) || 0,
      _country: country || null,
      _native_language: nativeLanguage || null,
      _other_languages: otherLanguages || null,
      _avatar_url: avatarOverride || partnerProfile?.avatar_url || null,
      _topics: topicsText ? topicsText.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
      _timezone: timezone || null,
      _availability: availability || null,
      _video_intro_url: videoIntroUrl || null,
    } as never);

    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    setPartnerProfile(result as PublicPartnerProfile);
    if (avatarOverride) {
      updateProfileState({ avatar_url: avatarOverride, display_name: authProfile?.display_name ?? null });
      await refreshProfile();
    }
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

  if (!partnerProfile) {
    return (
      <Layout hideFooter>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="mt-2 text-muted-foreground">We couldn't create your partner profile automatically yet.</p>
          <Button className="mt-6" onClick={() => void loadProfile()}>Try again</Button>
        </div>
      </Layout>
    );
  }

  const initials = `${partnerProfile.first_name?.[0] || ""}${partnerProfile.last_name?.[0] || ""}`.toUpperCase();

  return (
    <Layout hideFooter>
      <div className="container max-w-3xl py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Edit Your Profile</h1>
              <p className="text-sm text-muted-foreground">This is how students will see you when browsing conversation partners.</p>
            </div>
          </div>

          {/* Photo */}
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Photo</h2>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={partnerProfile.avatar_url || undefined} alt={partnerProfile.first_name} />
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <Button type="button" size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
              </div>
              <div>
                <p className="font-medium">{partnerProfile.first_name} {partnerProfile.last_name}</p>
                <p className="text-sm text-muted-foreground">{partnerProfile.email}</p>
              </div>
            </div>
          </section>

          {/* Personal Info */}
          <section className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country / Accent</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
              </div>
              <div className="space-y-2">
                <Label>Native Language</Label>
                <Input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)} placeholder="English" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Other Languages Spoken</Label>
                <Input value={otherLanguages} onChange={(e) => setOtherLanguages(e.target.value)} placeholder="Spanish, French" />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger><SelectValue placeholder="Select your timezone" /></SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">About You</h2>
            <div className="space-y-2">
              <Label>Bio / About Me</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Tell students about yourself in a casual, friendly tone..." />
            </div>
            <div className="space-y-2">
              <Label>Topics You Enjoy Talking About</Label>
              <Input value={topicsText} onChange={(e) => setTopicsText(e.target.value)} placeholder="Travel, Sports, Business, Culture, Music" />
              <p className="text-xs text-muted-foreground">Comma-separated list of topics</p>
              {partnerProfile.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {partnerProfile.topics.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Video Introduction Link</Label>
              <Input value={videoIntroUrl} onChange={(e) => setVideoIntroUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              <p className="text-xs text-muted-foreground">A short video introduction helps students get to know you</p>
            </div>
          </section>

          {/* Availability & Pricing */}
          <section className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Availability & Pricing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Price Per Session (USD)</Label>
                <Input type="number" value={pricePerSession} onChange={(e) => setPricePerSession(e.target.value)} placeholder="15" />
              </div>
              <div className="space-y-2">
                <Label>General Availability</Label>
                <Input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Weekdays 6pm–9pm EST" />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link to="/partner-dashboard">Cancel</Link>
            </Button>
            <Button onClick={() => handleSave()} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
