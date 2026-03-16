import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getLocaleForLanguage } from "@/lib/localization";
import { Loader2, Download, Copy, Save, RefreshCw, Trash2, Eye, BookOpen, Sparkles } from "lucide-react";
import { Navigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface LessonPlan {
  title: string;
  objectives: string[];
  materials: string[];
  warmUp: { duration: string; activity: string };
  mainContent: { step: string; title: string; description: string; duration: string }[];
  practiceActivities: { title: string; description: string; duration: string }[];
  assessment: string;
  homework: string;
  tutorTips: string[];
  totalEstimatedTime: string;
}

interface SavedPlan {
  id: string;
  subject: string;
  student_level: string;
  duration: string;
  plan_title: string | null;
  plan_content: string;
  language: string;
  created_at: string;
}

const labels: Record<string, Record<string, string>> = {
  en: {
    pageTitle: "AI Lesson Plan Generator",
    pageDesc: "Generate professional, detailed lesson plans in seconds using AI.",
    generatorTab: "Generator",
    subject: "Subject",
    studentLevel: "Student Age / Level",
    duration: "Lesson Duration",
    numStudents: "Number of Students",
    learningGoals: "Learning Goals",
    learningGoalsPlaceholder: "Describe what students should achieve...",
    weakPoints: "Student Weak Points",
    weakPointsPlaceholder: "Describe areas where students struggle...",
    planLanguage: "Language of Lesson Plan",
    subjectPlaceholder: "Select subject",
    studentLevelPlaceholder: "Select age or level",
    durationPlaceholder: "Select duration",
    numStudentsPlaceholder: "Select student count",
    generate: "Generate Lesson Plan",
    generating: "Generating...",
    objectives: "Learning Objectives",
    materials: "Materials Needed",
    warmUp: "Warm-Up Activity",
    mainContent: "Main Teaching Content",
    practice: "Practice Activities",
    assessment: "Assessment Method",
    homework: "Homework Assignment",
    tutorTips: "Tips for Tutor",
    totalTime: "Total Estimated Time",
    downloadPdf: "Download PDF",
    copyClipboard: "Copy to Clipboard",
    savePlan: "Save to My Plans",
    regenerate: "Regenerate",
    savedPlans: "My Saved Plans",
    backToSavedPlans: "Back to saved plans",
    noSavedPlans: "No saved plans yet. Generate and save your first lesson plan!",
    fillRequired: "Please fill all required fields.",
    generationFailed: "Generation failed. Please try again.",
    copied: "Copied to clipboard!",
    saved: "Plan saved successfully!",
    deleted: "Plan deleted!",
    view: "View",
    delete: "Delete",
    step: "Step",
    loginRequired: "Please log in to access the Lesson Plan Generator.",
  },
  ka: {
    pageTitle: "AI გაკვეთილის გეგმის გენერატორი",
    pageDesc: "შექმენით პროფესიონალური, დეტალური გაკვეთილის გეგმები წამებში AI-ის დახმარებით.",
    generatorTab: "გენერატორი",
    subject: "საგანი",
    studentLevel: "მოსწავლის ასაკი / დონე",
    duration: "გაკვეთილის ხანგრძლივობა",
    numStudents: "მოსწავლეთა რაოდენობა",
    learningGoals: "სწავლის მიზნები",
    learningGoalsPlaceholder: "აღწერეთ რა უნდა მიაღწიონ მოსწავლეებმა...",
    weakPoints: "მოსწავლის სუსტი მხარეები",
    weakPointsPlaceholder: "აღწერეთ სფეროები, სადაც მოსწავლეს უჭირს...",
    planLanguage: "გეგმის ენა",
    subjectPlaceholder: "აირჩიეთ საგანი",
    studentLevelPlaceholder: "აირჩიეთ ასაკი ან დონე",
    durationPlaceholder: "აირჩიეთ ხანგრძლივობა",
    numStudentsPlaceholder: "აირჩიეთ მოსწავლეთა რაოდენობა",
    generate: "გეგმის გენერაცია",
    generating: "გენერაცია...",
    objectives: "სწავლის მიზნები",
    materials: "საჭირო მასალები",
    warmUp: "მოსამზადებელი აქტივობა",
    mainContent: "ძირითადი სასწავლო მასალა",
    practice: "პრაქტიკული აქტივობები",
    assessment: "შეფასების მეთოდი",
    homework: "საშინაო დავალება",
    tutorTips: "რჩევები რეპეტიტორისთვის",
    totalTime: "სავარაუდო დრო",
    downloadPdf: "PDF ჩამოტვირთვა",
    copyClipboard: "კოპირება",
    savePlan: "შენახვა",
    regenerate: "ხელახლა გენერაცია",
    savedPlans: "ჩემი შენახული გეგმები",
    backToSavedPlans: "უკან შენახულ გეგმებზე",
    noSavedPlans: "ჯერ არ გაქვთ შენახული გეგმები. შექმენით და შეინახეთ პირველი გეგმა!",
    fillRequired: "გთხოვთ შეავსოთ ყველა სავალდებულო ველი.",
    generationFailed: "გეგმის გენერაცია ვერ მოხერხდა. სცადეთ თავიდან.",
    copied: "კოპირებულია!",
    saved: "გეგმა შენახულია!",
    deleted: "გეგმა წაშლილია!",
    view: "ნახვა",
    delete: "წაშლა",
    step: "ნაბიჯი",
    loginRequired: "გთხოვთ გაიაროთ ავტორიზაცია გეგმის გენერატორზე წვდომისთვის.",
  },
  ru: {
    pageTitle: "AI Генератор Плана Урока",
    pageDesc: "Создавайте профессиональные, детальные планы уроков за секунды с помощью AI.",
    generatorTab: "Генератор",
    subject: "Предмет",
    studentLevel: "Возраст / Уровень ученика",
    duration: "Длительность урока",
    numStudents: "Количество учеников",
    learningGoals: "Учебные цели",
    learningGoalsPlaceholder: "Опишите, чего должны достичь ученики...",
    weakPoints: "Слабые стороны ученика",
    weakPointsPlaceholder: "Опишите области, в которых ученик испытывает трудности...",
    planLanguage: "Язык плана урока",
    subjectPlaceholder: "Выберите предмет",
    studentLevelPlaceholder: "Выберите возраст или уровень",
    durationPlaceholder: "Выберите длительность",
    numStudentsPlaceholder: "Выберите количество учеников",
    generate: "Сгенерировать план",
    generating: "Генерация...",
    objectives: "Учебные цели",
    materials: "Необходимые материалы",
    warmUp: "Разминка",
    mainContent: "Основной учебный материал",
    practice: "Практические задания",
    assessment: "Метод оценки",
    homework: "Домашнее задание",
    tutorTips: "Советы репетитору",
    totalTime: "Ориентировочное время",
    downloadPdf: "Скачать PDF",
    copyClipboard: "Копировать",
    savePlan: "Сохранить",
    regenerate: "Перегенерировать",
    savedPlans: "Мои сохранённые планы",
    backToSavedPlans: "Назад к сохранённым планам",
    noSavedPlans: "Сохранённых планов пока нет. Создайте и сохраните свой первый план!",
    fillRequired: "Пожалуйста, заполните все обязательные поля.",
    generationFailed: "Не удалось сгенерировать план. Попробуйте ещё раз.",
    copied: "Скопировано!",
    saved: "План сохранён!",
    deleted: "План удалён!",
    view: "Просмотр",
    delete: "Удалить",
    step: "Шаг",
    loginRequired: "Пожалуйста, войдите в систему для доступа к генератору планов.",
  },
};

const optionsByLanguage: Record<string, { subjects: string[]; levels: string[]; durations: string[]; studentCounts: string[] }> = {
  en: {
    subjects: ["Math", "English", "Science", "History", "Georgian", "Russian", "SAT Prep", "IELTS", "National Exam Prep", "Other"],
    levels: ["6-8", "9-11", "12-14", "15-17", "University", "Adult/Professional"],
    durations: ["30 min", "45 min", "60 min", "90 min"],
    studentCounts: ["1", "2-5", "6-10", "10+"],
  },
  ka: {
    subjects: ["მათემატიკა", "ინგლისური", "მეცნიერება", "ისტორია", "ქართული", "რუსული", "SAT მოსამზადებელი", "IELTS", "ეროვნული გამოცდებისთვის მომზადება", "სხვა"],
    levels: ["6-8", "9-11", "12-14", "15-17", "უნივერსიტეტი", "ზრდასრული / პროფესიული"],
    durations: ["30 წთ", "45 წთ", "60 წთ", "90 წთ"],
    studentCounts: ["1", "2-5", "6-10", "10+"],
  },
  ru: {
    subjects: ["Математика", "Английский", "Наука", "История", "Грузинский", "Русский", "Подготовка к SAT", "IELTS", "Подготовка к национальным экзаменам", "Другое"],
    levels: ["6-8", "9-11", "12-14", "15-17", "Университет", "Взрослый / Профессиональный"],
    durations: ["30 мин", "45 мин", "60 мин", "90 мин"],
    studentCounts: ["1", "2-5", "6-10", "10+"],
  },
};

const planLanguages = [
  { value: "ka", label: "ქართული" },
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

export default function LessonPlanner() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const planRef = useRef<HTMLDivElement>(null);

  const l = labels[lang] || labels.en;
  const options = optionsByLanguage[lang] || optionsByLanguage.en;

  const [subject, setSubject] = useState("");
  const [studentLevel, setStudentLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [numStudents, setNumStudents] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [weakPoints, setWeakPoints] = useState("");
  const [planLang, setPlanLang] = useState<string>(lang);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [viewingPlan, setViewingPlan] = useState<LessonPlan | null>(null);
  const [tab, setTab] = useState<"generator" | "saved">("generator");

  useEffect(() => {
    if (user) loadSavedPlans();
  }, [user]);

  const loadSavedPlans = async () => {
    const { data } = await supabase
      .from("lesson_plans")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSavedPlans(data as SavedPlan[]);
  };

  const handleGenerate = async () => {
    if (!subject || !studentLevel || !duration || !numStudents) {
      toast({ title: "⚠️", description: l.fillRequired, variant: "destructive" });
      return;
    }
    setGenerating(true);
    setPlan(null);
    setViewingPlan(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-lesson-plan", {
        body: { subject, studentLevel, duration, numStudents, learningGoals, weakPoints, language: planLang },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPlan(data.plan);
    } catch (e: any) {
      toast({ title: "⚠️", description: e.message || l.generationFailed, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    const activePlan = viewingPlan || plan;
    if (!activePlan) return;
    const text = planToText(activePlan);
    navigator.clipboard.writeText(text);
    toast({ title: "✓", description: l.copied });
  };

  const handleSave = async () => {
    if (!plan || !user) return;
    const { error } = await supabase.from("lesson_plans").insert({
      tutor_id: user.id,
      subject,
      student_level: studentLevel,
      duration,
      num_students: numStudents,
      learning_goals: learningGoals,
      weak_points: weakPoints,
      language: planLang,
      plan_content: JSON.stringify(plan),
      plan_title: plan.title,
    });
    if (!error) {
      toast({ title: "✓", description: l.saved });
      loadSavedPlans();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("lesson_plans").delete().eq("id", id);
    toast({ title: "✓", description: l.deleted });
    loadSavedPlans();
  };

  const handleDownloadPdf = async () => {
    if (!planRef.current) return;
    const canvas = await html2canvas(planRef.current, { scale: 2, backgroundColor: "#1a0533" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`lesson-plan-${Date.now()}.pdf`);
  };

  const planToText = (p: LessonPlan) => {
    let t = `${p.title}\n\n`;
    t += `${l.objectives}:\n${p.objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\n`;
    t += `${l.materials}:\n${p.materials.map((m) => `• ${m}`).join("\n")}\n\n`;
    t += `${l.warmUp} (${p.warmUp.duration}):\n${p.warmUp.activity}\n\n`;
    t += `${l.mainContent}:\n${p.mainContent.map((s) => `${l.step} ${s.step}: ${s.title} (${s.duration})\n${s.description}`).join("\n\n")}\n\n`;
    t += `${l.practice}:\n${p.practiceActivities.map((a) => `• ${a.title} (${a.duration}): ${a.description}`).join("\n")}\n\n`;
    t += `${l.assessment}:\n${p.assessment}\n\n`;
    t += `${l.homework}:\n${p.homework}\n\n`;
    t += `${l.tutorTips}:\n${p.tutorTips.map((tip) => `💡 ${tip}`).join("\n")}\n\n`;
    t += `${l.totalTime}: ${p.totalEstimatedTime}`;
    return t;
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const activePlan = viewingPlan || plan;

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">{l.pageTitle}</h1>
            <p className="text-muted-foreground">{l.pageDesc}</p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex justify-center gap-2">
            <Button
              variant={tab === "generator" ? "default" : "secondary"}
              onClick={() => { setTab("generator"); setViewingPlan(null); }}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" /> {l.generatorTab}
            </Button>
            <Button
              variant={tab === "saved" ? "default" : "secondary"}
              onClick={() => setTab("saved")}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" /> {l.savedPlans}
            </Button>
          </div>

          {tab === "generator" && (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Form */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">{l.generate}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">{l.subject} *</label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger><SelectValue placeholder={l.subjectPlaceholder} /></SelectTrigger>
                        <SelectContent>{options.subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">{l.studentLevel} *</label>
                      <Select value={studentLevel} onValueChange={setStudentLevel}>
                        <SelectTrigger><SelectValue placeholder={l.studentLevelPlaceholder} /></SelectTrigger>
                        <SelectContent>{options.levels.map((lv) => <SelectItem key={lv} value={lv}>{lv}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">{l.duration} *</label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger><SelectValue placeholder={l.durationPlaceholder} /></SelectTrigger>
                        <SelectContent>{options.durations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">{l.numStudents} *</label>
                      <Select value={numStudents} onValueChange={setNumStudents}>
                        <SelectTrigger><SelectValue placeholder={l.numStudentsPlaceholder} /></SelectTrigger>
                        <SelectContent>{options.studentCounts.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">{l.learningGoals}</label>
                    <Textarea
                      value={learningGoals}
                      onChange={(e) => setLearningGoals(e.target.value)}
                      placeholder={l.learningGoalsPlaceholder}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">{l.weakPoints}</label>
                    <Textarea
                      value={weakPoints}
                      onChange={(e) => setWeakPoints(e.target.value)}
                      placeholder={l.weakPointsPlaceholder}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">{l.planLanguage}</label>
                    <Select value={planLang} onValueChange={setPlanLang}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {planLanguages.map((pl) => <SelectItem key={pl.value} value={pl.value}>{pl.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleGenerate} disabled={generating} className="w-full gap-2" size="lg">
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {generating ? l.generating : l.generate}
                  </Button>
                </CardContent>
              </Card>

              {/* Plan Display */}
              <div>
                {activePlan ? (
                  <div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Button onClick={handleDownloadPdf} variant="secondary" size="sm" className="gap-1">
                        <Download className="h-3 w-3" /> {l.downloadPdf}
                      </Button>
                      <Button onClick={handleCopy} variant="secondary" size="sm" className="gap-1">
                        <Copy className="h-3 w-3" /> {l.copyClipboard}
                      </Button>
                      {!viewingPlan && (
                        <Button onClick={handleSave} variant="secondary" size="sm" className="gap-1">
                          <Save className="h-3 w-3" /> {l.savePlan}
                        </Button>
                      )}
                      {!viewingPlan && (
                        <Button onClick={handleGenerate} variant="outline" size="sm" className="gap-1" disabled={generating}>
                          <RefreshCw className="h-3 w-3" /> {l.regenerate}
                        </Button>
                      )}
                    </div>

                    <div ref={planRef}>
                      <Card className="border-primary/30 bg-card/80">
                        <CardHeader className="border-b border-border/50 pb-4">
                          <CardTitle className="text-2xl text-primary">{activePlan.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{l.totalTime}: {activePlan.totalEstimatedTime}</p>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          {/* Objectives */}
                          <section>
                            <h3 className="mb-2 text-lg font-semibold text-primary">{l.objectives}</h3>
                            <ul className="space-y-1">
                              {activePlan.objectives.map((obj, i) => (
                                <li key={i} className="flex gap-2 text-sm text-foreground">
                                  <span className="text-primary">•</span> {obj}
                                </li>
                              ))}
                            </ul>
                          </section>

                          {/* Materials */}
                          <section>
                            <h3 className="mb-2 text-lg font-semibold text-primary">{l.materials}</h3>
                            <ul className="space-y-1">
                              {activePlan.materials.map((m, i) => (
                                <li key={i} className="text-sm text-foreground">📋 {m}</li>
                              ))}
                            </ul>
                          </section>

                          {/* Warm Up */}
                          <section className="rounded-lg bg-accent/30 p-4">
                            <h3 className="mb-1 text-lg font-semibold text-primary">{l.warmUp}</h3>
                            <p className="mb-1 text-xs text-muted-foreground">{activePlan.warmUp.duration}</p>
                            <p className="text-sm text-foreground">{activePlan.warmUp.activity}</p>
                          </section>

                          {/* Main Content */}
                          <section>
                            <h3 className="mb-3 text-lg font-semibold text-primary">{l.mainContent}</h3>
                            <div className="space-y-3">
                              {activePlan.mainContent.map((step, i) => (
                                <div key={i} className="rounded-lg border border-border/50 p-3">
                                  <div className="mb-1 flex items-center justify-between">
                                    <h4 className="font-medium text-foreground">{l.step} {step.step}: {step.title}</h4>
                                    <span className="text-xs text-muted-foreground">{step.duration}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Practice */}
                          <section>
                            <h3 className="mb-3 text-lg font-semibold text-primary">{l.practice}</h3>
                            <div className="space-y-2">
                              {activePlan.practiceActivities.map((a, i) => (
                                <div key={i} className="rounded-lg bg-secondary/50 p-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-foreground">{a.title}</h4>
                                    <span className="text-xs text-muted-foreground">{a.duration}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{a.description}</p>
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Assessment */}
                          <section>
                            <h3 className="mb-2 text-lg font-semibold text-primary">{l.assessment}</h3>
                            <p className="text-sm text-foreground">{activePlan.assessment}</p>
                          </section>

                          {/* Homework */}
                          <section className="rounded-lg bg-accent/30 p-4">
                            <h3 className="mb-2 text-lg font-semibold text-primary">{l.homework}</h3>
                            <p className="text-sm text-foreground">{activePlan.homework}</p>
                          </section>

                          {/* Tutor Tips */}
                          <section>
                            <h3 className="mb-2 text-lg font-semibold text-primary">{l.tutorTips}</h3>
                            <ul className="space-y-1">
                              {activePlan.tutorTips.map((tip, i) => (
                                <li key={i} className="text-sm text-foreground">💡 {tip}</li>
                              ))}
                            </ul>
                          </section>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="flex min-h-[400px] items-center justify-center border-dashed border-border/50">
                    <div className="text-center text-muted-foreground">
                      <Sparkles className="mx-auto mb-4 h-12 w-12 opacity-30" />
                      <p>{l.pageDesc}</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Saved Plans Tab */}
          {tab === "saved" && (
            <div>
              {viewingPlan ? (
                <div className="mx-auto max-w-3xl">
                  <Button variant="ghost" onClick={() => setViewingPlan(null)} className="mb-4">
                    ← {l.backToSavedPlans}
                  </Button>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Button onClick={handleCopy} variant="secondary" size="sm" className="gap-1">
                      <Copy className="h-3 w-3" /> {l.copyClipboard}
                    </Button>
                  </div>
                  <div ref={planRef}>
                    <PlanCard plan={viewingPlan} l={l} />
                  </div>
                </div>
              ) : savedPlans.length === 0 ? (
                <Card className="mx-auto max-w-lg border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-30" />
                    <p>{l.noSavedPlans}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
                  {savedPlans.map((sp) => (
                    <Card key={sp.id} className="border-border/50">
                      <CardContent className="p-4">
                        <h3 className="mb-1 font-semibold text-foreground">{sp.plan_title || sp.subject}</h3>
                        <p className="mb-1 text-xs text-muted-foreground">
                          {sp.subject} • {sp.student_level} • {sp.duration}
                        </p>
                        <p className="mb-3 text-xs text-muted-foreground">
                          {new Date(sp.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1"
                            onClick={() => {
                              try {
                                setViewingPlan(JSON.parse(sp.plan_content));
                              } catch { /* ignore */ }
                            }}
                          >
                            <Eye className="h-3 w-3" /> {l.view}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => handleDelete(sp.id)}
                          >
                            <Trash2 className="h-3 w-3" /> {l.delete}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function PlanCard({ plan, l }: { plan: LessonPlan; l: Record<string, string> }) {
  return (
    <Card className="border-primary/30 bg-card/80">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="text-2xl text-primary">{plan.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{l.totalTime}: {plan.totalEstimatedTime}</p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <section>
          <h3 className="mb-2 text-lg font-semibold text-primary">{l.objectives}</h3>
          <ul className="space-y-1">{plan.objectives.map((o, i) => <li key={i} className="flex gap-2 text-sm text-foreground"><span className="text-primary">•</span> {o}</li>)}</ul>
        </section>
        <section>
          <h3 className="mb-2 text-lg font-semibold text-primary">{l.materials}</h3>
          <ul className="space-y-1">{plan.materials.map((m, i) => <li key={i} className="text-sm text-foreground">📋 {m}</li>)}</ul>
        </section>
        <section className="rounded-lg bg-accent/30 p-4">
          <h3 className="mb-1 text-lg font-semibold text-primary">{l.warmUp}</h3>
          <p className="mb-1 text-xs text-muted-foreground">{plan.warmUp.duration}</p>
          <p className="text-sm text-foreground">{plan.warmUp.activity}</p>
        </section>
        <section>
          <h3 className="mb-3 text-lg font-semibold text-primary">{l.mainContent}</h3>
          <div className="space-y-3">{plan.mainContent.map((s, i) => (
            <div key={i} className="rounded-lg border border-border/50 p-3">
              <div className="mb-1 flex items-center justify-between">
                <h4 className="font-medium text-foreground">{l.step} {s.step}: {s.title}</h4>
                <span className="text-xs text-muted-foreground">{s.duration}</span>
              </div>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}</div>
        </section>
        <section>
          <h3 className="mb-3 text-lg font-semibold text-primary">{l.practice}</h3>
          <div className="space-y-2">{plan.practiceActivities.map((a, i) => (
            <div key={i} className="rounded-lg bg-secondary/50 p-3">
              <div className="flex items-center justify-between"><h4 className="font-medium text-foreground">{a.title}</h4><span className="text-xs text-muted-foreground">{a.duration}</span></div>
              <p className="text-sm text-muted-foreground">{a.description}</p>
            </div>
          ))}</div>
        </section>
        <section><h3 className="mb-2 text-lg font-semibold text-primary">{l.assessment}</h3><p className="text-sm text-foreground">{plan.assessment}</p></section>
        <section className="rounded-lg bg-accent/30 p-4"><h3 className="mb-2 text-lg font-semibold text-primary">{l.homework}</h3><p className="text-sm text-foreground">{plan.homework}</p></section>
        <section><h3 className="mb-2 text-lg font-semibold text-primary">{l.tutorTips}</h3><ul className="space-y-1">{plan.tutorTips.map((t, i) => <li key={i} className="text-sm text-foreground">💡 {t}</li>)}</ul></section>
      </CardContent>
    </Card>
  );
}
