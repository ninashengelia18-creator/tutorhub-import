import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Edit, Eye, MessageSquare, Star, Users } from "lucide-react";
import { motion } from "framer-motion";

import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { PublicPartnerProfile } from "@/lib/publicPartners";
import { getPartnerAvatar } from "@/lib/publicPartners";

export default function PartnerDashboard() {
  const { profile: authProfile } = useAuth();
  const [partnerProfile, setPartnerProfile] = useState<PublicPartnerProfile | null>(null);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const displayName = authProfile?.display_name || "Partner";

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc("ensure_my_partner_profile" as never);
    setPartnerProfile(data as PublicPartnerProfile | null);

    // Count upcoming bookings
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("tutor_name", displayName)
      .gte("lesson_date", today)
      .in("status", ["pending", "confirmed"]);
    setUpcomingCount(count ?? 0);

    setLoading(false);
  }, [displayName]);

  useEffect(() => { void load(); }, [load]);

  const initials = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Layout hideFooter>
      <div className="container max-w-5xl py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Hero */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-2xl">
                <AvatarImage src={partnerProfile ? getPartnerAvatar(partnerProfile) : undefined} />
                <AvatarFallback className="rounded-2xl text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome, {displayName.split(" ")[0]}!</h1>
                <p className="text-sm text-muted-foreground">Conversation Partner Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/partner-profile-edit"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Number(partnerProfile?.rating ?? 5).toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partnerProfile?.review_count ?? 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick links */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {}}>
              <Link to="/partner-messages" className="block p-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Messages</p>
                    <p className="text-sm text-muted-foreground">Chat with your students</p>
                  </div>
                </div>
              </Link>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link to="/partner-schedule" className="block p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Schedule</p>
                    <p className="text-sm text-muted-foreground">Manage your availability</p>
                  </div>
                </div>
              </Link>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
