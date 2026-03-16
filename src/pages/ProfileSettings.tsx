import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { StudentSettingsPanels } from "@/components/profile/StudentSettingsPanels";
import {
  StudentSettingsSection,
  StudentSettingsSidebar,
} from "@/components/profile/StudentSettingsSidebar";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function ProfileSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<StudentSettingsSection>("account");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    void fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (data) {
      setDisplayName(data.display_name || "");
      setAvatarUrl(data.avatar_url);
    }

    setInitialLoading(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please upload an image file.", variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Error", description: "File must be smaller than 2MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    await supabase.storage.from("avatars").remove([filePath]);

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Error", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const url = `${publicUrl.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: url, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
    } else {
      setAvatarUrl(url);
      toast({ title: "Profile image updated" });
    }

    setUploading(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Changes saved" });
    }

    setLoading(false);
  };

  const initials = useMemo(() => {
    if (!displayName.trim()) return user?.email?.[0]?.toUpperCase() || "?";

    return displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [displayName, user?.email]);

  const firstName = displayName.split(" ")[0] || "";
  const lastName = displayName.split(" ").slice(1).join(" ");

  if (initialLoading) {
    return (
      <Layout hideFooter>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="container py-10 md:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16 xl:gap-24">
          <StudentSettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          <StudentSettingsPanels
            activeSection={activeSection}
            email={user?.email || ""}
            avatarUrl={avatarUrl}
            initials={initials}
            firstName={firstName}
            lastName={lastName}
            loading={loading}
            uploading={uploading}
            fileInputRef={fileInputRef}
            onAvatarUpload={handleAvatarUpload}
            onFirstNameChange={(value) => setDisplayName(`${value} ${lastName}`.trim())}
            onLastNameChange={(value) => setDisplayName(`${firstName} ${value}`.trim())}
            onSaveAccount={handleSave}
          />
        </div>
      </div>
    </Layout>
  );
}
