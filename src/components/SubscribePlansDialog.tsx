import { forwardRef, useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Crown, MessageCircleMore } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WEEKLY_OPTIONS = [1, 2, 3, 4, 5] as const;
const LOCALES = {
  en: "en-US",
  ka: "ka-GE",
  ru: "ru-RU",
} as const;

interface SubscribePlansDialogProps {
  buttonClassName?: string;
  buttonSize?: ButtonProps["size"];
  buttonVariant?: ButtonProps["variant"];
}

function replaceTokens(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(String(value)),
    template,
  );
}

function normalizeCurrency(currency?: string | null) {
  if (!currency) return "₾";
  return currency === "GEL" ? "₾" : currency;
}

export function SubscribePlansDialog({
  buttonClassName,
  buttonSize = "sm",
  buttonVariant = "default",
}: SubscribePlansDialogProps) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedWeekly, setSelectedWeekly] = useState<number>(3);
  const [pricePerLesson, setPricePerLesson] = useState(25);
  const [currency, setCurrency] = useState("₾");
  const [tutorName, setTutorName] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;

    let ignore = false;

    const loadRecentBooking = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("price_amount, currency, tutor_name")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (ignore) return;

      const booking = data?.[0];
      if (booking) {
        setPricePerLesson(Number(booking.price_amount) || 25);
        setCurrency(normalizeCurrency(booking.currency));
        setTutorName(booking.tutor_name ?? null);
      } else {
        setPricePerLesson(25);
        setCurrency("₾");
        setTutorName(null);
      }
    };

    void loadRecentBooking();

    return () => {
      ignore = true;
    };
  }, [open, user]);

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setSelectedWeekly(3);
    }
  }, [open]);

  const formatMoney = (amount: number) => {
    const hasDecimals = amount % 1 !== 0;
    return `${currency}${new Intl.NumberFormat(LOCALES[lang], {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const plans = useMemo(
    () =>
      WEEKLY_OPTIONS.map((weekly) => ({
        weekly,
        monthlyLessons: weekly * 4,
        totalMonthlyPrice: weekly * 4 * pricePerLesson,
        isPopular: weekly === 3,
        label: t(`subscribe.package${weekly}`),
      })),
    [pricePerLesson, t],
  );

  const selectedPlan = plans.find((plan) => plan.weekly === selectedWeekly) ?? plans[2];
  const benefits = [
    t("subscribe.benefitSchedule"),
    t("subscribe.benefitTutor"),
    t("subscribe.benefitCancel"),
    t("subscribe.benefitDuration"),
  ];
  const faqItems = [
    {
      key: "schedule",
      question: t("subscribe.faqScheduleQ"),
      answer: t("subscribe.faqScheduleA"),
    },
    {
      key: "tutor",
      question: t("subscribe.faqTutorQ"),
      answer: t("subscribe.faqTutorA"),
    },
    {
      key: "cancel",
      question: t("subscribe.faqCancelQ"),
      answer: t("subscribe.faqCancelA"),
    },
    {
      key: "renewal",
      question: t("subscribe.faqRenewalQ"),
      answer: t("subscribe.faqRenewalA"),
    },
  ];

  return (
    <>
      <Button variant={buttonVariant} size={buttonSize} className={buttonClassName} onClick={() => setOpen(true)}>
        <Crown className="h-4 w-4" />
        {t("dash.subscribe")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-border/70 bg-card p-0 card-shadow">
          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-5 px-6 py-12 text-center sm:px-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MessageCircleMore className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-bold">{t("subscribe.requestSentTitle")}</DialogTitle>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {t("subscribe.requestSentMessage")}
                </p>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary-hover" onClick={() => setOpen(false)}>
                {t("subscribe.close")}
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
                <DialogHeader className="space-y-2 text-left">
                  <DialogTitle className="text-2xl font-bold">{t("subscribe.title")}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {t("subscribe.subtitle")}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3">
                  {plans.map((plan) => {
                    const isActive = plan.weekly === selectedWeekly;
                    return (
                      <button
                        key={plan.weekly}
                        type="button"
                        onClick={() => setSelectedWeekly(plan.weekly)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          isActive
                            ? "border-primary bg-primary/10 elevated-shadow"
                            : "border-border bg-background/40 hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-foreground">{plan.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {replaceTokens(t("subscribe.lessonsPerMonth"), { count: plan.monthlyLessons })}
                            </p>
                          </div>
                          {plan.isPopular && (
                            <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                              {t("subscribe.popular")}
                            </Badge>
                          )}
                        </div>

                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                          <div className="rounded-xl bg-secondary/35 px-3 py-2">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              {t("subscribe.pricePerLesson")}
                            </p>
                            <p className="mt-1 font-semibold text-foreground">{formatMoney(pricePerLesson)}</p>
                          </div>
                          <div className="rounded-xl bg-secondary/35 px-3 py-2">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              {t("subscribe.totalMonthlyPrice")}
                            </p>
                            <p className="mt-1 font-semibold text-foreground">{formatMoney(plan.totalMonthlyPrice)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(true)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
                  >
                    {t("subscribe.howPlansWork")}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary-hover"
                    onClick={() => setSubmitted(true)}
                  >
                    {t("subscribe.continue")}
                  </Button>
                </div>
              </div>

              <div className="border-t border-border/60 bg-background/55 px-6 py-6 sm:px-8 sm:py-8 lg:border-l lg:border-t-0">
                <div className="rounded-3xl border border-border/60 bg-card/90 p-5 card-glow">
                  <p className="mb-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {t("subscribe.benefitsTitle")}
                  </p>
                  <div className="space-y-3">
                    {benefits.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-3 rounded-2xl bg-secondary/30 px-3 py-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                        <p className="text-sm text-foreground">{benefit}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {selectedPlan.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {formatMoney(selectedPlan.totalMonthlyPrice)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {replaceTokens(t("subscribe.lessonsPerMonth"), { count: selectedPlan.monthlyLessons })}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {tutorName
                        ? replaceTokens(t("subscribe.rateHintWithTutor"), { name: tutorName.split(" ")[0] })
                        : t("subscribe.rateHint")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="max-w-2xl border-border/70 bg-card p-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-bold">{t("subscribe.faqTitle")}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t("subscribe.subtitle")}
            </DialogDescription>
          </DialogHeader>

          <Accordion type="single" collapsible className="mt-4 w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.key} value={item.key} className="border-border/70">
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </DialogContent>
      </Dialog>
    </>
  );
}
