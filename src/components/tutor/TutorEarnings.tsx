import { useEffect, useMemo, useState } from "react";
import { DollarSign, TrendingUp, Wallet, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { submitFormspree } from "@/lib/formspree";
import { toast } from "sonner";

interface EarningRecord {
  id: string;
  booking_id: string;
  student_name: string | null;
  subject: string;
  lesson_date: string;
  lesson_start_at: string | null;
  duration_minutes: number;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  is_trial: boolean;
  payout_status: string;
  created_at: string;
}

interface Props {
  tutorName: string;
}

function getCommissionRate(totalHours: number): number {
  if (totalHours >= 100) return 0.15;
  if (totalHours >= 50) return 0.17;
  if (totalHours >= 20) return 0.19;
  return 0.22;
}

export function TutorEarnings({ tutorName }: Props) {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState("wise");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tutorName) return;
    const load = async () => {
      const { data } = await supabase
        .from("tutor_earnings")
        .select("*")
        .eq("tutor_name", tutorName)
        .order("lesson_date", { ascending: false });
      setEarnings((data as EarningRecord[]) ?? []);
      setLoading(false);
    };
    void load();
  }, [tutorName]);

  const stats = useMemo(() => {
    const totalEarned = earnings.reduce((s, e) => s + e.net_amount, 0);
    const pending = earnings
      .filter((e) => e.payout_status === "pending" && !e.is_trial)
      .reduce((s, e) => s + e.net_amount, 0);
    const withdrawn = earnings
      .filter((e) => e.payout_status === "paid")
      .reduce((s, e) => s + e.net_amount, 0);
    const totalHours = earnings.reduce((s, e) => s + e.duration_minutes, 0) / 60;
    const currentRate = getCommissionRate(totalHours);
    return { totalEarned, pending, withdrawn, totalHours, currentRate };
  }, [earnings]);

  const handlePayout = async () => {
    if (!payoutDetails.trim() || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("payout_requests").insert([
        {
          tutor_name: tutorName,
          tutor_user_id: user.id,
          amount: stats.pending,
          payment_method: payoutMethod,
          payment_details: payoutDetails.trim(),
        },
      ]);
      if (error) throw error;

      await submitFormspree({
        email: "hello@learneazy.org",
        _subject: `Payout request from ${tutorName}`,
        tutor_name: tutorName,
        amount: `$${stats.pending.toFixed(2)}`,
        payment_method: payoutMethod,
        payment_details: payoutDetails.trim(),
      });

      toast.success("Payout request submitted! We'll process it within 3-5 business days.");
      setPayoutOpen(false);
      setPayoutDetails("");
    } catch {
      toast.error("Failed to submit payout request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading earnings…</p>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">${stats.totalEarned.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Net earnings to date</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Wallet className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">${stats.pending.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Available for payout</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Withdrawn</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">${stats.withdrawn.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total paid out</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commission Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{((1 - stats.currentRate) * 100).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalHours.toFixed(0)}h taught · You keep {((1 - stats.currentRate) * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Button */}
      {stats.pending > 0 && (
        <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Wallet className="mr-2 h-4 w-4" />
              Request Payout · ${stats.pending.toFixed(2)}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Your available balance is <strong>${stats.pending.toFixed(2)}</strong>. Payouts are processed within 3-5 business days.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wise">Wise (TransferWise)</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{payoutMethod === "wise" ? "Wise Email Address" : "Bank Details (IBAN, Bank Name)"}</Label>
                <Textarea
                  placeholder={payoutMethod === "wise" ? "your@email.com" : "IBAN: ...\nBank: ...\nAccount holder: ..."}
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayoutOpen(false)}>Cancel</Button>
              <Button onClick={handlePayout} disabled={submitting || !payoutDetails.trim()}>
                {submitting ? "Submitting…" : `Request $${stats.pending.toFixed(2)}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Sessions Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No earnings recorded yet. Earnings will appear here after completed sessions.
            </p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(e.lesson_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </TableCell>
                      <TableCell>{e.student_name || "—"}</TableCell>
                      <TableCell className="text-right">{e.duration_minutes}m</TableCell>
                      <TableCell className="text-right">${e.gross_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {e.is_trial ? "Trial (100%)" : `${(e.commission_rate * 100).toFixed(0)}%`}
                        {" "}(${e.commission_amount.toFixed(2)})
                      </TableCell>
                      <TableCell className="text-right font-medium">${e.net_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          e.payout_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : e.is_trial
                              ? "bg-muted text-muted-foreground"
                              : "bg-amber-100 text-amber-700"
                        }`}>
                          {e.is_trial ? "Trial" : e.payout_status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Tiers */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Commission Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Trial lessons</span>
              <span className="font-medium">Platform takes 100%</span>
            </div>
            <div className={`flex justify-between py-1 border-b border-border ${stats.totalHours < 20 ? "text-primary font-semibold" : ""}`}>
              <span className={stats.totalHours < 20 ? "" : "text-muted-foreground"}>0–20 hours</span>
              <span>You keep 78%</span>
            </div>
            <div className={`flex justify-between py-1 border-b border-border ${stats.totalHours >= 20 && stats.totalHours < 50 ? "text-primary font-semibold" : ""}`}>
              <span className={stats.totalHours >= 20 && stats.totalHours < 50 ? "" : "text-muted-foreground"}>20–50 hours</span>
              <span>You keep 81%</span>
            </div>
            <div className={`flex justify-between py-1 border-b border-border ${stats.totalHours >= 50 && stats.totalHours < 100 ? "text-primary font-semibold" : ""}`}>
              <span className={stats.totalHours >= 50 && stats.totalHours < 100 ? "" : "text-muted-foreground"}>50–100 hours</span>
              <span>You keep 83%</span>
            </div>
            <div className={`flex justify-between py-1 ${stats.totalHours >= 100 ? "text-primary font-semibold" : ""}`}>
              <span className={stats.totalHours >= 100 ? "" : "text-muted-foreground"}>100+ hours</span>
              <span>You keep 85%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
