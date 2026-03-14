import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, CreditCard, Shield, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const paymentMethods = [
  { id: "payge", name: "TBC PayGe", description: "გადაიხადეთ TBC ბანკით", icon: "🏦" },
  { id: "bog", name: "BOG Pay", description: "გადაიხადეთ საქართველოს ბანკით", icon: "🏛️" },
];

export default function Booking() {
  const { id } = useParams();
  const [selectedPayment, setSelectedPayment] = useState("payge");
  const [selectedDate, setSelectedDate] = useState("March 17, 2026");
  const [selectedTime, setSelectedTime] = useState("14:00");

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <Link to={`/tutor/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to tutor profile
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-6">Book Your Lesson</h1>

          {/* Lesson Summary */}
          <div className="rounded-xl border bg-card p-5 card-shadow mb-6">
            <h2 className="font-semibold mb-4">Lesson Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{selectedDate}</p>
                  <p className="text-xs text-muted-foreground">Date</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium tabular-nums">{selectedTime} - {parseInt(selectedTime) + 1}:00</p>
                  <p className="text-xs text-muted-foreground">Time (60 min)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-xl border bg-card p-5 card-shadow mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </h2>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                    selectedPayment === method.id
                      ? "border-primary bg-primary-light"
                      : "hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                  <div className={`ml-auto h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPayment === method.id ? "border-primary" : "border-muted"
                  }`}>
                    {selectedPayment === method.id && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border bg-card p-5 card-shadow mb-6">
            <h2 className="font-semibold mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lesson (60 min)</span>
                <span className="font-medium tabular-nums">₾85.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee</span>
                <span className="font-medium tabular-nums">₾6.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total</span>
                <span className="tabular-nums">₾91.00</span>
              </div>
            </div>
          </div>

          <Button className="w-full hero-gradient text-primary-foreground border-0 h-12 text-base font-semibold">
            Complete Booking
          </Button>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Secure payment · Money-back guarantee
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
