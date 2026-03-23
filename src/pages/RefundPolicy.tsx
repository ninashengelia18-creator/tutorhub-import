import { Layout } from "@/components/Layout";

export default function RefundPolicy() {
  return (
    <Layout>
      <div className="container max-w-3xl py-16">
        <h1 className="text-3xl font-bold text-foreground mb-8">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 23, 2025</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Session Cancellations</h2>
            <p className="text-muted-foreground leading-relaxed">Students may cancel a booked session up to 12 hours before the scheduled start time for a full refund. Cancellations made less than 12 hours before the session are non-refundable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Tutor Cancellations</h2>
            <p className="text-muted-foreground leading-relaxed">If a tutor cancels a session, the student will receive a full refund or the option to reschedule at no additional cost.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">No-Shows</h2>
            <p className="text-muted-foreground leading-relaxed">If a student fails to attend a session without prior cancellation, no refund will be issued. If a tutor fails to attend, the student will receive a full refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Technical Issues</h2>
            <p className="text-muted-foreground leading-relaxed">If a session cannot proceed due to a technical issue on our platform, the student will receive a full refund or a complimentary rescheduled session.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Disputed Sessions</h2>
            <p className="text-muted-foreground leading-relaxed">Refund disputes must be submitted within 48 hours of the session via our contact page. LearnEazy will review and respond within 3 business days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">How Refunds Are Processed</h2>
            <p className="text-muted-foreground leading-relaxed">Approved refunds are returned via the original payment method within 5-10 business days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For refund requests please contact us at <a href="mailto:info@learneazy.org" className="text-primary hover:underline">info@learneazy.org</a>.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
